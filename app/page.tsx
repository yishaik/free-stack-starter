import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const STACK = [
  ['Frontend', 'Next.js on Vercel', 'Global CDN, SSR + static + API routes, custom domain & SSL'],
  ['DB + Auth', 'Supabase', 'Real Postgres (portable), auth + Row-Level Security'],
  ['Email', 'Resend', '~3,000 transactional emails/mo — signup, reset'],
  ['Errors', 'Sentry', '~5,000 events/mo — catch prod crashes'],
  ['Storage', 'Cloudflare R2', '10 GB + zero egress — assets scale for free'],
  ['Domain', 'Cloudflare Registrar', 'At-cost domain, free DNS/SSL/email routing'],
]

export default async function Home() {
  // demonstrates a server-side Supabase read of the current session
  let email: string | null = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    email = data.user?.email ?? null
  } catch {
    // Supabase not configured yet — the landing page still renders
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">
        $0 / month · scales to thousands of users
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Free Stack Starter</h1>
      <p className="mt-3 max-w-xl text-muted">
        Next.js + Supabase + Resend + Sentry + Cloudflare R2, wired and ready. Clone,
        add your keys, deploy to Vercel. No monthly bill until you hit real scale.
      </p>

      <div className="mt-6 flex gap-3">
        {email ? (
          <Link href="/dashboard" className="rounded-lg bg-accent px-4 py-2 font-semibold text-[#06111a]">
            Go to dashboard →
          </Link>
        ) : (
          <Link href="/login" className="rounded-lg bg-accent px-4 py-2 font-semibold text-[#06111a]">
            Sign in →
          </Link>
        )}
        <a
          href="https://github.com/"
          className="rounded-lg border border-line px-4 py-2 text-ink"
        >
          Read the stack guide
        </a>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {STACK.map(([layer, tool, why]) => (
          <div key={layer} className="rounded-xl border border-line bg-panel p-4">
            <div className="text-xs uppercase tracking-wide text-muted">{layer}</div>
            <div className="mt-1 font-semibold">{tool}</div>
            <div className="mt-1 text-sm text-muted">{why}</div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">
        See <code className="text-accent">docs/STACK-GUIDE.md</code> for the full comparison
        and the reasoning behind each choice.
      </p>
    </main>
  )
}
