import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, RotateCcw, CheckCircle2, XCircle,
  Zap, ChevronRight, Home, Star,
} from 'lucide-react'
import { QUIZZES } from '../data/quizzes'
import { cn } from '../utils/cn'

const OPTION_STYLES = [
  { bg: 'bg-[#e74c3c]', hover: 'hover:bg-[#c0392b]', border: 'border-[#c0392b]', shape: '▲', label: 'A' },
  { bg: 'bg-[#3498db]', hover: 'hover:bg-[#2980b9]', border: 'border-[#2980b9]', shape: '◆', label: 'B' },
  { bg: 'bg-[#f39c12]', hover: 'hover:bg-[#d68910]', border: 'border-[#d68910]', shape: '●', label: 'C' },
  { bg: 'bg-[#27ae60]', hover: 'hover:bg-[#1e8449]', border: 'border-[#1e8449]', shape: '■', label: 'D' },
]

const QUESTION_TIME = 20

type Phase = 'intro' | 'question' | 'answer' | 'finish'

export default function QuizPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const quiz = QUIZZES.find(q => q.moduleSlug === slug)

  const [phase, setPhase]           = useState<Phase>('intro')
  const [current, setCurrent]       = useState(0)
  const [selected, setSelected]     = useState<number | null>(null)
  const [score, setScore]           = useState(0)
  const [timeLeft, setTimeLeft]     = useState(QUESTION_TIME)
  const [answers, setAnswers]       = useState<(number | null)[]>([])
  const [streakCount, setStreakCount] = useState(0)

  const question = quiz?.questions[current]
  const isCorrect = selected !== null && selected === question?.correct
  const timeBonus = Math.round((timeLeft / QUESTION_TIME) * 100)

  // Timer
  useEffect(() => {
    if (phase !== 'question') return
    if (timeLeft === 0) { handleTimeout(); return }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft])

  const handleTimeout = useCallback(() => {
    setSelected(null)
    setAnswers(prev => [...prev, null])
    setStreakCount(0)
    setPhase('answer')
  }, [])

  const handleSelect = useCallback((idx: number) => {
    if (phase !== 'question') return
    setSelected(idx)
    setPhase('answer')
    const correct = idx === question?.correct
    if (correct) {
      const pts = 100 + timeBonus + (streakCount * 20)
      setScore(s => s + pts)
      setStreakCount(s => s + 1)
    } else {
      setStreakCount(0)
    }
    setAnswers(prev => [...prev, idx])
  }, [phase, question, timeBonus, streakCount])

  const handleNext = useCallback(() => {
    if (!quiz) return
    if (current + 1 >= quiz.questions.length) {
      setPhase('finish')
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setTimeLeft(QUESTION_TIME)
      setPhase('question')
    }
  }, [current, quiz])

  const handleRestart = useCallback(() => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setTimeLeft(QUESTION_TIME)
    setAnswers([])
    setStreakCount(0)
    setPhase('intro')
  }, [])

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <p className="text-cyber-red font-mono">Quiz no encontrado para este módulo</p>
        <Link to="/modulos" className="text-cyber-blue mt-3 inline-block hover:underline text-sm">
          ← Volver a módulos
        </Link>
      </div>
    )
  }

  const pct = quiz.questions.length > 0 ? ((current) / quiz.questions.length) * 100 : 0
  const correctCount = answers.filter((a, i) => a === quiz.questions[i]?.correct).length
  const finalPct = Math.round((correctCount / quiz.questions.length) * 100)

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Back */}
      <Link
        to={`/modulos/${slug}`}
        className="inline-flex items-center gap-2 text-sm text-cyber-muted hover:text-cyber-text mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver al módulo
      </Link>

      <AnimatePresence mode="wait">

        {/* ── INTRO ─────────────────────────────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-8"
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl border-4"
              style={{ background: `${quiz.color}20`, borderColor: quiz.color }}
            >
              🎮
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest mb-2" style={{ color: quiz.color }}>KAHOOT · MÓDULO {quiz.moduleId}</div>
              <h1 className="text-3xl font-bold text-white mb-3">{quiz.title}</h1>
              <p className="text-cyber-muted text-sm">{quiz.questions.length} preguntas · {QUESTION_TIME}s por pregunta</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
              {OPTION_STYLES.map((s, i) => (
                <div key={i} className={`${s.bg} rounded-xl p-3 text-center text-white font-bold text-xl opacity-80`}>
                  {s.shape}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase('question')}
              className="px-10 py-4 rounded-2xl text-black font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{ background: quiz.color, boxShadow: `0 0 30px ${quiz.color}60` }}
            >
              ¡Empezar!
            </button>
          </motion.div>
        )}

        {/* ── QUESTION ──────────────────────────────────────────────────── */}
        {(phase === 'question' || phase === 'answer') && question && (
          <motion.div
            key={`q-${current}`}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="flex-1 flex flex-col gap-5"
          >
            {/* Top bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 rounded-full bg-cyber-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: quiz.color }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Zap size={14} style={{ color: quiz.color }} />
                <span className="font-mono font-bold text-sm" style={{ color: quiz.color }}>{score} pts</span>
              </div>
              {streakCount >= 2 && (
                <div className="flex items-center gap-1 text-[#ffd700] text-xs font-mono">
                  <Star size={12} fill="currentColor" /> ×{streakCount}
                </div>
              )}
            </div>

            {/* Question counter */}
            <div className="text-center">
              <span className="text-xs font-mono text-cyber-muted">
                Pregunta {current + 1} de {quiz.questions.length}
              </span>
            </div>

            {/* Timer */}
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#1e3a5f" strokeWidth="5" />
                  <motion.circle
                    cx="32" cy="32" r="26" fill="none"
                    stroke={timeLeft > 5 ? quiz.color : '#ff4757'}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - timeLeft / QUESTION_TIME) }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={cn('font-mono font-bold text-lg', timeLeft <= 5 && 'text-[#ff4757]')}>
                    {phase === 'answer' ? '—' : timeLeft}
                  </span>
                </div>
              </div>
            </div>

            {/* Question text */}
            <div className="bg-cyber-card border border-cyber-border rounded-2xl px-6 py-6 text-center">
              <p className="text-lg sm:text-xl font-semibold text-white leading-snug">{question.q}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((opt, i) => {
                const s = OPTION_STYLES[i]
                const isSelected = selected === i
                const isRight = i === question.correct
                let state: 'default' | 'correct' | 'wrong' | 'reveal' = 'default'
                if (phase === 'answer') {
                  if (isRight) state = 'correct'
                  else if (isSelected) state = 'wrong'
                  else state = 'reveal'
                }

                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={phase === 'question' ? { scale: 1.02 } : {}}
                    whileTap={phase === 'question' ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(i)}
                    disabled={phase === 'answer'}
                    className={cn(
                      'relative flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 font-semibold text-white',
                      phase === 'question' && `${s.bg} ${s.hover} ${s.border} cursor-pointer`,
                      state === 'correct' && 'bg-[#27ae60] border-[#1e8449] scale-105',
                      state === 'wrong'   && 'bg-[#e74c3c] border-[#c0392b] opacity-80',
                      state === 'reveal'  && 'bg-cyber-card border-cyber-border opacity-50',
                    )}
                  >
                    <span className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0',
                      phase === 'question' ? 'bg-black/20' : 'bg-black/20',
                    )}>
                      {phase === 'answer'
                        ? state === 'correct' ? <CheckCircle2 size={20} />
                          : state === 'wrong'  ? <XCircle size={20} />
                          : s.shape
                        : s.shape}
                    </span>
                    <span className="text-sm sm:text-base leading-snug">{opt}</span>
                    {phase === 'question' && (
                      <span className="ml-auto font-mono text-xs opacity-70">{s.label}</span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Explanation + Next */}
            {phase === 'answer' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className={cn(
                  'rounded-xl p-4 border text-sm',
                  isCorrect
                    ? 'bg-[#27ae60]/10 border-[#27ae60]/40 text-[#2ecc71]'
                    : selected === null
                    ? 'bg-cyber-card border-cyber-border text-cyber-muted'
                    : 'bg-[#e74c3c]/10 border-[#e74c3c]/40 text-[#ff6b6b]',
                )}>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    {selected === null ? '⏱ Tiempo agotado' : isCorrect ? '✅ ¡Correcto!' : '❌ Incorrecto'}
                    {isCorrect && <span className="ml-auto font-mono text-[#2ecc71]">+{100 + timeBonus + ((streakCount - 1) * 20)} pts</span>}
                  </div>
                  <p className="text-cyber-text/80">{question.explanation}</p>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black transition-all hover:scale-[1.02] active:scale-98"
                  style={{ background: quiz.color }}
                >
                  {current + 1 >= quiz.questions.length ? 'Ver resultados' : 'Siguiente pregunta'}
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── FINISH ────────────────────────────────────────────────────── */}
        {phase === 'finish' && (
          <motion.div
            key="finish"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-7xl"
            >
              {finalPct >= 80 ? '🏆' : finalPct >= 60 ? '🎯' : finalPct >= 40 ? '📚' : '💪'}
            </motion.div>

            <div>
              <div className="text-xs font-mono tracking-widest mb-2" style={{ color: quiz.color }}>RESULTADO FINAL</div>
              <h2 className="text-4xl font-bold text-white mb-2">{score} puntos</h2>
              <p className="text-cyber-muted">{correctCount} de {quiz.questions.length} correctas ({finalPct}%)</p>
            </div>

            {/* Score bar */}
            <div className="w-full max-w-sm">
              <div className="h-3 rounded-full bg-cyber-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: quiz.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${finalPct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Medal */}
            <div
              className="px-6 py-3 rounded-2xl border text-sm font-semibold"
              style={{
                background: `${quiz.color}15`,
                borderColor: `${quiz.color}40`,
                color: quiz.color,
              }}
            >
              {finalPct === 100 ? '🌟 ¡Perfecto! Maestro de la materia'
                : finalPct >= 80 ? '🥇 Excelente — Muy buena base'
                : finalPct >= 60 ? '🥈 Bien — Repasa los temas fallados'
                : finalPct >= 40 ? '🥉 Regular — Vuelve a revisar el módulo'
                : '📖 Necesitas repasar el módulo antes de continuar'}
            </div>

            {/* Per-question review */}
            <div className="w-full max-w-lg space-y-2">
              {quiz.questions.map((q, i) => {
                const ans = answers[i]
                const ok = ans === q.correct
                return (
                  <div key={i} className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border text-left text-sm',
                    ok ? 'border-[#27ae60]/30 bg-[#27ae60]/5' : 'border-[#e74c3c]/30 bg-[#e74c3c]/5',
                  )}>
                    {ok
                      ? <CheckCircle2 size={16} className="text-[#27ae60] shrink-0 mt-0.5" />
                      : <XCircle size={16} className="text-[#e74c3c] shrink-0 mt-0.5" />}
                    <span className={cn('flex-1', ok ? 'text-cyber-text' : 'text-cyber-muted')}>
                      {q.q}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <button
                onClick={handleRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-cyber-border text-cyber-muted hover:text-cyber-text hover:border-cyber-dim transition-all text-sm font-medium"
              >
                <RotateCcw size={15} /> Repetir
              </button>
              <Link
                to={`/modulos/${slug}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black transition-all hover:scale-[1.02] text-sm"
                style={{ background: quiz.color }}
              >
                <Home size={15} /> Volver al módulo
              </Link>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
