import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useModules } from '../hooks/useModules'
import { useProgress } from '../hooks/useProgress'
import ModuleCard from '../components/ModuleCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ModulesPage() {
  const { modules, loading, error } = useModules()
  const { getModuleProgress } = useProgress()

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-16 text-cyber-red font-mono text-sm">{error}</div>
    )
  }

  return (
    <div className="space-y-7">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center">
          <BookOpen size={20} className="text-cyber-blue" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-cyber-text">Todos los módulos</h1>
          <p className="text-xs text-cyber-muted font-mono">{modules.length} módulos · Puesta en Producción Segura</p>
        </div>
      </motion.div>

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
  )
}
