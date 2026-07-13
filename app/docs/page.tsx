import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { CATEGORIES, LAST_REVIEWED, SERVICES } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Docs',
  description: 'How to use, extend, and safely connect agents to services in the Free Stack Directory.',
}

const STEPS = [
  ['Find a service', 'Search by name, capability, or tag, then narrow the catalog by category, audience, free model, and credential support.'],
  ['Review the provider', 'Open the official documentation and sign-up flow. Verify current quotas, commercial-use rules, regions, and data-processing terms.'],
  ['Connect your agent', 'Expand “Give an agent access” on the service card and copy the generated setup prompt into your coding agent.'],
  ['Validate safely', 'Use the credential tester for supported providers. Live checks are read-only, server-side, rate-limited, and never persist submitted credentials.'],
]

const SECURITY_RULES = [
  'Prefer an official provider-maintained MCP server. Use the official CLI when no official MCP server exists.',
  'Do not install community packages with similar names unless you have reviewed and explicitly approved them.',
  'Start with read-only, least-privileged scopes and expand permissions only for a concrete task.',
  'Store credentials in a secret manager or an ignored local environment file. Never commit or paste secrets into chat.',
  'Verify access with a harmless identity, account, list, or status command before allowing write operations.',
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-line py-10 last:border-0">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-5 text-sm leading-7 text-muted">{children}</div>
    </section>
  )
}

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-4xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Product documentation</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Free Stack Directory docs</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            Use the directory to discover free and open-source building blocks, connect coding agents through official tooling, and validate credentials without turning the catalog into a secret store.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/#directory" className="rounded-xl bg-accent px-4 py-2.5 font-semibold text-[#06111a]">Browse {SERVICES.length} services</Link>
            <Link href="/test-keys" className="rounded-xl border border-line bg-panel px-4 py-2.5 font-semibold hover:border-accent">Open credential tester</Link>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <nav className="rounded-2xl border border-line bg-panel/70 p-4 text-sm">
              <div className="mb-3 font-semibold text-ink">On this page</div>
              <div className="grid gap-1 text-muted">
                <a href="#overview" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Overview</a>
                <a href="#workflow" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Workflow</a>
                <a href="#agent-access" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Agent access</a>
                <a href="#credentials" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Credential safety</a>
                <a href="#catalog" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Catalog model</a>
                <a href="#contributing" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Contributing</a>
              </div>
            </nav>
          </aside>

          <div className="min-w-0 rounded-2xl border border-line bg-panel/40 px-5 sm:px-8">
            <Section id="overview" title="Overview">
              <p>
                The site is a curated directory of <strong className="text-ink">{SERVICES.length} services</strong> across <strong className="text-ink">{CATEGORIES.length} categories</strong>. Entries cover permanent free tiers, open-source projects, starter credits, and programs for open-source maintainers.
              </p>
              <p className="mt-4">
                Catalog metadata was last reviewed on <strong className="text-ink">{LAST_REVIEWED}</strong>. Provider limits change frequently, so the official documentation remains the source of truth for quotas, pricing, licensing, and production eligibility.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <span key={category} className="rounded-full border border-line bg-bg px-3 py-1 text-xs text-muted">{category}</span>
                ))}
              </div>
            </Section>

            <Section id="workflow" title="Recommended workflow">
              <div className="grid gap-4 sm:grid-cols-2">
                {STEPS.map(([title, description], index) => (
                  <div key={title} className="rounded-xl border border-line bg-bg p-4">
                    <div className="font-mono text-xs text-accent">0{index + 1}</div>
                    <h3 className="mt-2 font-semibold text-ink">{title}</h3>
                    <p className="mt-2 leading-6">{description}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="agent-access" title="Agent access prompts">
              <p>
                Every service card includes a copyable prompt tailored with that provider’s name, official documentation URL, and account setup page. The prompt asks an agent to prefer the provider’s official MCP server, fall back to its official CLI, and use the official SDK or API only when no official MCP or CLI exists.
              </p>
              <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
                <h3 className="font-semibold text-ink">What the agent must report</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>The exact official package, binary, or repository installed.</li>
                  <li>The configuration file and environment variables added.</li>
                  <li>The permissions or scopes granted.</li>
                  <li>The read-only verification command and result.</li>
                </ul>
              </div>
              <p className="mt-5">
                The prompt deliberately avoids hard-coded install commands. Package names and installation methods change; the agent must resolve them from current official documentation and reject unofficial look-alikes.
              </p>
            </Section>

            <Section id="credentials" title="Credential safety">
              <ul className="list-disc space-y-2 pl-5">
                {SECURITY_RULES.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
              <div className="mt-5 rounded-xl border border-line bg-bg p-4">
                <h3 className="font-semibold text-ink">Credential tester behavior</h3>
                <p className="mt-2">
                  Supported live tests send the submitted credential only to a hard-coded, read-only provider endpoint. Requests are processed server-side, redirects are refused, request bodies are capped, and tests are rate-limited. Credentials are not stored or logged by the application.
                </p>
              </div>
            </Section>

            <Section id="catalog" title="Catalog data model">
              <p>
                Services are stored in <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/catalog-a.ts</code> through <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/catalog-d.ts</code>. Each pipe-delimited row is parsed into a typed service object by <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/services.ts</code>.
              </p>
              <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-6 text-ink"><code>{'Name|category|audience|plan|summary|signup|docs|tag1,tag2|testerId'}</code></pre>
              <p className="mt-4">
                The agent-access prompt is generated at render time, so every existing service—and every correctly added future service—receives the feature automatically without duplicating prompt text in the catalog.
              </p>
            </Section>

            <Section id="contributing" title="Contributing a service">
              <ol className="list-decimal space-y-2 pl-5">
                <li>Add a unique row to the appropriate catalog file.</li>
                <li>Use the provider’s official sign-up and documentation URLs.</li>
                <li>Choose the closest existing category, audience, and free-plan code.</li>
                <li>Add a tester ID only when the credential workbench supports that provider.</li>
                <li>Run <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">npm run typecheck</code> and <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">npm run build</code>.</li>
              </ol>
              <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="mt-5 inline-flex font-semibold text-accent hover:underline">Open the repository ↗</a>
            </Section>
          </div>
        </div>
      </main>
    </>
  )
}
