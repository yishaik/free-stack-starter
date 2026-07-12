import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/Badge'

const STACK = [
  ['Frontend', 'Next.js on Vercel', 'Global CDN, SSR + static + API routes, custom domain & SSL'],
  ['DB + Auth', 'Supabase', 'Real Postgres (portable), auth + Row-Level Security'],
  ['Email', 'Resend', '~3,000 transactional emails/mo — signup, reset'],
  ['Errors', 'Sentry', '~5,000 events/mo — catch prod crashes'],
  ['Storage', 'Cloudflare R2', '10 GB + zero egress — assets scale for free'],
  ['AI models', 'Hugging Face', 'Free models, datasets, Spaces, local inference + small API credit'],
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
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* live status badge — green when the app is deployed & running */}
        <Badge variant="success" dot live>Live</Badge>
        <Badge variant="accent">$0 / month · scales to thousands of users</Badge>
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Free Stack Starter</h1>
      <p className="mt-3 max-w-xl text-muted">
        Next.js + Supabase + Resend + Sentry + Cloudflare R2, with an optional Hugging Face
        layer for models, datasets, Spaces, and local AI. Clone, add your keys, deploy to Vercel.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
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
          href="https://github.com/yishaik/free-stack-starter/blob/main/docs/STACK-GUIDE.md"
          className="rounded-lg border border-line px-4 py-2 text-ink"
        >
          Read the stack guide
        </a>
        <a
          href="https://github.com/yishaik/free-stack-starter/blob/main/docs/HUGGING-FACE-FREE.md"
          className="rounded-lg border border-line px-4 py-2 text-ink"
        >
          Hugging Face free guide
        </a>
      </div>

      <div className="mt-12 grid gap-3 sm:grid-cols-2">
        {STACK.map(([layer, tool, why]) => (
          <div key={layer} className="rounded-xl border border-line bg-panel p-4">
            <Badge variant="default">{layer}</Badge>
            <div className="mt-2 font-semibold">{tool}</div>
            <div className="mt-1 text-sm text-muted">{why}</div>
          </div>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted">
        The core web stack can stay at $0 for substantial side-project usage. AI inference has
        separate compute limits; use the Hugging Face free layer for experiments and local models,
        then budget production inference once traffic becomes measurable.
      </p>
    </main>
  )
}
