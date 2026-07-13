import Link from 'next/link'
import { ServiceDirectory } from '@/components/ServiceDirectory'
import { SiteHeader } from '@/components/SiteHeader'
import { CATEGORIES, LAST_REVIEWED, SERVICES } from '@/lib/services'
import { LIVE_TESTER_SET } from '@/lib/live-testers'

const liveTests = SERVICES.filter((service) => service.testerId && LIVE_TESTER_SET.has(service.testerId)).length
const designerTools = SERVICES.filter((service) => service.audience === 'Designers' || service.audience === 'Both').length

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(139,92,246,0.12),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">Community-ready catalog</span>
                <span className="rounded-full border border-line bg-panel px-3 py-1 text-xs text-muted">Reviewed {LAST_REVIEWED}</span>
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                Build a serious product with a <span className="text-accent">$0 starting stack.</span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
                A searchable directory of free tiers, open-source tools, design resources, APIs and developer platforms. Each service includes official docs, credential guidance, and a copyable prompt that connects your coding agent through the provider’s official MCP, CLI, SDK, or API.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#directory" className="rounded-xl bg-accent px-5 py-3 font-semibold text-[#06111a]">Explore all services ↓</a>
                <Link href="/docs" className="rounded-xl border border-line bg-panel px-5 py-3 font-semibold hover:border-accent">Read the docs →</Link>
                <Link href="/test-keys" className="rounded-xl border border-line bg-panel px-5 py-3 font-semibold hover:border-accent">Test API keys →</Link>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [SERVICES.length.toString(), 'services and tools'],
                [CATEGORIES.length.toString(), 'practical categories'],
                [liveTests.toString(), 'secure live key checks'],
                [designerTools.toString(), 'designer-friendly options'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-line bg-panel/70 p-5 backdrop-blur">
                  <div className="font-mono text-3xl font-black text-accent">{value}</div>
                  <div className="mt-1 text-sm text-muted">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="directory" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">The directory</p>
              <h2 className="mt-2 text-3xl font-bold">Find the right free building block</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted">
              Free-tier limits and eligibility change. Verify the current allowance, commercial-use terms, and official agent tooling on each provider’s documentation before production use.
            </p>
          </div>
          <ServiceDirectory />
        </section>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:px-8">
          <span>Free Stack Directory · MIT licensed</span>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-accent">Docs</Link>
            <Link href="/test-keys" className="hover:text-accent">Credential security</Link>
            <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="hover:text-accent">Contribute a service ↗</a>
          </div>
        </div>
      </footer>
    </>
  )
}
