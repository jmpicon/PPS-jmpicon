import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, FileText, FileType2, Presentation, ArrowRight, Loader2, type LucideIcon } from 'lucide-react'
import { api } from '../api/client'
import type { SearchResult } from '../types'

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

interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const r = await api.search(q.trim())
      setResults(r)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(t)
  }, [query, doSearch])

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]) }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose() }
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-cyber-surface border border-cyber-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-cyber-border">
              <Search size={18} className="text-cyber-muted shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar en materiales del curso..."
                className="flex-1 bg-transparent text-cyber-text placeholder:text-cyber-muted text-sm outline-none font-sans"
              />
              {loading
                ? <Loader2 size={16} className="text-cyber-green animate-spin shrink-0" />
                : query && (
                  <button onClick={() => setQuery('')} className="text-cyber-muted hover:text-cyber-text">
                    <X size={16} />
                  </button>
                )
              }
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {results.length === 0 && query.length >= 2 && !loading && (
                <div className="py-10 text-center text-cyber-muted text-sm">
                  No se encontraron resultados para &quot;{query}&quot;
                </div>
              )}
              {results.length === 0 && query.length < 2 && (
                <div className="py-8 text-center text-cyber-muted text-xs font-mono">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
              {results.map((r, i) => {
                const Icon = TYPE_ICON[r.file.type] ?? FileText
                const color = TYPE_COLOR[r.file.type] ?? '#64748b'
                return (
                  <Link
                    key={i}
                    to={`/modulos/${r.module_slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-cyber-border/50 last:border-0"
                  >
                    <div
                      className="w-8 h-8 rounded-lg border flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, borderColor: `${color}40`, color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-cyber-text truncate">{r.file.name}</div>
                      <div className="text-xs text-cyber-muted truncate">{r.module_title}</div>
                    </div>
                    <ArrowRight size={12} className="text-cyber-muted shrink-0" />
                  </Link>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-cyber-border flex items-center gap-4 text-[10px] font-mono text-cyber-muted">
              <span><kbd className="bg-cyber-border/60 px-1 rounded">↑↓</kbd> navegar</span>
              <span><kbd className="bg-cyber-border/60 px-1 rounded">↵</kbd> abrir</span>
              <span><kbd className="bg-cyber-border/60 px-1 rounded">Esc</kbd> cerrar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
