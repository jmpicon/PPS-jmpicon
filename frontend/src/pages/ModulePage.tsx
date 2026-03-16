import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Bug, Lock, Database, Monitor, Search,
  ArrowLeft, CheckCircle2, FileText, FileType2, Presentation,
  Gamepad2, type LucideIcon,
} from 'lucide-react'
import { QUIZZES } from '../data/quizzes'
import { useModule } from '../hooks/useModules'
import { useProgress } from '../hooks/useProgress'
import FileRow from '../components/FileRow'
import LoadingSpinner from '../components/LoadingSpinner'
import type { FileType } from '../types'

const ICONS: Record<string, LucideIcon> = {
  shield: Shield, bug: Bug, lock: Lock,
  database: Database, monitor: Monitor, search: Search,
}

const FILE_ICONS: Record<FileType, LucideIcon> = {
  pdf:   FileText,
  docx:  FileType2,
  pptx:  Presentation,
  other: FileText,
}

const FILE_COUNTS_COLOR: Record<FileType, string> = {
  pdf:   '#ff4757',
  docx:  '#00d4ff',
  pptx:  '#ffa502',
  other: '#64748b',
}

export default function ModulePage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { module, loading, error } = useModule(slug)
  const { toggleFile, getModuleProgress, isFileViewed } = useProgress()

  if (loading) return <LoadingSpinner />

  if (error || !module) {
    return (
      <div className="text-center py-16">
        <p className="text-cyber-red font-mono text-sm">{error ?? 'Módulo no encontrado'}</p>
        <Link to="/modulos" className="text-cyber-blue text-sm mt-3 inline-block hover:underline">
          ← Volver a módulos
        </Link>
      </div>
    )
  }

  const Icon = ICONS[module.icon] ?? Shield
  const progress = getModuleProgress(module.slug, module.total_files)

  // Group files by type
  const byType = module.files.reduce<Record<string, typeof module.files>>((acc, f) => {
    acc[f.type] = [...(acc[f.type] ?? []), f]
    return acc
  }, {})

  const viewedCount = module.files.filter(f => isFileViewed(module.slug, f.filename)).length
  const hasQuiz = QUIZZES.some(q => q.moduleSlug === module.slug)

  return (
    <div className="space-y-7">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Link
          to="/modulos"
          className="inline-flex items-center gap-2 text-sm text-cyber-muted hover:text-cyber-text transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a módulos
        </Link>
        {hasQuiz && (
          <div className="flex items-center gap-2">
            <Link
              to={`/modulos/${module.slug}/quiz`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: `${module.color}15`,
                borderColor: `${module.color}50`,
                color: module.color,
              }}
            >
              <Gamepad2 size={15} />
              Solo
            </Link>
            <Link
              to={`/modulos/${module.slug}/kahoot`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(0,255,136,0.1)',
                borderColor: 'rgba(0,255,136,0.4)',
                color: '#00ff88',
              }}
            >
              <Gamepad2 size={15} />
              Multijugador
            </Link>
          </div>
        )}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border overflow-hidden"
        style={{
          borderColor: `${module.color}40`,
          background: `linear-gradient(135deg, ${module.color}08 0%, #111827 60%, #0d1526 100%)`,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${module.color}80, transparent)` }} />

        <div className="px-6 py-7 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0"
              style={{ background: `${module.color}15`, borderColor: `${module.color}60`, color: module.color }}
            >
              <Icon size={28} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: module.color }}>
                MÓDULO {module.id.toString().padStart(2, '0')}
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">{module.title}</h1>
              <p className="text-sm text-cyber-muted font-mono mb-3">{module.subtitle}</p>
              <p className="text-sm text-cyber-text/80 mb-5 max-w-2xl">{module.description}</p>

              {/* Topics */}
              <div className="flex flex-wrap gap-2">
                {module.topics.map(topic => (
                  <span
                    key={topic}
                    className="text-xs px-3 py-1 rounded-full border font-mono"
                    style={{ color: module.color, borderColor: `${module.color}40`, background: `${module.color}10` }}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress ring */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#1e3a5f" strokeWidth="6" />
                  <motion.circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke={module.color} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - progress / 100) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-mono font-bold" style={{ color: module.color }}>{progress}%</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] font-mono text-cyber-muted">
                  {viewedCount}/{module.total_files}
                </div>
                <div className="text-[10px] text-cyber-dim">vistos</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* File type summary */}
      <div className="grid grid-cols-3 gap-3">
        {(['pdf', 'docx', 'pptx'] as FileType[]).map(type => {
          const count = (byType[type] ?? []).length
          if (count === 0) return null
          const FIcon = FILE_ICONS[type]
          const color = FILE_COUNTS_COLOR[type]
          const labels: Record<string, string> = { pdf: 'PDFs', docx: 'Documentos', pptx: 'Presentaciones' }
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-cyber-border bg-cyber-card"
            >
              <div
                className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, borderColor: `${color}40`, color }}
              >
                <FIcon size={16} />
              </div>
              <div>
                <div className="text-lg font-mono font-bold" style={{ color }}>{count}</div>
                <div className="text-[10px] text-cyber-muted">{labels[type]}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Files */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-semibold text-cyber-text">Materiales</h2>
          <div className="flex-1 h-px bg-cyber-border" />
          {progress === 100 && (
            <div className="flex items-center gap-1.5 text-cyber-green text-xs font-mono">
              <CheckCircle2 size={14} />
              <span>Completado</span>
            </div>
          )}
          <span className="text-xs font-mono text-cyber-muted">{module.total_files} archivos</span>
        </div>

        <div className="space-y-2">
          {module.files.map((file, i) => (
            <FileRow
              key={file.filename}
              file={file}
              moduleSlug={module.slug}
              viewed={isFileViewed(module.slug, file.filename)}
              onToggle={() => toggleFile(module.slug, file.filename)}
              index={i}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
