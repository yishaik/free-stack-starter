import 'server-only'

import { consumeMemoryBucket, hashRateLimitBucket, pruneMemoryBuckets, type RateLimitResult } from './rate-limit-core'
import { getSupabaseAdmin, hasSupabaseAdminConfig } from './supabase/admin'

const memoryBuckets = new Map<string, { count: number; resetAt: number }>()
let lastPrunedAt = 0

export class RateLimitUnavailableError extends Error {
  constructor() {
    super('Distributed rate-limit storage is unavailable.')
    this.name = 'RateLimitUnavailableError'
  }
}

function rateLimitSecret() {
  const configured = process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (configured && configured.length >= 16) return configured
  if (process.env.NODE_ENV === 'production') throw new RateLimitUnavailableError()
  return 'development-rate-limit-secret-only'
}

export function createRateLimitBucket(scope: string, identity: string) {
  return hashRateLimitBucket(`${scope}:${identity}`, rateLimitSecret())
}

export async function consumeRateLimit(options: {
  bucketHash: string
  limit: number
  windowSeconds: number
}): Promise<RateLimitResult> {
  if (!hasSupabaseAdminConfig()) {
    const now = Date.now()
    if (now - lastPrunedAt > 60_000) {
      pruneMemoryBuckets(memoryBuckets, now)
      lastPrunedAt = now
    }
    return consumeMemoryBucket(memoryBuckets, options.bucketHash, options.limit, options.windowSeconds, now)
  }

  const admin = getSupabaseAdmin()
  if (!admin) throw new RateLimitUnavailableError()

  const { data, error } = await admin.rpc('consume_rate_limit', {
    p_bucket_hash: options.bucketHash,
    p_limit: options.limit,
    p_window_seconds: options.windowSeconds,
  })

  if (error || !Array.isArray(data) || !data[0]) {
    console.error('Distributed rate limiter failed', {
      code: error?.code,
      message: error?.message,
    })
    throw new RateLimitUnavailableError()
  }

  const row = data[0] as { allowed?: unknown; remaining?: unknown; reset_at?: unknown }
  if (typeof row.allowed !== 'boolean' || typeof row.remaining !== 'number' || typeof row.reset_at !== 'string') {
    throw new RateLimitUnavailableError()
  }

  return {
    allowed: row.allowed,
    remaining: Math.max(0, row.remaining),
    resetAt: new Date(row.reset_at),
    backend: 'supabase',
  }
}
