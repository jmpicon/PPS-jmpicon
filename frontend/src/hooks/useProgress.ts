import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'cursopps_progress'

type Progress = Record<string, Record<string, boolean>>

function load(): Progress {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const toggleFile = useCallback((moduleSlug: string, filename: string) => {
    setProgress(prev => {
      const mod = prev[moduleSlug] ?? {}
      return {
        ...prev,
        [moduleSlug]: { ...mod, [filename]: !mod[filename] },
      }
    })
  }, [])

  const getModuleProgress = useCallback(
    (moduleSlug: string, totalFiles: number) => {
      const mod = progress[moduleSlug] ?? {}
      const done = Object.values(mod).filter(Boolean).length
      return totalFiles > 0 ? Math.round((done / totalFiles) * 100) : 0
    },
    [progress],
  )

  const isFileViewed = useCallback(
    (moduleSlug: string, filename: string) => !!(progress[moduleSlug]?.[filename]),
    [progress],
  )

  return { toggleFile, getModuleProgress, isFileViewed }
}
