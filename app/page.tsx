import Link from 'next/link'
import { MyStackProvider } from '@/components/MyStackProvider'
import { ServiceDirectory } from '@/components/ServiceDirectory'
import { SiteHeader } from '@/components/SiteHeader'
import { AUDIENCES, CATEGORIES, LAST_REVIEWED, SERVICES } from '@/lib/services'
import { LIVE_TESTER_SET } from '@/lib/live-testers'

const liveTests = SERVICES.filter((service) => service.testerId && LIVE_TESTER_SET.has(service.testerId)).length

const COLLECTIONS = [
  ['DevOps', 'CI/CD, containers, infrastructure, observability and platform engineering.'],
  ['IT', 'Asset management, backups, networking, remote access and homelab operations.'],
  ['Productivity', 'Notes, project management, documents, scheduling and collaboration.'],
  ['Data & AI', 'Models, vector search, data pipelines, BI and analytics tooling.'],
] as const

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgb(var(--color-accent)/0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.11),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Curated · community-ready</span>
                <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted">Reviewed {LAST_REVIEWED}</span>
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-ink sm:text-6xl">
                Find the right free tool for <span className="text-accent">every layer of your stack.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
                A curated directory for development, DevOps, IT, security, data, design, productivity and business operations. Every service includes official links, searchable tags, verification metadata, credential guidance and a copyable agent-access prompt.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                The directory is also a real-world example of a production-ready <strong className="text-ink">$0 starting stack</strong>, built with Next.js, Vercel and Supabase-friendly architecture.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#directory" className="rounded-xl bg-accent px-5 py-3 font-semibold text-[#06111a]">Explore all services ↓</a>
                <Link href="/my-stack" className="rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 font-semibold text-accent hover:border-accent">Open My Stack →</Link>
                <Link href="/docs" className="rounded-xl border border-line bg-panel px-5 py-3 font-semibold text-ink hover:border-accent">Read the docs →</Link>
                <Link href="/test-keys" className="rounded-xl border border-line bg-panel px-5 py-3 font-semibold text-ink hover:border-accent">Test API keys →</Link>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [SERVICES.length.toString(), 'services and tools'],
                [CATEGORIES.length.toString(), 'practical categories'],
                [AUDIENCES.length.toString(), 'audience profiles'],
                [liveTests.toString(), 'secure live key checks'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-line bg-panel/75 p-5 shadow-sm backdrop-blur">
                  <div className="font-mono text-3xl font-black text-accent">{value}</div>
                  <div className="mt-1 text-sm text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-line bg-panel/30">
          <div className="mx-auto grid max-w-7xl gap-3 px-5 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {COLLECTIONS.map(([audience, description]) => (
              <a key={audience} href={`/?audiences=${encodeURIComponent(audience)}#directory`} className="rounded-2xl border border-line bg-panel p-4 transition hover:-translate-y-0.5 hover:border-accent">
                <div className="font-semibold text-ink">{audience}</div>
                <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
              </a>
            ))}
          </div>
        </section>

        <section id="directory" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">The directory</p>
              <h2 className="mt-2 text-3xl font-bold text-ink">Find the right building block</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted">
              Free-tier limits and eligibility change. Verify current allowances, commercial-use terms and official agent tooling in each provider’s documentation before production use.
            </p>
          </div>
          <MyStackProvider><ServiceDirectory /></MyStackProvider>
        </section>
      </main>
      <footer className="border-t border-line bg-panel/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:px-8">
          <span>Free Stack Directory · curated directory + real $0 stack example</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/my-stack" className="hover:text-accent">My Stack</Link>
            <Link href="/docs" className="hover:text-accent">Docs</Link>
            <Link href="/test-keys" className="hover:text-accent">Credential security</Link>
            <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="hover:text-accent">Contribute a service ↗</a>
          </div>
        </div>
      </footer>
    </>
  )
}
