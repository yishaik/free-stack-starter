import type { Metadata } from 'next'
import { HarnessView } from '@/components/HarnessView'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'AI Project Harness',
  description: 'Inspect, test, and build GitHub projects in isolated Vercel Sandboxes with Supabase-backed run history.',
  robots: { index: false, follow: false },
}

export default function HarnessPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Isolated execution workspace</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-ink sm:text-5xl">AI Project Harness</h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Connect a public GitHub repository, run a bounded inspection, test, or build inside Vercel Sandbox, and keep the result and AI diagnosis in Supabase.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs text-muted">
            <span className="rounded-full border border-line px-3 py-1.5">GitHub source</span>
            <span className="rounded-full border border-line px-3 py-1.5">Vercel Sandbox</span>
            <span className="rounded-full border border-line px-3 py-1.5">Supabase RLS</span>
            <span className="rounded-full border border-line px-3 py-1.5">AI Gateway analysis</span>
          </div>
        </div>
        <HarnessView />
      </main>
    </>
  )
}
