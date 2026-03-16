import { motion } from 'framer-motion'
import { BookOpen, FileText, FileType2, Presentation, Bug } from 'lucide-react'
import type { Stats } from '../types'

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
  index: number
}

function StatItem({ icon, label, value, color, index }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex items-center gap-3 px-5 py-4 rounded-xl border border-cyber-border bg-cyber-card"
    >
      <div
        className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, borderColor: `${color}40`, color }}
      >
        {icon}
      </div>
      <div>
        <div className="text-xl font-mono font-bold" style={{ color }}>{value}</div>
        <div className="text-xs text-cyber-muted">{label}</div>
      </div>
    </motion.div>
  )
}

interface Props {
  stats: Stats
}

export default function StatsBar({ stats }: Props) {
  const items: Omit<StatItemProps, 'index'>[] = [
    { icon: <BookOpen size={18} />, label: 'Módulos',         value: stats.total_modules,          color: '#00ff88' },
    { icon: <FileText size={18} />, label: 'PDFs',             value: stats.total_pdfs,             color: '#ff4757' },
    { icon: <FileType2 size={18} />, label: 'Documentos',     value: stats.total_docs,             color: '#00d4ff' },
    { icon: <Presentation size={18} />, label: 'Slides',      value: stats.total_slides,           color: '#ffa502' },
    { icon: <Bug size={18} />,      label: 'Vulnerabilidades', value: stats.vulnerabilities_covered, color: '#a29bfe' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map((item, i) => (
        <StatItem key={item.label} {...item} index={i} />
      ))}
    </div>
  )
}
