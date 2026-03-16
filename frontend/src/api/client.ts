import type { Module, ModuleList, SearchResult, Stats } from '../types'

const BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
    credentials: 'omit',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Error' }))
    throw new Error(err.detail ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  getModules: ()               => get<ModuleList>('/modules'),
  getModule:  (slug: string)   => get<Module>(`/modules/${slug}`),
  getStats:   ()               => get<Stats>('/modules/stats'),
  search:     (q: string)      => get<SearchResult[]>(`/search?q=${encodeURIComponent(q)}`),
  health:     ()               => get<{ status: string }>('/health'),
  authMe:     ()               => get<{ authenticated: boolean }>('/auth/me'),
  login:      (code: string)   => post<{ ok: boolean }>('/auth/login', { code }),
  logout:     ()               => post<{ ok: boolean }>('/auth/logout', {}),
}
