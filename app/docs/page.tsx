import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { AUDIENCES, CATEGORIES, LAST_REVIEWED, SERVICES } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Use, extend and safely maintain the Free Stack Directory and its agent-access and credential workflows.',
}

const STEPS = [
  ['Search broadly', 'Fuzzy search matches names, descriptions, categories and tags, including small misspellings.'],
  ['Narrow precisely', 'Combine multiple categories, audiences, plans, tags and the live-key-test filter. Filters are saved in the URL.'],
  ['Review evidence', 'Check the official documentation, source list and last-verified date before choosing a service.'],
  ['Connect safely', 'Copy the agent-access prompt, grant read-only permissions first and use the credential tester where supported.'],
]

const SOURCES = [
  ['Awesome DevOps', 'https://github.com/wmariuss/awesome-devops', 'Cloud, CI/CD, containers, infrastructure as code and platform engineering.'],
  ['Awesome Sysadmin', 'https://github.com/awesome-foss/awesome-sysadmin', 'IT operations, backups, monitoring, identity, networking and remote access.'],
  ['Awesome Productivity', 'https://github.com/jyguyomarch/awesome-productivity', 'Notes, task management, collaboration, office and personal productivity.'],
  ['Awesome Selfhosted', 'https://github.com/awesome-selfhosted/awesome-selfhosted', 'Self-hosted collaboration, business operations, data, knowledge and homelab tools.'],
]

const SECURITY_RULES = [
  'Prefer a provider-maintained official MCP server, then its official CLI, then its official SDK or API.',
  'Verify the publisher, package namespace, repository and release provenance before installation.',
  'Start with read-only, least-privileged scopes and expand permissions only for a concrete task.',
  'Keep credentials in a secret manager or ignored environment file. Never place secret values in chat, source control or logs.',
  'Use a harmless identity, account, list, version or status command before allowing write operations.',
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-line py-10 last:border-0">
      <h2 className="text-2xl font-bold tracking-tight text-ink">{title}</h2>
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
          <h1 className="mt-2 text-4xl font-black tracking-tight text-ink sm:text-5xl">Free Stack Directory docs</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
            The project is both a curated directory of free and open-source tools and a real-world example of a maintainable $0 starting stack.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/#directory" className="rounded-xl bg-accent px-4 py-2.5 font-semibold text-[#06111a]">Browse {SERVICES.length} services</Link>
            <Link href="/test-keys" className="rounded-xl border border-line bg-panel px-4 py-2.5 font-semibold text-ink hover:border-accent">Open credential tester</Link>
          </div>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <nav className="rounded-2xl border border-line bg-panel/80 p-4 text-sm">
              <div className="mb-3 font-semibold text-ink">On this page</div>
              <div className="grid gap-1 text-muted">
                <a href="#overview" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Overview</a>
                <a href="#search" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Search and filters</a>
                <a href="#cards" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Service cards</a>
                <a href="#agent-access" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Agent access</a>
                <a href="#credentials" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Credential safety</a>
                <a href="#catalog" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Catalog model</a>
                <a href="#sources" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Sources</a>
                <a href="#maintenance" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Maintenance</a>
              </div>
            </nav>
          </aside>

          <div className="min-w-0 rounded-2xl border border-line bg-panel/50 px-5 sm:px-8">
            <Section id="overview" title="Overview">
              <p>
                The site contains <strong className="text-ink">{SERVICES.length} services</strong> across <strong className="text-ink">{CATEGORIES.length} categories</strong> and <strong className="text-ink">{AUDIENCES.length} audience profiles</strong>. It covers development, DevOps, IT, security, data, design, productivity and business operations.
              </p>
              <p className="mt-4">
                Catalog metadata was last reviewed on <strong className="text-ink">{LAST_REVIEWED}</strong>. Provider limits and licenses change, so official provider documentation remains the source of truth.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {STEPS.map(([title, description], index) => (
                  <div key={title} className="rounded-xl border border-line bg-bg p-4">
                    <div className="font-mono text-xs text-accent">0{index + 1}</div>
                    <h3 className="mt-2 font-semibold text-ink">{title}</h3>
                    <p className="mt-2 leading-6">{description}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="search" title="Search and filters">
              <p>Search is client-side, debounced and fuzzy. Selected filters use OR logic inside categories, audiences and plans; selected tags use AND logic so each result contains every chosen tag.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Multi-select categories, audiences, free-plan models and tags.</li>
                <li>Live-key-test toggle and quick audience filters for DevOps, IT and Productivity.</li>
                <li>Sort by relevance, name, verification date, open-source status or live-test availability.</li>
                <li>Active filter chips with individual removal and a single Clear all action.</li>
                <li>URL persistence for sharing, bookmarks and browser back/forward navigation.</li>
                <li>Incremental rendering with automatic load-more and a manual fallback button.</li>
              </ul>
            </Section>

            <Section id="cards" title="Service-card contract">
              <p>Every card uses the same information contract so services can be compared without opening multiple tabs:</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {['Category and free model', 'All inferred and explicit audiences', 'Capability tags', 'Official setup and documentation links', 'Last-verified date and discovery source', 'Platforms and deployment metadata', 'Credential setup or live test', 'Copyable agent-access prompt'].map((item) => (
                  <div key={item} className="rounded-xl border border-line bg-bg px-4 py-3 text-ink">{item}</div>
                ))}
              </div>
            </Section>

            <Section id="agent-access" title="Agent access prompts">
              <p>Every service card generates a context-aware prompt containing the provider name, category, audience, tags and official links. The prompt requires official tooling and supply-chain verification.</p>
              <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
                <h3 className="font-semibold text-ink">Agent execution order</h3>
                <ol className="mt-2 list-decimal space-y-1 pl-5">
                  <li>Official provider-maintained MCP server.</li>
                  <li>Official CLI using the current documented installation method.</li>
                  <li>Official SDK or API only when no official MCP or CLI exists.</li>
                  <li>Read-only verification and a sanitized implementation report.</li>
                </ol>
              </div>
            </Section>

            <Section id="credentials" title="Credential safety">
              <ul className="list-disc space-y-2 pl-5">
                {SECURITY_RULES.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
              <div className="mt-5 rounded-xl border border-line bg-bg p-4">
                <h3 className="font-semibold text-ink">Credential tester behavior</h3>
                <p className="mt-2">Supported live tests send the submitted credential only to a fixed read-only provider endpoint. Requests are server-side, redirects are refused, bodies are capped and credentials are not stored by the application.</p>
              </div>
            </Section>

            <Section id="catalog" title="Catalog data model">
              <p>Catalog files live in <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/catalog-a.ts</code> through <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/catalog-e.ts</code>. The parser supports both the original compact rows and extended metadata.</p>
              <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-6 text-ink"><code>{'Name|category|audiences|plan|summary|signup|docs|tags|testerId|lastVerified|source|platforms|deployment'}</code></pre>
              <p className="mt-4">Legacy rows receive the catalog review date and repository source automatically. Categories and tags infer additional audiences, allowing the existing catalog to support DevOps, IT, security, data, productivity and operations without a destructive migration.</p>
            </Section>

            <Section id="sources" title="Curated sources">
              <div className="grid gap-4 sm:grid-cols-2">
                {SOURCES.map(([name, url, description]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-line bg-bg p-4 hover:border-accent">
                    <h3 className="font-semibold text-ink">{name} ↗</h3>
                    <p className="mt-2 leading-6">{description}</p>
                  </a>
                ))}
              </div>
              <p className="mt-4">Awesome lists are discovery sources, not automatic imports. Each added entry should still use official provider URLs and be reviewed for maintenance, licensing and free-use eligibility.</p>
            </Section>

            <Section id="maintenance" title="Maintenance and validation">
              <pre className="overflow-x-auto rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-6 text-ink"><code>{`npm run typecheck
npm test
npm run catalog:validate
npm run catalog:stats
npm run build
npm run check`}</code></pre>
              <p className="mt-4">GitHub Actions runs type checking, dependency-free Node tests, catalog validation and a production build on every pull request. The validator checks metadata completeness and reports category, audience and source coverage.</p>
              <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="mt-5 inline-flex font-semibold text-accent hover:underline">Open the repository ↗</a>
            </Section>
          </div>
        </div>
      </main>
    </>
  )
}
