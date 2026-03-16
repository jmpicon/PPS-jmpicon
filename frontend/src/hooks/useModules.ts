import { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { Module, Stats } from '../types'

export function useModules() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.getModules()
      .then(data => setModules(data.modules))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { modules, loading, error }
}

export function useModule(slug: string) {
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.getModule(slug)
      .then(setModule)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  return { module, loading, error }
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  return { stats, loading }
}
