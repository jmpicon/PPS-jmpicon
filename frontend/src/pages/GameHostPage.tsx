import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { QUIZZES } from '../data/quizzes'

type Phase = 'lobby' | 'question' | 'answer' | 'finished' | 'error'

interface Player { nickname: string; score: number }
interface Question { q: string; options: string[]; correct: number; explanation: string }

const COLORS = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71']
const SHAPES = ['▲', '◆', '●', '■']

export default function GameHostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const quiz = QUIZZES.find(q => q.moduleSlug === slug)

  const [phase, setPhase] = useState<Phase>('lobby')
  const [code, setCode] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [currentQ, setCurrentQ] = useState<Question | null>(null)
  const [timeLeft, setTimeLeft] = useState(20)
  const [answered, setAnswered] = useState(0)
  const [leaderboard, setLeaderboard] = useState<Player[]>([])
  const [explanation, setExplanation] = useState('')
  const [correctIdx, setCorrectIdx] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const wsRef = useRef<WebSocket | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Detect if on localhost — QR won't be scannable from other devices
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  // Join URL encoded in QR (only useful when on a public/LAN IP, not localhost)
  const joinUrl = `${window.location.origin}/jugar?code=${code}`

  const send = useCallback((msg: object) => {
    wsRef.current?.send(JSON.stringify(msg))
  }, [])

  useEffect(() => {
    if (!quiz) return

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${window.location.host}/api/game/host`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'create',
        moduleSlug: quiz.moduleSlug,
        moduleTitle: quiz.title,
        questions: quiz.questions.map(q => ({
          q: q.q,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
        })),
      }))
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      switch (msg.type) {
        case 'created':
          setCode(msg.code)
          break
        case 'player_joined':
          setPlayers(msg.players.map((n: string) => ({ nickname: n, score: 0 })))
          break
        case 'player_left':
          setPlayers(msg.players.map((n: string) => ({ nickname: n, score: 0 })))
          break
        case 'question':
          setPhase('question')
          setQIndex(msg.index)
          setCurrentQ({ q: msg.q, options: msg.options, correct: msg.correct, explanation: '' })
          setAnswered(0)
          setTimeLeft(msg.timeLeft)
          startTimer(msg.timeLeft)
          break
        case 'answer_progress':
          setAnswered(msg.answered)
          break
        case 'answer_reveal':
          stopTimer()
          setPhase('answer')
          setLeaderboard(msg.leaderboard)
          setExplanation(msg.explanation)
          setCorrectIdx(msg.correct)
          setIsLast(msg.isLast)
          break
        case 'finished':
          stopTimer()
          setPhase('finished')
          setLeaderboard(msg.leaderboard)
          break
        case 'error':
          setErrMsg(msg.msg)
          break
      }
    }

    ws.onclose = () => {
      if (phase !== 'finished') setPhase('error')
    }

    return () => { ws.close(); stopTimer() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz])

  const startTimer = (secs: number) => {
    stopTimer()
    let t = secs
    timerRef.current = setInterval(() => {
      t -= 1
      setTimeLeft(t)
      if (t <= 0) stopTimer()
    }, 1000)
  }

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  if (!quiz) return (
    <div className="flex items-center justify-center h-64 text-cyber-muted">
      Módulo no encontrado
    </div>
  )

  // ── LOBBY ───────────────────────────────────────────────────────────────────
  if (phase === 'lobby') return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-cyber-muted hover:text-cyber-text text-sm">← Volver</button>
        <h1 className="text-xl font-bold text-cyber-text">{quiz.title}</h1>
        <span className="ml-auto text-xs text-cyber-muted">{quiz.questions.length} preguntas · 20s por pregunta</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR + Code */}
        <div className="p-6 rounded-2xl border border-cyber-border bg-cyber-card flex flex-col items-center gap-4">

          {/* Big code — always visible */}
          {code ? (
            <div className="text-center w-full">
              <p className="text-xs text-cyber-muted mb-1 font-mono uppercase tracking-widest">Código de juego</p>
              <p className="text-6xl font-black tracking-[0.15em] font-mono" style={{ color: quiz.color }}>
                {code}
              </p>
            </div>
          ) : (
            <div className="h-20 w-48 rounded-xl bg-cyber-surface animate-pulse" />
          )}

          {/* URL for students */}
          <div className="w-full text-center space-y-1">
            <p className="text-xs text-cyber-muted">Los alumnos van a:</p>
            <code className="text-sm text-cyber-green font-mono bg-cyber-surface px-3 py-1.5 rounded-lg block">
              {window.location.host}/jugar
            </code>
          </div>

          {/* QR — only useful when NOT on localhost */}
          {isLocalhost ? (
            <div className="w-full p-3 rounded-xl border border-[#ffa502]/30 bg-[#ffa502]/5 text-center">
              <p className="text-xs text-[#ffa502] font-semibold mb-1">⚠ Estás en localhost</p>
              <p className="text-[11px] text-cyber-muted leading-relaxed">
                El QR no funcionará desde otros dispositivos.<br />
                Comparte tu <strong className="text-cyber-text">IP local</strong> con los alumnos:<br />
                <code className="text-cyber-green">ip addr</code> → p.ej. <code className="text-cyber-green">192.168.1.X:8088/jugar</code>
              </p>
            </div>
          ) : code ? (
            <>
              <p className="text-xs text-cyber-muted">O escanean:</p>
              <div className="p-3 bg-white rounded-xl">
                <QRCodeSVG value={joinUrl} size={160} level="M" />
              </div>
            </>
          ) : null}
        </div>

        {/* Players waiting */}
        <div className="p-6 rounded-2xl border border-cyber-border bg-cyber-card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-cyber-text">Jugadores en sala</h2>
            <span className="text-2xl font-black" style={{ color: quiz.color }}>{players.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-56 space-y-1.5">
            <AnimatePresence>
              {players.map(p => (
                <motion.div
                  key={p.nickname}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyber-surface border border-cyber-border"
                >
                  <span className="w-7 h-7 rounded-full bg-cyber-bg flex items-center justify-center text-xs font-mono text-cyber-green">
                    {p.nickname[0].toUpperCase()}
                  </span>
                  <span className="text-sm text-cyber-text font-medium">{p.nickname}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            {players.length === 0 && (
              <p className="text-xs text-cyber-muted text-center py-8">
                Esperando jugadores…
              </p>
            )}
          </div>

          {errMsg && <p className="text-xs text-[#ff5555]">{errMsg}</p>}

          <button
            onClick={() => send({ type: 'start' })}
            disabled={players.length === 0 || !code}
            className="w-full py-3 rounded-xl font-bold text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: players.length > 0 ? quiz.color : '#444' }}
          >
            {players.length === 0 ? 'Esperando jugadores...' : `¡Iniciar juego! (${players.length} jugador${players.length > 1 ? 'es' : ''})`}
          </button>
        </div>
      </div>
    </div>
  )

  // ── QUESTION ─────────────────────────────────────────────────────────────────
  if (phase === 'question' && currentQ) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-cyber-muted font-mono">Pregunta {qIndex + 1}/{quiz.questions.length}</span>
        <div className="flex-1 h-2 rounded-full bg-cyber-surface overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: quiz.color }}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 20) * 100}%` }}
            transition={{ ease: 'linear', duration: 1 }}
          />
        </div>
        <span className={`text-2xl font-black font-mono ${timeLeft <= 5 ? 'text-[#ff5555]' : 'text-cyber-text'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Question */}
      <div className="p-6 rounded-2xl border border-cyber-border bg-cyber-card text-center">
        <p className="text-xl font-semibold text-cyber-text">{currentQ.q}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((opt, i) => (
          <div key={i} className="p-4 rounded-xl flex items-center gap-3" style={{ background: COLORS[i] + 'cc' }}>
            <span className="text-2xl">{SHAPES[i]}</span>
            <span className="text-white font-semibold text-sm">{opt}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between px-1 text-sm text-cyber-muted">
        <span>{answered}/{players.length} han respondido</span>
        <button onClick={() => send({ type: 'reveal' })} className="text-xs underline hover:text-cyber-text">
          Revelar ya
        </button>
      </div>
    </div>
  )

  // ── ANSWER REVEAL ────────────────────────────────────────────────────────────
  if (phase === 'answer') return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="p-5 rounded-2xl border border-cyber-border bg-cyber-card">
        <p className="text-lg font-semibold text-cyber-text mb-3">{currentQ?.q}</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {currentQ?.options.map((opt, i) => (
            <div
              key={i}
              className="p-3 rounded-xl flex items-center gap-2"
              style={{
                background: i === correctIdx ? '#2ecc71cc' : '#33333377',
                border: i === correctIdx ? '2px solid #2ecc71' : '2px solid transparent',
              }}
            >
              <span>{SHAPES[i]}</span>
              <span className="text-white text-sm font-medium">{opt}</span>
              {i === correctIdx && <span className="ml-auto">✓</span>}
            </div>
          ))}
        </div>
        {explanation && (
          <p className="text-sm text-cyber-muted bg-cyber-surface rounded-lg px-4 py-3">{explanation}</p>
        )}
      </div>

      {/* Leaderboard top 5 */}
      <div className="p-4 rounded-2xl border border-cyber-border bg-cyber-card">
        <h3 className="text-sm font-semibold text-cyber-text mb-3">Clasificación</h3>
        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((p, i) => (
            <div key={p.nickname} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-cyber-surface">
              <span className="w-6 text-center text-sm font-bold text-cyber-muted">{i + 1}</span>
              <span className="flex-1 text-sm text-cyber-text">{p.nickname}</span>
              <span className="font-mono font-bold text-sm" style={{ color: quiz.color }}>{p.score}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => send({ type: isLast ? 'end' : 'next' })}
        className="w-full py-3 rounded-xl font-bold text-black"
        style={{ background: quiz.color }}
      >
        {isLast ? '🏆 Ver resultados finales' : '➡ Siguiente pregunta'}
      </button>
    </div>
  )

  // ── FINISHED ─────────────────────────────────────────────────────────────────
  if (phase === 'finished') return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-black text-center text-cyber-text">🏆 Fin del juego</h2>
      <div className="p-6 rounded-2xl border border-cyber-border bg-cyber-card space-y-3">
        {leaderboard.map((p, i) => (
          <motion.div
            key={p.nickname}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl"
            style={{ background: i === 0 ? quiz.color + '22' : 'rgba(255,255,255,0.03)', border: i === 0 ? `1px solid ${quiz.color}44` : '1px solid transparent' }}
          >
            <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}º`}</span>
            <span className="flex-1 font-semibold text-cyber-text">{p.nickname}</span>
            <span className="font-black font-mono" style={{ color: quiz.color }}>{p.score} pts</span>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/modulos/${slug}`)}
          className="flex-1 py-3 rounded-xl font-bold border border-cyber-border text-cyber-text hover:bg-cyber-surface"
        >
          Volver al módulo
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-3 rounded-xl font-bold text-black"
          style={{ background: quiz.color }}
        >
          Nueva partida
        </button>
      </div>
    </div>
  )

  // ── ERROR ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-cyber-muted">Error de conexión. Intenta de nuevo.</p>
      <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-cyber-surface border border-cyber-border text-cyber-text">
        Recargar
      </button>
    </div>
  )
}
