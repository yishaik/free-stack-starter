import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createRateLimitBucket, consumeRateLimit, RateLimitUnavailableError } from '@/lib/rate-limit'
import { getService } from '@/lib/services'
import { runCredentialTest } from '@/lib/test-runner'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 8_192
const MAX_TOKEN_LENGTH = 4_096
const RATE_LIMIT = 12
const RATE_WINDOW_SECONDS = 60

function clientIp(request: NextRequest) {
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown'
}

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return true

  const allowed = new Set([request.nextUrl.origin])
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    try { allowed.add(new URL(configured).origin) } catch { /* invalid deployment config */ }
  }
  return allowed.has(origin)
}

function json(
  requestId: string,
  body: unknown,
  status = 200,
  rateLimit?: { remaining: number; resetAt: Date; backend: string },
) {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store, max-age=0',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Request-ID': requestId,
  }

  if (rateLimit) {
    headers['RateLimit-Limit'] = String(RATE_LIMIT)
    headers['RateLimit-Remaining'] = String(rateLimit.remaining)
    headers['RateLimit-Reset'] = String(Math.ceil(rateLimit.resetAt.getTime() / 1000))
    headers['X-RateLimit-Backend'] = rateLimit.backend
  }

  return NextResponse.json(body, { status, headers })
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()

  if (!allowedOrigin(request)) {
    return json(requestId, { error: 'Request origin is not allowed.' }, 403)
  }

  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json(requestId, { error: 'Content-Type must be application/json.' }, 415)
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
    return json(requestId, { error: 'Request is too large.' }, 413)
  }

  let rateLimit
  try {
    rateLimit = await consumeRateLimit({
      bucketHash: createRateLimitBucket('credential-test', clientIp(request)),
      limit: RATE_LIMIT,
      windowSeconds: RATE_WINDOW_SECONDS,
    })
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) {
      return json(requestId, { error: 'Credential testing is temporarily unavailable.' }, 503)
    }
    throw error
  }

  if (!rateLimit.allowed) {
    return json(
      requestId,
      { error: 'Too many tests. Try again after the current rate-limit window.' },
      429,
      rateLimit,
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json(requestId, { error: 'Invalid JSON body.' }, 400, rateLimit)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(requestId, { error: 'Invalid request.' }, 400, rateLimit)
  }

  const { serviceId, token } = body as { serviceId?: unknown; token?: unknown }
  if (
    typeof serviceId !== 'string'
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(serviceId)
    || serviceId.length > 120
    || typeof token !== 'string'
    || token.length < 1
    || token.length > MAX_TOKEN_LENGTH
  ) {
    return json(requestId, { error: 'Invalid request.' }, 400, rateLimit)
  }

  const service = getService(serviceId)
  if (!service) return json(requestId, { error: 'Unknown service.' }, 400, rateLimit)

  if (!service.testerId) {
    return json(requestId, {
      status: 'format-only',
      message: 'This service does not use a conventional API key. Follow its setup documentation.',
    }, 200, rateLimit)
  }

  try {
    const result = await runCredentialTest(service.testerId, token.trim())
    return json(requestId, result, 200, rateLimit)
  } catch {
    return json(requestId, { error: 'Unable to validate this credential safely.' }, 400, rateLimit)
  }
}
