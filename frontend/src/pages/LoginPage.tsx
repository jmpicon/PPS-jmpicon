import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [code, setCode]       = useState('')
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      await login(code.trim())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-cyber-green/10 border-2 border-cyber-green/40 flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(0,255,136,0.2)' }}
          >
            <Shield size={36} className="text-cyber-green" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white">CursoPPS</h1>
          <p className="text-cyber-muted text-sm mt-1 font-mono">Puesta en Producción Segura</p>
          <p className="text-xs text-cyber-dim mt-1">CIPFP Mislata · Ciberseguridad FP</p>
        </div>

        {/* Card */}
        <div className="bg-cyber-surface border border-cyber-border rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-cyber-green" />
            <h2 className="text-base font-semibold text-cyber-text">Acceso al curso</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-mono text-cyber-muted mb-2 block">
                Código de acceso
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={code}
                  onChange={e => { setCode(e.target.value); setError(null) }}
                  placeholder="Introduce el código del curso"
                  autoFocus
                  className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-3 pr-12 text-cyber-text placeholder:text-cyber-dim text-sm outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-text transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[#ff4757] text-xs mt-2 font-mono flex items-center gap-1"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black text-sm transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: '#00ff88',
                boxShadow: '0 0 20px rgba(0,255,136,0.3)',
              }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Verificando...</>
                : <><Shield size={16} /> Acceder</>
              }
            </button>
          </form>

          <p className="text-center text-xs text-cyber-dim mt-6 font-mono">
            El código lo proporciona tu profesor
          </p>
        </div>
      </motion.div>
    </div>
  )
}
