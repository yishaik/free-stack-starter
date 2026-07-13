import { getService } from './services'

export const MY_STACK_STORAGE_KEY = 'free-stack-directory:my-stack:v1'
export const MAX_STACK_SERVICES = 100

export function normalizeServiceIds(value: unknown) {
  if (!Array.isArray(value)) return []

  const ids: string[] = []
  const seen = new Set<string>()
  for (const candidate of value) {
    if (typeof candidate !== 'string') continue
    const id = candidate.trim()
    if (!id || seen.has(id) || !getService(id)) continue
    seen.add(id)
    ids.push(id)
    if (ids.length >= MAX_STACK_SERVICES) break
  }
  return ids
}

export function parseStoredStack(value: string | null) {
  if (!value) return []
  try {
    return normalizeServiceIds(JSON.parse(value))
  } catch {
    return []
  }
}

export function mergeServiceIds(...groups: string[][]) {
  return normalizeServiceIds(groups.flat())
}
