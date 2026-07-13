import { createHmac } from 'node:crypto'

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: Date
  backend: 'supabase' | 'memory'
}

type MemoryBucket = {
  count: number
  resetAt: number
}

export function hashRateLimitBucket(value: string, secret: string) {
  if (!value.trim()) throw new Error('Rate-limit bucket value is required.')
  if (secret.length < 16) throw new Error('Rate-limit secret must contain at least 16 characters.')
  return createHmac('sha256', secret).update(value).digest('hex')
}

export function consumeMemoryBucket(
  buckets: Map<string, MemoryBucket>,
  bucketHash: string,
  limit: number,
  windowSeconds: number,
  now = Date.now(),
): RateLimitResult {
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Rate limit must be a positive integer.')
  if (!Number.isInteger(windowSeconds) || windowSeconds < 1) throw new Error('Rate-limit window must be a positive integer.')

  const current = buckets.get(bucketHash)
  const windowMs = windowSeconds * 1000
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(bucketHash, { count: 1, resetAt })
    return { allowed: true, remaining: Math.max(limit - 1, 0), resetAt: new Date(resetAt), backend: 'memory' }
  }

  current.count += 1
  return {
    allowed: current.count <= limit,
    remaining: Math.max(limit - current.count, 0),
    resetAt: new Date(current.resetAt),
    backend: 'memory',
  }
}

export function pruneMemoryBuckets(buckets: Map<string, MemoryBucket>, now = Date.now()) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}
