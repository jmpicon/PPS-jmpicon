import { motion } from 'framer-motion'
import { Shield, Zap, TrendingUp } from 'lucide-react'
import { useModules, useStats } from '../hooks/useModules'
import { useProgress } from '../hooks/useProgress'
import ModuleCard from '../components/ModuleCard'
import StatsBar from '../components/StatsBar'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { modules, loading, error } = useModules()
  const { stats } = useStats()
  const { getModuleProgress } = useProgress()

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center">
          <Shield size={28} className="text-cyber-red" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-cyber-text mb-1">Error de conexión</h2>
          <p className="text-sm text-cyber-muted font-mono">{error}</p>
          <p className="text-xs text-cyber-dim mt-2">Asegúrate de que la API está en ejecución</p>
        </div>
      </div>
    )
  }

  const overallProgress = modules.length > 0
    ? Math.round(modules.reduce((acc, m) => acc + getModuleProgress(m.slug, m.total_files), 0) / modules.length)
    : 0

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-cyber-border overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0d1526 0%, #111827 50%, #0d1526 100%)',
        }}
      >
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="80" stroke="#00ff88" strokeWidth="1" />
            <circle cx="100" cy="100" r="60" stroke="#00ff88" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" stroke="#00ff88" strokeWidth="0.5" />
            <line x1="20" y1="100" x2="180" y2="100" stroke="#00ff88" strokeWidth="0.5" />
            <line x1="100" y1="20" x2="100" y2="180" stroke="#00ff88" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-cyber-green/10 to-transparent" />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center shrink-0">
              <Shield size={28} className="text-cyber-green" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-mono text-cyber-green mb-1 tracking-widest uppercase">
                CIPFP Mislata · Ciberseguridad FP
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
                Puesta en Producción
                <span className="text-cyber-green"> Segura</span>
              </h1>
              <p className="text-sm text-cyber-muted max-w-xl">
                Curso completo de seguridad en aplicaciones web: vulnerabilidades, autenticación, cifrado,
                configuración y testing con OWASP ZAP.
              </p>
            </div>

            {/* Overall progress */}
            <div className="flex flex-col items-center gap-2 min-w-[100px]">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1e3a5f" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke="#00ff88" strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - overallProgress / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-mono font-bold text-cyber-green">{overallProgress}%</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-cyber-muted text-center">Progreso<br/>total</div>
            </div>
          </div>

          {/* Quick stats inline */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { Icon: Zap,        color: '#ffa502', label: `${modules.length} módulos`                           },
              { Icon: TrendingUp, color: '#00d4ff', label: `${stats?.total_files ?? '...'} archivos disponibles` },
              { Icon: Shield,     color: '#a29bfe', label: `${stats?.vulnerabilities_covered ?? 13} vulnerabilidades` },
            ].map(({ Icon, color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={14} style={{ color }} />
                <span className="text-xs font-mono text-cyber-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && <StatsBar stats={stats} />}

      {/* Modules grid */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-cyber-text">Módulos del curso</h2>
          <div className="flex-1 h-px bg-cyber-border" />
          <span className="text-xs font-mono text-cyber-muted">{modules.length} módulos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              progress={getModuleProgress(mod.slug, mod.total_files)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
