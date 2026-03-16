import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-2 border-transparent border-t-cyber-green"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyber-blue"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shield size={20} className="text-cyber-green" />
        </div>
      </div>
      <div className="font-mono text-sm text-cyber-muted animate-pulse">
        Cargando materiales...
      </div>
    </div>
  )
}
