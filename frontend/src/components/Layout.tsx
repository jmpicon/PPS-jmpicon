import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, LayoutDashboard, BookOpen, Search,
  Menu, X, ChevronRight, Terminal, LogOut,
} from 'lucide-react'
import { cn } from '../utils/cn'
import SearchModal from './SearchModal'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/',          label: 'Dashboard',  Icon: LayoutDashboard },
  { to: '/modulos',   label: 'Módulos',    Icon: BookOpen },
  { to: '/terminal',  label: 'Terminal',   Icon: Terminal },
]

interface LayoutProps { children: React.ReactNode }

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen]   = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text font-sans">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-cyber-surface border-r border-cyber-border z-40">
        <SidebarContent location={location} onSearch={() => setSearchOpen(true)} />
      </aside>

      {/* Sidebar — mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 bg-cyber-surface border-r border-cyber-border z-50 lg:hidden"
            >
              <div className="flex justify-end p-4">
                <button onClick={() => setSidebarOpen(false)} className="text-cyber-muted hover:text-cyber-text">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent location={location} onSearch={() => { setSearchOpen(true); setSidebarOpen(false) }} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Top bar — mobile */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-cyber-surface border-b border-cyber-border sticky top-0 z-30">
        <button onClick={() => setSidebarOpen(true)} className="text-cyber-muted hover:text-cyber-green transition-colors">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-cyber-green" />
          <span className="font-mono font-bold text-sm text-cyber-green">CursoPPS</span>
        </div>
        <button onClick={() => setSearchOpen(true)} className="text-cyber-muted hover:text-cyber-green transition-colors">
          <Search size={20} />
        </button>
      </header>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}

function SidebarContent({
  location,
  onSearch,
}: {
  location: ReturnType<typeof useLocation>
  onSearch: () => void
}) {
  const { logout } = useAuth()
  return (
    <div className="flex flex-col h-full px-4 py-6 gap-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center group-hover:border-cyber-green/60 transition-colors">
            <Shield size={20} className="text-cyber-green" />
          </div>
          <div className="absolute -inset-1 rounded-xl bg-cyber-green/5 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div>
          <div className="font-mono font-bold text-cyber-green leading-none">CursoPPS</div>
          <div className="text-[10px] text-cyber-muted font-mono mt-0.5">Producción Segura</div>
        </div>
      </Link>

      {/* Search */}
      <button
        onClick={onSearch}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border border-cyber-border bg-cyber-card text-cyber-muted hover:text-cyber-text hover:border-cyber-green/40 transition-all group"
      >
        <Search size={16} />
        <span className="text-sm flex-1 text-left">Buscar materiales...</span>
        <kbd className="text-[10px] font-mono bg-cyber-border/50 px-1.5 py-0.5 rounded text-cyber-dim">⌘K</kbd>
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        <div className="text-[10px] font-mono text-cyber-muted uppercase tracking-widest mb-2 px-2">Navegación</div>
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                active
                  ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/30'
                  : 'text-cyber-muted hover:text-cyber-text hover:bg-white/5',
              )}
            >
              <Icon size={17} />
              <span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom badge */}
      <div className="mt-auto space-y-2">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyber-card border border-cyber-border">
          <Terminal size={14} className="text-cyber-green shrink-0" />
          <div>
            <div className="text-[11px] font-mono text-cyber-green">CIPFP Mislata</div>
            <div className="text-[10px] text-cyber-muted">Ciberseguridad FP</div>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-cyber-muted hover:text-cyber-red hover:bg-cyber-red/5 transition-all text-xs"
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
