import { NextRequest, NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/safe-redirect'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Handles the link from the confirmation email. Supabase sends the user here with a
// PKCE `?code=...`; we exchange it for a session (cookies) and forward to `next`.
// Redirects are built from the request's own origin, so the host is always correct.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeRedirectPath(searchParams.get('next'), '/my-stack')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(next, origin))
  }

  const message = 'We could not confirm your email automatically. Please sign in.'
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, origin))
}
