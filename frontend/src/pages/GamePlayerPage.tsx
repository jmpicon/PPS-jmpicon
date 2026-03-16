import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'join' | 'waiting' | 'question' | 'answered' | 'answer' | 'finished' | 'error'

interface Question { q: string; options: string[]; timeLeft: number; index: number; total: number }
interface Player { nickname: string; score: number }

const COLORS = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71']
const SHAPES = ['▲', '◆', '●', '■']
const COLOR_HOVER = ['rgba(231,76,60,0.8)', 'rgba(52,152,219,0.8)', 'rgba(243,156,18,0.8)', 'rgba(46,204,113,0.8)']

export default function GamePlayerPage() {
  const [params] = useSearchParams()
  const [phase, setPhase] = useState<Phase>('join')
  const [code, setCode] = useState(params.get('code') || '')
  const [nickname, setNickname] = useState('')
  const [errMsg, setErrMsg] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [moduleTitle, setModuleTitle] = useState('')
  const [question, setQuestion] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState(20)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [result, setResult] = useState<{ correct: boolean; points: number; totalScore: number } | null>(null)
  const [leaderboard, setLeaderboard] = useState<Player[]>([])
  const [myNickname, setMyNickname] = useState('')
  const [correctIdx, setCorrectIdx] = useState<number | null>(null)
  const [explanation, setExplanation] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const startTimer = (secs: number) => {
    stopTimer()
    let t = secs
    timerRef.current = setInterval(() => {
      t -= 1
      setTimeLeft(t)
      if (t <= 0) stopTimer()
    }, 1000)
  }

  const connectWs = () => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${window.location.host}/api/game/play`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', code: code.trim().toUpperCase(), nickname: nickname.trim() }))
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      switch (msg.type) {
        case 'joined':
          setMyNickname(msg.nickname)
          setModuleTitle(msg.moduleTitle || '')
          setPlayers(msg.players)
          setPhase('waiting')
          break
        case 'error':
          setErrMsg(msg.msg)
          break
        case 'question':
          setPhase('question')
          setQuestion(msg)
          setSelectedIdx(null)
          setResult(null)
          setCorrectIdx(null)
          setExplanation('')
          setTimeLeft(msg.timeLeft)
          startTimer(msg.timeLeft)
          break
        case 'answer_result':
          setPhase('answered')
          setResult({ correct: msg.correct, points: msg.points, totalScore: msg.totalScore })
          break
        case 'answer_reveal':
          stopTimer()
          setPhase('answer')
          setCorrectIdx(msg.correct)
          setExplanation(msg.explanation)
          setLeaderboard(msg.leaderboard)
          break
        case 'finished':
          stopTimer()
          setPhase('finished')
          setLeaderboard(msg.leaderboard)
          break
        case 'host_disconnected':
          setPhase('error')
          setErrMsg('El profesor ha desconectado la sesión.')
          break
      }
    }

    ws.onclose = () => {
      stopTimer()
      if (phase !== 'finished' && phase !== 'error') {
        setPhase('error')
        setErrMsg('Conexión perdida. Recarga la página.')
      }
    }
  }

  useEffect(() => {
    return () => { wsRef.current?.close(); stopTimer() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !nickname.trim()) { setErrMsg('Introduce el código y tu nombre'); return }
    setErrMsg('')
    connectWs()
  }

  const handleAnswer = (idx: number) => {
    if (phase !== 'question' || selectedIdx !== null) return
    setSelectedIdx(idx)
    wsRef.current?.send(JSON.stringify({ type: 'answer', index: idx }))
  }

  const myRank = leaderboard.findIndex(p => p.nickname === myNickname) + 1
  const myScore = leaderboard.find(p => p.nickname === myNickname)?.score ?? 0

  // ── JOIN ─────────────────────────────────────────────────────────────────────
  if (phase === 'join') return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎮</div>
          <h1 className="text-2xl font-black text-cyber-text">CursoPPS Kahoot</h1>
          <p className="text-cyber-muted text-sm mt-1">Introduce el código de tu profesor</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Código de juego (ej. ABC123)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl bg-cyber-card border border-cyber-border text-cyber-text text-center text-2xl font-mono font-black tracking-widest focus:outline-none focus:border-cyber-green"
          />
          <input
            type="text"
            placeholder="Tu nombre / alias"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl bg-cyber-card border border-cyber-border text-cyber-text text-center text-lg font-semibold focus:outline-none focus:border-cyber-green"
          />
          {errMsg && <p className="text-[#ff5555] text-sm text-center">{errMsg}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-black text-lg text-black"
            style={{ background: '#00ff88' }}
          >
            Unirse al juego
          </button>
        </form>
      </motion.div>
    </div>
  )

  // ── WAITING ──────────────────────────────────────────────────────────────────
  if (phase === 'waiting') return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
        <div className="text-5xl">✋</div>
        <h2 className="text-xl font-black text-cyber-text">¡Estás dentro!</h2>
        {moduleTitle && <p className="text-cyber-muted text-sm">{moduleTitle}</p>}
        <div className="px-6 py-3 rounded-2xl bg-cyber-card border border-cyber-border inline-block">
          <p className="text-cyber-muted text-xs mb-1">Tu nombre</p>
          <p className="text-2xl font-black text-cyber-green">{myNickname}</p>
        </div>
        <p className="text-cyber-muted text-sm">{players.length} jugador{players.length !== 1 ? 'es' : ''} conectado{players.length !== 1 ? 's' : ''}</p>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-cyber-green animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-xs text-cyber-muted">Esperando que el profesor inicie el juego…</p>
      </motion.div>
    </div>
  )

  // ── QUESTION ─────────────────────────────────────────────────────────────────
  if ((phase === 'question' || phase === 'answered') && question) return (
    <div className="min-h-screen bg-cyber-bg flex flex-col p-4">
      {/* Timer bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-cyber-muted font-mono">{question.index + 1}/{question.total}</span>
        <div className="flex-1 h-2 rounded-full bg-cyber-surface overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-cyber-green"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ ease: 'linear', duration: 1 }}
          />
        </div>
        <span className={`text-lg font-black font-mono ${timeLeft <= 5 ? 'text-[#ff5555]' : 'text-cyber-text'}`}>{timeLeft}</span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border">
          <p className="text-lg font-semibold text-cyber-text text-center">{question.q}</p>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {question.options.map((opt, i) => {
            const chosen = selectedIdx === i
            const locked = selectedIdx !== null
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={locked}
                className="rounded-2xl p-4 flex flex-col items-center gap-2 font-bold text-white transition-all text-sm"
                style={{
                  background: chosen ? COLORS[i] : locked ? COLORS[i] + '44' : COLOR_HOVER[i],
                  border: chosen ? `3px solid white` : '3px solid transparent',
                  transform: chosen ? 'scale(0.97)' : 'scale(1)',
                  opacity: locked && !chosen ? 0.5 : 1,
                }}
              >
                <span className="text-3xl">{SHAPES[i]}</span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl text-center"
              style={{ background: result.correct ? '#2ecc7133' : '#e74c3c33', border: `1px solid ${result.correct ? '#2ecc71' : '#e74c3c'}` }}
            >
              <p className="text-2xl mb-1">{result.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'}</p>
              {result.correct && (
                <p className="text-lg font-black text-cyber-green">+{result.points} pts · Total: {result.totalScore}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  // ── ANSWER REVEAL ────────────────────────────────────────────────────────────
  if (phase === 'answer' && question) return (
    <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center p-4 gap-6">
      <div className="w-full max-w-sm space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl flex flex-col items-center gap-1 font-bold text-white text-sm"
              style={{
                background: i === correctIdx ? '#2ecc71cc' : '#33333377',
                border: `2px solid ${i === correctIdx ? '#2ecc71' : 'transparent'}`,
              }}
            >
              <span className="text-2xl">{SHAPES[i]}</span>
              <span>{opt}</span>
              {i === correctIdx && <span className="text-lg">✓</span>}
            </div>
          ))}
        </div>

        {explanation && (
          <p className="text-sm text-cyber-muted bg-cyber-card border border-cyber-border rounded-xl px-4 py-3 text-center">
            {explanation}
          </p>
        )}

        {/* My rank */}
        <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border text-center">
          <p className="text-xs text-cyber-muted mb-1">Tu posición</p>
          <p className="text-3xl font-black text-cyber-green">#{myRank}</p>
          <p className="text-sm text-cyber-muted">{myScore} pts</p>
        </div>

        <p className="text-xs text-cyber-muted text-center animate-pulse">Esperando siguiente pregunta…</p>
      </div>
    </div>
  )

  // ── FINISHED ─────────────────────────────────────────────────────────────────
  if (phase === 'finished') return (
    <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center p-4 gap-6">
      <div className="text-5xl">🏆</div>
      <h2 className="text-2xl font-black text-cyber-text">¡Juego terminado!</h2>

      <div className="w-full max-w-sm space-y-2">
        {leaderboard.map((p, i) => (
          <motion.div
            key={p.nickname}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{
              background: p.nickname === myNickname ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.03)',
              border: p.nickname === myNickname ? '1px solid rgba(0,255,136,0.3)' : '1px solid transparent',
            }}
          >
            <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
            <span className="flex-1 font-semibold text-cyber-text">{p.nickname}</span>
            <span className="font-black font-mono text-cyber-green">{p.score}</span>
          </motion.div>
        ))}
      </div>

      <button
        onClick={() => { window.location.href = '/' }}
        className="px-8 py-3 rounded-xl font-bold text-black"
        style={{ background: '#00ff88' }}
      >
        Volver a la plataforma
      </button>
    </div>
  )

  // ── ERROR ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center p-4 gap-4">
      <p className="text-2xl">❌</p>
      <p className="text-cyber-muted text-center">{errMsg || 'Error de conexión'}</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-cyber-card border border-cyber-border text-cyber-text">
        Reintentar
      </button>
    </div>
  )
}
