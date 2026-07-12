import { NextResponse } from 'next/server'
import { env, hasR2Env, hasSupabaseEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

export function GET() {
  const checks = {
    supabase: hasSupabaseEnv(),
    r2: hasR2Env(),
    resend: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
    sentry: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
  }

  const coreReady = checks.supabase
  return NextResponse.json(
    { status: coreReady ? 'ready' : 'setup-required', checks },
    { status: coreReady ? 200 : 503 },
  )
}
