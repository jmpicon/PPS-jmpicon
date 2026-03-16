import { motion } from 'framer-motion'
import { FileText, FileType2, Presentation, Download, Eye, CheckCircle2, type LucideIcon } from 'lucide-react'
import type { CourseFile } from '../types'
import { cn } from '../utils/cn'

const TYPE_ICON: Record<string, LucideIcon> = {
  pdf:   FileText,
  docx:  FileType2,
  pptx:  Presentation,
  other: FileText,
}

const TYPE_COLOR: Record<string, string> = {
  pdf:   '#ff4757',
  docx:  '#00d4ff',
  pptx:  '#ffa502',
  other: '#64748b',
}

const TYPE_LABEL: Record<string, string> = {
  pdf:   'PDF',
  docx:  'DOCX',
  pptx:  'PPTX',
  other: 'FILE',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  file: CourseFile
  moduleSlug: string
  viewed: boolean
  onToggle: () => void
  index: number
}

export default function FileRow({ file, viewed, onToggle, index }: Props) {
  const Icon = TYPE_ICON[file.type] ?? FileText
  const color = TYPE_COLOR[file.type] ?? '#64748b'
  const label = TYPE_LABEL[file.type] ?? 'FILE'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className={cn(
        'group flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
        viewed
          ? 'border-cyber-green/20 bg-cyber-green/5'
          : 'border-cyber-border bg-cyber-card hover:border-cyber-dim hover:bg-white/5',
      )}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
        style={{ background: `${color}15`, borderColor: `${color}40`, color }}
      >
        <Icon size={18} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('text-sm font-medium truncate', viewed ? 'text-cyber-muted' : 'text-cyber-text')}>
            {file.name}
          </span>
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0"
            style={{ color, borderColor: `${color}40`, background: `${color}10` }}
          >
            {label}
          </span>
        </div>
        {file.description && (
          <p className="text-xs text-cyber-muted truncate">{file.description}</p>
        )}
        <p className="text-[10px] font-mono text-cyber-dim mt-0.5">{formatSize(file.size)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggle}
          title={viewed ? 'Marcar como no visto' : 'Marcar como visto'}
          className={cn(
            'w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200',
            viewed
              ? 'border-cyber-green/40 bg-cyber-green/10 text-cyber-green'
              : 'border-cyber-border text-cyber-muted hover:border-cyber-green/40 hover:text-cyber-green',
          )}
        >
          <CheckCircle2 size={14} />
        </button>

        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Ver archivo"
          className="w-8 h-8 rounded-lg border border-cyber-border text-cyber-muted hover:border-cyber-blue/40 hover:text-cyber-blue flex items-center justify-center transition-all duration-200"
        >
          <Eye size={14} />
        </a>

        <a
          href={`${file.url}?download=1`}
          download={file.filename}
          title="Descargar"
          className="w-8 h-8 rounded-lg border border-cyber-border text-cyber-muted hover:border-cyber-purple/40 hover:text-cyber-purple flex items-center justify-center transition-all duration-200"
        >
          <Download size={14} />
        </a>
      </div>
    </motion.div>
  )
}
