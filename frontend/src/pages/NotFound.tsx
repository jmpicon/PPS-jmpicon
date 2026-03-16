import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-24 h-24 rounded-full bg-cyber-red/10 border border-cyber-red/30 flex items-center justify-center"
      >
        <Shield size={40} className="text-cyber-red" />
      </motion.div>
      <div>
        <div className="text-6xl font-mono font-bold text-cyber-red mb-2">404</div>
        <h2 className="text-xl font-semibold text-cyber-text mb-2">Página no encontrada</h2>
        <p className="text-sm text-cyber-muted font-mono">La ruta solicitada no existe</p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-sm font-medium hover:bg-cyber-green/20 transition-colors"
      >
        <Home size={16} />
        Volver al inicio
      </Link>
    </div>
  )
}
