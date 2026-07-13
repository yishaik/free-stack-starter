import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { AUDIENCES, CATEGORIES, LAST_REVIEWED, SERVICES } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Use, extend and safely maintain the Free Stack Directory, My Stack, agent access, and credential workflows.',
}

const STEPS = [
  ['Search broadly', 'Fuzzy search matches names, descriptions, categories and tags, including small misspellings.'],
  ['Narrow precisely', 'Combine multiple categories, audiences, plans, tags and the live-key-test filter. Filters are saved in the URL.'],
  ['Build My Stack', 'Save services locally without an account, then sign in to merge and sync them across devices.'],
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
            The project is both a curated directory of free and open-source tools and a real-world example of a maintainable, secure $0 starting stack.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link href="/#directory" className="rounded-xl bg-accent px-4 py-2.5 font-semibold text-[#06111a]">Browse {SERVICES.length} services</Link>
            <Link href="/my-stack" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 font-semibold text-accent hover:border-accent">Open My Stack</Link>
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
                <a href="#my-stack" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">My Stack</a>
                <a href="#agent-access" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Agent access</a>
                <a href="#credentials" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Credential safety</a>
                <a href="#supabase" className="rounded-lg px-3 py-2 hover:bg-bg hover:text-ink">Supabase schema</a>
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

            <Section id="search" title="Search, filters and cards">
              <p>Search is client-side, debounced and fuzzy. Selected filters use OR logic inside categories, audiences and plans; selected tags use AND logic so each result contains every chosen tag.</p>
              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Multi-select categories, audiences, free-plan models and tags.</li>
                <li>Live-key-test toggle and quick audience filters for DevOps, IT and Productivity.</li>
                <li>Sort by relevance, name, verification date, open-source status or live-test availability.</li>
                <li>Active filter chips, URL persistence, browser navigation and incremental rendering.</li>
                <li>Every card includes official links, source, verification date, audiences, tags, platforms, deployment, credentials, agent access and Save to My Stack.</li>
              </ul>
            </Section>

            <Section id="my-stack" title="My Stack: local-first and account sync">
              <p>Saving a service does not require an account. Anonymous selections are validated against the compiled catalog and stored in a versioned browser key. The personalized page is marked noindex.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-bg p-4">
                  <h3 className="font-semibold text-ink">Local mode</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>No Supabase configuration is required.</li>
                    <li>Selections remain in the current browser.</li>
                    <li>Unknown, duplicated and malformed service IDs are discarded.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-line bg-bg p-4">
                  <h3 className="font-semibold text-ink">Account mode</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>Local and account selections merge after login.</li>
                    <li>The API uses the user's session-bound Supabase client.</li>
                    <li>RLS limits reads and writes to stacks owned by <code className="text-ink">auth.uid()</code>.</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4">The service-role client is never used for My Stack writes. It is reserved for private operational functions such as distributed rate limiting.</p>
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

            <Section id="credentials" title="Credential endpoint security">
              <ul className="list-disc space-y-2 pl-5">
                {SECURITY_RULES.map((rule) => <li key={rule}>{rule}</li>)}
              </ul>
              <div className="mt-5 rounded-xl border border-line bg-bg p-4">
                <h3 className="font-semibold text-ink">Request controls</h3>
                <p className="mt-2">Supported live tests use fixed read-only provider endpoints. The API validates origin and JSON content type, caps request and token sizes, refuses redirects, returns request IDs, disables caching and sends restrictive security headers.</p>
              </div>
              <div className="mt-4 rounded-xl border border-line bg-bg p-4">
                <h3 className="font-semibold text-ink">Distributed rate limiting</h3>
                <p className="mt-2">With Supabase configured, the endpoint HMAC-hashes the client identity and calls an atomic Postgres function. The raw IP is never stored. The backing table lives in a private schema, and only <code className="text-ink">service_role</code> may execute the RPC. Configured production deployments fail closed if rate-limit storage is unavailable.</p>
              </div>
            </Section>

            <Section id="supabase" title="Supabase schema and environment">
              <p>Run <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">supabase/schema.sql</code> to create profiles, stacks, RLS policies, the private limiter table and its atomic RPC.</p>
              <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-6 text-ink"><code>{`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_SECRET=
NEXT_PUBLIC_SITE_URL=`}</code></pre>
              <p className="mt-4">Generate <code className="text-ink">RATE_LIMIT_SECRET</code> with <code className="text-ink">openssl rand -base64 32</code>. Keep the service-role key and rate-limit secret server-only.</p>
            </Section>

            <Section id="catalog" title="Catalog data model">
              <p>Catalog files live in <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/catalog-a.ts</code> through <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-xs text-ink">lib/catalog-e.ts</code>. The parser supports both the original compact rows and extended metadata.</p>
              <pre className="mt-5 overflow-x-auto rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-6 text-ink"><code>{'Name|category|audiences|plan|summary|signup|docs|tags|testerId|lastVerified|source|platforms|deployment'}</code></pre>
              <p className="mt-4">Legacy rows receive the catalog review date and repository source automatically. Categories and tags infer additional audiences without a destructive migration.</p>
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
              <p className="mt-4">Awesome lists are discovery sources, not automatic imports. Each entry still uses official provider URLs and is reviewed for maintenance, licensing and free-use eligibility.</p>
            </Section>

            <Section id="maintenance" title="Maintenance and validation">
              <pre className="overflow-x-auto rounded-xl border border-line bg-bg p-4 font-mono text-xs leading-6 text-ink"><code>{`npm run typecheck
npm test
npm run catalog:validate
npm run catalog:stats
npm run build
npm run check`}</code></pre>
              <p className="mt-4">Tests cover catalog parsing, fuzzy filters, URL state, stack validation, HMAC hashing, rate-limit windows and pruning. GitHub Actions and Vercel builds run the full validation pipeline.</p>
              <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="mt-5 inline-flex font-semibold text-accent hover:underline">Open the repository ↗</a>
            </Section>
          </div>
        </div>
      </main>
    </>
  )
}
