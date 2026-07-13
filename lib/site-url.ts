// Resolves the public origin used for auth email links (e.g. the signup
// confirmation `emailRedirectTo`). Reads it from environment configuration so the
// link points at the real deployment instead of a hard-coded/localhost value.
//
// Returns `null` for local development (unset, or a localhost/127.0.0.1 origin) so
// callers can skip `emailRedirectTo` and leave the Supabase default in place — the
// override applies only to deployed (non-local) environments.
type EnvLike = Record<string, string | undefined>

export function deployedBaseUrl(env: EnvLike = process.env): string | null {
  const raw =
    env.NEXT_PUBLIC_SITE_URL
    || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
    || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '')

  if (!raw) return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '0.0.0.0') return null

  return url.origin
}

// Full URL the confirmation email should send the user back to. `null` in local dev.
export function authCallbackUrl(next: string, env: EnvLike = process.env): string | null {
  const base = deployedBaseUrl(env)
  if (!base) return null
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`
}
