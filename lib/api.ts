import * as Sentry from '@sentry/nextjs'
import { NextResponse } from 'next/server'

export function apiError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status })
}

export function internalError(error: unknown) {
  const requestId = crypto.randomUUID()
  Sentry.captureException(error, { tags: { requestId } })
  console.error(`[${requestId}]`, error)
  return NextResponse.json(
    { error: 'Unable to process request', requestId },
    { status: 500 },
  )
}
