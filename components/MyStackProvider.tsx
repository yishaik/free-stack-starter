'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { mergeServiceIds, MY_STACK_STORAGE_KEY, parseStoredStack } from '@/lib/my-stack-core'

type MyStackMode = 'loading' | 'local' | 'account'

type MyStackContextValue = {
  savedIds: string[]
  savedCount: number
  mode: MyStackMode
  syncing: boolean
  error: string | null
  isSaved: (serviceId: string) => boolean
  toggleService: (serviceId: string) => Promise<void>
  clearError: () => void
}

const MyStackContext = createContext<MyStackContextValue | null>(null)

function persist(ids: string[]) {
  window.localStorage.setItem(MY_STACK_STORAGE_KEY, JSON.stringify(ids))
}

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => ({})) as { serviceIds?: unknown; error?: unknown }
  return {
    serviceIds: Array.isArray(payload.serviceIds) ? payload.serviceIds.filter((id): id is string => typeof id === 'string') : [],
    error: typeof payload.error === 'string' ? payload.error : null,
  }
}

export function MyStackProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [mode, setMode] = useState<MyStackMode>('loading')
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const local = parseStoredStack(window.localStorage.getItem(MY_STACK_STORAGE_KEY))
    setSavedIds(local)

    async function initialize() {
      try {
        const response = await fetch('/api/my-stack', { cache: 'no-store' })
        if (!active) return

        if (response.status === 401 || response.status === 503) {
          setMode('local')
          return
        }

        const payload = await readResponse(response)
        if (!response.ok) {
          setMode('local')
          setError(payload.error || 'Unable to check account sync.')
          return
        }

        const merged = mergeServiceIds(payload.serviceIds, local)
        setSavedIds(merged)
        persist(merged)
        setMode('account')

        const localAdds = local.filter((id) => !payload.serviceIds.includes(id))
        if (localAdds.length) {
          setSyncing(true)
          const syncResponse = await fetch('/api/my-stack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceIds: localAdds }),
          })
          const synced = await readResponse(syncResponse)
          if (!active) return
          if (syncResponse.ok) {
            const finalIds = mergeServiceIds(synced.serviceIds, merged)
            setSavedIds(finalIds)
            persist(finalIds)
          } else {
            setError(synced.error || 'Local services could not be synced to your account.')
          }
          setSyncing(false)
        }
      } catch {
        if (active) setMode('local')
      }
    }

    void initialize()
    return () => { active = false }
  }, [])

  const toggleService = useCallback(async (serviceId: string) => {
    const wasSaved = savedIds.includes(serviceId)
    const previous = savedIds
    const next = wasSaved
      ? savedIds.filter((id) => id !== serviceId)
      : mergeServiceIds(savedIds, [serviceId])

    setSavedIds(next)
    persist(next)
    setError(null)

    if (mode !== 'account') return

    setSyncing(true)
    try {
      const response = await fetch('/api/my-stack', {
        method: wasSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      })
      const payload = await readResponse(response)
      if (!response.ok) throw new Error(payload.error || 'Unable to sync My Stack.')
      const canonical = mergeServiceIds(payload.serviceIds)
      setSavedIds(canonical)
      persist(canonical)
    } catch (syncError) {
      setSavedIds(previous)
      persist(previous)
      setError(syncError instanceof Error ? syncError.message : 'Unable to sync My Stack.')
    } finally {
      setSyncing(false)
    }
  }, [mode, savedIds])

  const value = useMemo<MyStackContextValue>(() => ({
    savedIds,
    savedCount: savedIds.length,
    mode,
    syncing,
    error,
    isSaved: (serviceId) => savedIds.includes(serviceId),
    toggleService,
    clearError: () => setError(null),
  }), [savedIds, mode, syncing, error, toggleService])

  return <MyStackContext.Provider value={value}>{children}</MyStackContext.Provider>
}

export function useMyStack() {
  const context = useContext(MyStackContext)
  if (!context) throw new Error('useMyStack must be used inside MyStackProvider.')
  return context
}
