import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../login/actions'
import { UploadDemo } from '@/components/UploadDemo'
import { Badge } from '@/components/Badge'
import { env, hasR2Env, hasSupabaseEnv } from '@/lib/env'

const checks = [
  ['Supabase', hasSupabaseEnv(), 'Authentication and Postgres connection variables'],
  ['Cloudflare R2', hasR2Env(), 'Private object storage and signed uploads'],
  ['Resend', Boolean(env.RESEND_API_KEY && env.EMAIL_FROM), 'Transactional email'],
  ['Sentry', Boolean(env.NEXT_PUBLIC_SENTRY_DSN), 'Errors and tracing'],
  ['Hugging Face', Boolean(process.env.HF_TOKEN), 'Optional AI access'],
] as const

export default async function Dashboard() {
  let user = null
  try {
    const supabase = await createClient()
    user = (await supabase.auth.getUser()).data.user
  } catch {
    // A fresh clone can render public pages before Supabase is configured.
  }
  if (!user) redirect('/login')

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Integration dashboard</h1>
            <Badge variant="success" dot>Signed in</Badge>
          </div>
          <p className="mt-2 text-muted">Signed in as <span className="text-ink">{user.email}</span>.</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-line px-3 py-1.5 text-sm">Log out</button>
        </form>
      </div>

      <section className="mt-8 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-semibold">Setup status</h2>
        <p className="mt-1 text-sm text-muted">Only configuration presence is shown; secret values never reach the browser.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {checks.map(([name, ready, description]) => (
            <div key={name} className="rounded-lg border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <strong>{name}</strong>
                <Badge variant={ready ? 'success' : 'warning'} dot>{ready ? 'Ready' : 'Setup needed'}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <a href="/api/health" className="text-accent underline">Health JSON</a>
          <a href="/api/ready" className="text-accent underline">Readiness JSON</a>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-semibold">Secure R2 upload test</h2>
        <p className="mt-1 text-sm text-muted">
          Signed-in users receive a short-lived upload URL constrained by file type and size.
        </p>
        <UploadDemo />
      </section>
    </main>
  )
}
