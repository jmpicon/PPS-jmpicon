import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

interface AuthState {
  authenticated: boolean
  loading: boolean
  login: (code: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    api.authMe()
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (code: string) => {
    await api.login(code)
    setAuthenticated(true)
  }, [])

  const logout = useCallback(async () => {
    await api.logout()
    setAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ authenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
