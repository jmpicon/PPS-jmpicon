"""
Servidor de juego Kahoot multijugador en tiempo real vía WebSocket.
"""
import asyncio
import json
import random
import string
import time
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/game", tags=["game"])

_games: dict[str, "GameRoom"] = {}
QUESTION_TIME = 20  # seconds per question


def _gen_code() -> str:
    chars = string.ascii_uppercase.replace("O", "").replace("I", "") + string.digits.replace("0", "")
    while True:
        code = "".join(random.choices(chars, k=6))
        if code not in _games:
            return code


class Player:
    def __init__(self, ws: WebSocket, nickname: str):
        self.ws = ws
        self.nickname = nickname
        self.score = 0
        self.streak = 0
        self.answered = False

    def to_dict(self):
        return {"nickname": self.nickname, "score": self.score}


class GameRoom:
    def __init__(self, code: str, module_slug: str, module_title: str, questions: list):
        self.code = code
        self.module_slug = module_slug
        self.module_title = module_title
        self.questions = questions
        self.host_ws: WebSocket | None = None
        self.players: dict[str, Player] = {}
        self.state = "waiting"   # waiting | question | answer | finished
        self.current_q = -1
        self.question_start: float = 0
        self._timer: asyncio.Task | None = None

    def leaderboard(self) -> list:
        return sorted(
            [p.to_dict() for p in self.players.values()],
            key=lambda x: x["score"],
            reverse=True,
        )

    async def _send(self, ws: WebSocket, msg: dict):
        try:
            await ws.send_text(json.dumps(msg))
        except Exception:
            pass

    async def broadcast(self, msg: dict):
        data = json.dumps(msg)
        if self.host_ws:
            try:
                await self.host_ws.send_text(data)
            except Exception:
                pass
        for p in list(self.players.values()):
            try:
                await p.ws.send_text(data)
            except Exception:
                pass

    async def send_host(self, msg: dict):
        if self.host_ws:
            await self._send(self.host_ws, msg)

    async def send_player(self, nickname: str, msg: dict):
        p = self.players.get(nickname)
        if p:
            await self._send(p.ws, msg)

    async def start_question(self):
        self.current_q += 1
        if self.current_q >= len(self.questions):
            await self._finish()
            return

        self.state = "question"
        self.question_start = time.monotonic()

        for p in self.players.values():
            p.answered = False

        q = self.questions[self.current_q]

        # Host gets correct answer too
        await self.send_host({
            "type": "question",
            "index": self.current_q,
            "total": len(self.questions),
            "q": q["q"],
            "options": q["options"],
            "correct": q["correct"],
            "timeLeft": QUESTION_TIME,
        })

        # Players don't get correct answer
        for nickname in list(self.players):
            await self.send_player(nickname, {
                "type": "question",
                "index": self.current_q,
                "total": len(self.questions),
                "q": q["q"],
                "options": q["options"],
                "timeLeft": QUESTION_TIME,
            })

        if self._timer:
            self._timer.cancel()
        self._timer = asyncio.create_task(self._auto_reveal())

    async def _auto_reveal(self):
        await asyncio.sleep(QUESTION_TIME)
        if self.state == "question":
            await self.reveal()

    async def reveal(self):
        if self.state != "question":
            return
        if self._timer:
            self._timer.cancel()
            self._timer = None
        self.state = "answer"

        q = self.questions[self.current_q]
        is_last = self.current_q >= len(self.questions) - 1

        for p in self.players.values():
            if not p.answered:
                p.streak = 0

        lb = self.leaderboard()
        await self.broadcast({
            "type": "answer_reveal",
            "correct": q["correct"],
            "explanation": q.get("explanation", ""),
            "leaderboard": lb,
            "isLast": is_last,
        })

    async def _finish(self):
        self.state = "finished"
        await self.broadcast({"type": "finished", "leaderboard": self.leaderboard()})
        asyncio.create_task(self._cleanup())

    async def _cleanup(self):
        await asyncio.sleep(600)
        _games.pop(self.code, None)

    def compute_score(self, time_taken: float, streak: int) -> int:
        if time_taken >= QUESTION_TIME:
            return 0
        base = 1000
        time_bonus = int(500 * (1 - time_taken / QUESTION_TIME))
        streak_bonus = min(streak, 5) * 100
        return base + time_bonus + streak_bonus


@router.websocket("/host")
async def ws_host(ws: WebSocket):
    await ws.accept()
    room: GameRoom | None = None
    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            t = msg.get("type")

            if t == "create":
                code = _gen_code()
                room = GameRoom(
                    code=code,
                    module_slug=msg.get("moduleSlug", ""),
                    module_title=msg.get("moduleTitle", ""),
                    questions=msg.get("questions", []),
                )
                room.host_ws = ws
                _games[code] = room
                logger.info("Game created: %s (%s questions)", code, len(room.questions))
                await ws.send_text(json.dumps({"type": "created", "code": code}))

            elif t == "start" and room and room.state == "waiting":
                if not room.players:
                    await ws.send_text(json.dumps({"type": "error", "msg": "Necesitas al menos 1 jugador"}))
                    continue
                await room.start_question()

            elif t == "next" and room and room.state == "answer":
                await room.start_question()

            elif t == "reveal" and room and room.state == "question":
                await room.reveal()

            elif t == "end" and room:
                await room._finish()

    except WebSocketDisconnect:
        if room:
            room.host_ws = None
            await room.broadcast({"type": "host_disconnected"})
    except Exception as e:
        logger.error("Host WS error: %s", e)


@router.websocket("/play")
async def ws_play(ws: WebSocket):
    await ws.accept()
    room: GameRoom | None = None
    player: Player | None = None
    try:
        while True:
            raw = await ws.receive_text()
            msg = json.loads(raw)
            t = msg.get("type")

            if t == "join":
                code = msg.get("code", "").strip().upper()
                nickname = msg.get("nickname", "").strip()[:20]

                if not code or not nickname:
                    await ws.send_text(json.dumps({"type": "error", "msg": "Código y nombre requeridos"}))
                    continue

                room = _games.get(code)
                if not room:
                    await ws.send_text(json.dumps({"type": "error", "msg": "Código de juego inválido"}))
                    continue
                if room.state != "waiting":
                    await ws.send_text(json.dumps({"type": "error", "msg": "La partida ya ha comenzado"}))
                    continue
                if nickname in room.players:
                    await ws.send_text(json.dumps({"type": "error", "msg": "Ese nombre ya está en uso"}))
                    continue

                player = Player(ws, nickname)
                room.players[nickname] = player

                await ws.send_text(json.dumps({
                    "type": "joined",
                    "nickname": nickname,
                    "moduleTitle": room.module_title,
                    "players": [p.nickname for p in room.players.values()],
                }))

                await room.send_host({
                    "type": "player_joined",
                    "players": [p.nickname for p in room.players.values()],
                })

            elif t == "answer" and room and player:
                if room.state != "question" or player.answered:
                    continue

                idx = msg.get("index")
                elapsed = time.monotonic() - room.question_start
                player.answered = True

                q = room.questions[room.current_q]
                correct = idx == q["correct"]

                if correct:
                    player.streak += 1
                    pts = room.compute_score(elapsed, player.streak)
                    player.score += pts
                else:
                    player.streak = 0
                    pts = 0

                await ws.send_text(json.dumps({
                    "type": "answer_result",
                    "correct": correct,
                    "points": pts,
                    "totalScore": player.score,
                }))

                answered = sum(1 for p in room.players.values() if p.answered)
                await room.send_host({
                    "type": "answer_progress",
                    "answered": answered,
                    "total": len(room.players),
                })

                # Auto-reveal when everyone has answered
                if answered == len(room.players):
                    await room.reveal()

    except WebSocketDisconnect:
        if room and player:
            room.players.pop(player.nickname, None)
            await room.send_host({
                "type": "player_left",
                "players": [p.nickname for p in room.players.values()],
            })
    except Exception as e:
        logger.error("Player WS error: %s", e)
