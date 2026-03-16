import { motion } from 'framer-motion'
import { Terminal, AlertTriangle, Package } from 'lucide-react'
import TerminalEmulator from '../components/TerminalEmulator'

const TOOLS = [
  { cat: 'Escaneo de red',       items: ['nmap', 'netcat', 'traceroute', 'whois', 'dnsutils'] },
  { cat: 'Web & HTTP',           items: ['curl', 'wget', 'nikto', 'gobuster', 'dirb', 'wfuzz', 'whatweb', 'wafw00f'] },
  { cat: 'Inyección SQL',        items: ['sqlmap'] },
  { cat: 'Contraseñas',          items: ['john', 'hydra'] },
  { cat: 'Criptografía',        items: ['openssl', 'gnutls-bin'] },
  { cat: 'Python / SAST',        items: ['python3', 'bandit', 'safety', 'semgrep', 'scapy', 'impacket'] },
  { cat: 'Utilidades',           items: ['git', 'vim', 'nano', 'jq', 'curl', 'wget', 'tree'] },
]

export default function TerminalPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
          <Terminal size={20} className="text-cyber-green" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-cyber-text">Terminal de Prácticas</h1>
          <p className="text-xs text-cyber-muted font-mono">Entorno Linux con herramientas de ciberseguridad</p>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 p-4 rounded-xl border border-[#ffa502]/30 bg-[#ffa502]/5"
      >
        <AlertTriangle size={16} className="text-[#ffa502] shrink-0 mt-0.5" />
        <p className="text-xs text-cyber-muted leading-relaxed">
          <span className="text-[#ffa502] font-semibold">Uso ético:</span> Esta terminal es para prácticas del curso.
          Las herramientas deben usarse únicamente en entornos propios o con autorización explícita.
          Cualquier uso indebido es responsabilidad del alumno.
        </p>
      </motion.div>

      {/* Terminal iframe */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-cyber-border overflow-hidden"
        style={{ boxShadow: '0 0 40px rgba(0,255,136,0.08)' }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-cyber-surface border-b border-cyber-border">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-xs font-mono text-cyber-muted flex-1 text-center">student@cursopps ~ bash</span>
          <Terminal size={12} className="text-cyber-green" />
        </div>

        {/* xterm.js terminal */}
        <TerminalEmulator />
      </motion.div>

      {/* Tools grid */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Package size={16} className="text-cyber-blue" />
          <h2 className="text-base font-semibold text-cyber-text">Herramientas instaladas</h2>
          <div className="flex-1 h-px bg-cyber-border" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TOOLS.map((group, i) => (
            <motion.div
              key={group.cat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="p-4 rounded-xl border border-cyber-border bg-cyber-card"
            >
              <div className="text-xs font-mono text-cyber-green mb-3 font-semibold">{group.cat}</div>
              <div className="flex flex-wrap gap-1.5">
                {group.items.map(tool => (
                  <span
                    key={tool}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyber-surface border border-cyber-border text-cyber-muted"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
