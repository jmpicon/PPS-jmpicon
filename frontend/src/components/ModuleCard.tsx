import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Bug, Lock, Database, Monitor, Search,
  ArrowRight, CheckCircle2, type LucideIcon,
} from 'lucide-react'
import type { Module } from '../types'
import { cn } from '../utils/cn'

const ICONS: Record<string, LucideIcon> = {
  shield:   Shield,
  bug:      Bug,
  lock:     Lock,
  database: Database,
  monitor:  Monitor,
  search:   Search,
}

interface Props {
  module: Module
  progress: number
  index: number
}

export default function ModuleCard({ module, progress, index }: Props) {
  const Icon = ICONS[module.icon] ?? Shield

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
    >
      <Link to={`/modulos/${module.slug}`} className="block group">
        <div
          className={cn(
            'relative rounded-xl border border-cyber-border bg-cyber-card overflow-hidden',
            'transition-all duration-300 ease-out',
            'hover:border-opacity-80 hover:shadow-card-hover hover:-translate-y-1',
          )}
          style={{ '--hover-color': module.color } as React.CSSProperties}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at 50% 0%, ${module.color}08, transparent 50%)`,
            }}
          />

          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${module.color}60, transparent)` }} />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${module.color}15`,
                  borderColor: `${module.color}40`,
                  color: module.color,
                }}
              >
                <Icon size={22} />
              </div>

              <div className="text-right">
                <div className="text-[10px] font-mono text-cyber-muted">M{module.id.toString().padStart(2, '0')}</div>
                <div className="text-[11px] font-mono" style={{ color: module.color }}>
                  {module.total_files} archivos
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-cyber-text text-base leading-snug mb-1 group-hover:text-white transition-colors">
              {module.title}
            </h3>
            <p className="text-xs text-cyber-muted mb-4 font-mono">{module.subtitle}</p>

            {/* Topics */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {module.topics.slice(0, 3).map(topic => (
                <span
                  key={topic}
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono border"
                  style={{ color: `${module.color}cc`, borderColor: `${module.color}30`, background: `${module.color}08` }}
                >
                  {topic}
                </span>
              ))}
              {module.topics.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono border border-cyber-border text-cyber-muted">
                  +{module.topics.length - 3}
                </span>
              )}
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-cyber-muted font-mono">Progreso</span>
                <div className="flex items-center gap-1.5">
                  {progress === 100 && <CheckCircle2 size={12} className="text-cyber-green" />}
                  <span className="text-[11px] font-mono" style={{ color: progress > 0 ? module.color : undefined }}>
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full bg-cyber-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: module.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.07 + 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 border-t border-cyber-border flex items-center justify-between"
            style={{ background: `${module.color}05` }}
          >
            <span className="text-xs text-cyber-muted">Ver materiales</span>
            <ArrowRight
              size={14}
              className="transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: module.color }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
