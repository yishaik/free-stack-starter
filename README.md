# Free Stack Directory

[![Live demo](https://img.shields.io/badge/demo-live-34d399?logo=vercel&logoColor=white)](https://free-stack-starter.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Catalog](https://img.shields.io/badge/catalog-466%20services-8b5cf6.svg)](https://free-stack-starter.vercel.app/#directory)

A curated directory of free tiers and open-source tools for **development, DevOps, IT, security, data, design, productivity, and business operations** — built as a real-world example of a maintainable **$0 starting stack**.

**Live site:** https://free-stack-starter.vercel.app

## Product highlights

- **466 services across 30 categories** — development platforms, containers, CI/CD, infrastructure as code, IT operations, backups, networking, productivity, business tools, BI, self-hosting, design, AI, and more.
- **Fuzzy client-side search** — weighted matching across names, summaries, categories, audiences, and tags, with debounce and typo tolerance.
- **Powerful multi-select filters** — categories, audiences, free-plan models, tags, live key tests, sorting, active chips, and URL persistence.
- **Complete service cards** — official links, source, last verification date, audiences, tags, platforms, deployment model, credential guidance, agent access, and Save to My Stack.
- **Local-first My Stack** — anonymous users save services in the browser; signed-in users sync them through Supabase with Row-Level Security.
- **Agent access prompts** — every service generates a supply-chain-aware prompt that prefers the provider's official MCP server, then CLI, then SDK/API.
- **Credential workbench** — allowlisted providers receive server-side, read-only validation protected by privacy-preserving distributed rate limits.
- **Maintenance tooling** — parser, search, stack, and rate-limit tests; catalog validation; statistics; and GitHub Actions CI.
- **Responsive themes** — system, light, and dark modes with accessible focus and reduced-motion behavior.

## Routes

| Route | Purpose |
|---|---|
| `/` | Fuzzy searchable directory, filters, service cards, curated collections, and save controls |
| `/my-stack` | Local-first saved services with optional authenticated Supabase sync |
| `/docs` | Usage, catalog model, security, sources, and contribution documentation |
| `/test-keys` | Credential setup and read-only API-key validation |
| `/api/my-stack` | RLS-backed authenticated stack synchronization |
| `/api/test-key` | Allowlisted credential validation with distributed rate limiting |
| `/sitemap.xml` | Search-engine sitemap |

## Search model

The directory uses a small dependency-free fuzzy scoring engine in `lib/service-search.ts`.

- Exact and prefix name matches rank highest.
- Tags, categories, audiences, and summaries are weighted independently.
- Subsequence matching tolerates small omissions and misspellings.
- Categories, audiences, and plans use OR logic within each dimension.
- Multiple selected tags use AND logic.
- Filters serialize to the URL for sharing, bookmarks, and browser navigation.
- Results render incrementally using an Intersection Observer and a manual Load more fallback.

## My Stack architecture

My Stack is intentionally local-first:

1. Anonymous selections are validated against the static catalog and stored in a versioned `localStorage` key.
2. The client checks `/api/my-stack` without exposing Supabase credentials.
3. A `401` or unconfigured Supabase keeps the user in local mode.
4. After authentication, local and account services merge automatically.
5. Account writes use the user's Supabase session and database RLS—not the service-role key.
6. Every user receives one default stack, enforced by a partial unique index.

Tables:

```text
public.user_stacks
  id, user_id, name, description, is_default, timestamps

public.stack_services
  stack_id, service_id, notes, added_at
```

RLS policies allow users to read and change only stacks owned by `auth.uid()`. The service IDs are revalidated against the compiled catalog in both the client utility and API route.

## Catalog architecture

Catalog data remains in version control because static typed data is fast, reviewable, portable, and easy to contribute through pull requests.

```text
lib/
  catalog-a.ts ... catalog-d.ts  Original compact catalog
  catalog-e.ts                   DevOps, IT, productivity, operations, BI, and self-hosting expansion
  catalog-parser.ts              Backward-compatible parser, validation, inference, and metadata model
  services.ts                    Aggregated services, counts, tags, and public exports
  service-search.ts              Fuzzy search, filters, sorting, and URL serialization
```

### Row format

The parser supports both the original nine-field format and this extended format:

```text
Name|category|audiences|plan|summary|signup|docs|tags|testerId|lastVerified|source|platforms|deployment
```

Extended fields are optional for existing entries. Legacy rows automatically receive:

- the current catalog review date
- the repository as their source
- category- and tag-derived audience profiles
- normalized category, plan, audience, and agent-ready tags

### Audience codes

| Code | Audience |
|---|---|
| `d` | Developers |
| `g` | Designers |
| `b` | Developers + Designers, retained for backward compatibility |
| `v` | DevOps |
| `i` | IT |
| `p` | Productivity |
| `s` | Security |
| `a` | Data & AI |
| `o` | Business & Operations |

Multiple codes can be comma-separated, such as `d,v,i`.

### Plan codes

| Code | Model |
|---|---|
| `f` | Permanent free tier |
| `o` | Open source |
| `c` | Starter credits or trial |
| `s` | Free for qualifying open-source projects |

## Curated discovery sources

Awesome lists are used as discovery inputs, not automatic imports. Every added service should still link to official provider documentation and be reviewed for maintenance, licensing, and free-use eligibility.

- [Awesome DevOps](https://github.com/wmariuss/awesome-devops)
- [Awesome Sysadmin](https://github.com/awesome-foss/awesome-sysadmin)
- [Awesome Productivity](https://github.com/jyguyomarch/awesome-productivity)
- [Awesome Selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted)

## Agent access security model

Each service card contains **Give an agent access**. The generated prompt instructs the agent to:

1. Resolve the current official provider-maintained MCP server.
2. Fall back to the official CLI when no official MCP exists.
3. Use the official SDK or API only when neither exists.
4. Verify publisher, package namespace, repository, release provenance, and installed version.
5. Prefer project-scoped installation and explain elevated or global changes before applying them.
6. Start with read-only, least-privileged credentials.
7. Never print, log, commit, or paste secret values.
8. Run a harmless verification command and return a sanitized implementation report.

Unofficial MCP servers, look-alike packages, forks, and installation scripts require explicit approval.

## Credential endpoint and rate limiting

The key tester is a setup utility, not a secret store.

- Tokens are submitted once to a server-side Node route and are not stored by the application.
- Live checks use fixed provider-specific identity, account, metadata, list, or ping endpoints.
- Users cannot provide arbitrary destination URLs.
- Redirects are refused, request bodies and token lengths are capped, and requests time out.
- Write requests require JSON and pass same-origin validation when an Origin header is present.
- Responses include no-store, CSP, permissions, referrer, request-ID, and rate-limit headers.
- Permission-related responses are reported as inconclusive rather than automatically invalid.

When Supabase admin credentials are configured, the endpoint calls an atomic `consume_rate_limit` Postgres function. Client identities are HMAC-hashed before storage, so raw IP addresses do not enter the database. The private rate-limit table is inaccessible to `anon` and `authenticated` roles. If distributed storage is configured but unavailable, production requests fail closed with `503` rather than bypassing protection. Local development can use the bounded in-memory fallback.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Copy `.env.example` to `.env.local`.
4. Add the project URL, anon key, service-role key, and a random `RATE_LIMIT_SECRET`.
5. Configure the production `NEXT_PUBLIC_SITE_URL` exactly.

Generate a rate-limit secret with:

```bash
openssl rand -base64 32
```

The service-role key is imported only by `lib/supabase/admin.ts`; user stack writes use the session-bound server client and RLS.

`schema.sql` is idempotent (safe to re-run) and grants table privileges only to the `authenticated` role — `anon` never receives access to account tables, because anonymous stacks live only in the browser.

## Troubleshooting

- **`/api/my-stack` returns `503` with "database schema is unavailable"** — the tables do not exist yet. Run `supabase/schema.sql` in the SQL Editor.
- **`/api/my-stack` returns `503` "Account sync is not configured"** — `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` is missing. My Stack still works locally (localStorage); add the variables to enable account sync.
- **`42501 permission denied for table …` for a signed-in user** — RLS policies were created without the matching table grants. Re-run the current `schema.sql`, which grants DML on the account tables to `authenticated`.
- **`/api/test-key` returns `503` "temporarily unavailable"** — in production the distributed limiter failed closed. Confirm `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_SECRET` are set and the `consume_rate_limit` function exists and is executable by `service_role`.
- **Sign-in redirect loops or lands on the wrong page** — verify `NEXT_PUBLIC_SITE_URL` exactly matches the deployment origin used for same-origin checks.

## Local development

```bash
git clone https://github.com/yishaik/free-stack-starter.git
cd free-stack-starter
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The directory, local My Stack, and docs render without provider credentials. Account sync and distributed rate limiting require the Supabase schema and environment variables.

## Validation and maintenance

```bash
npm run typecheck          # TypeScript application check
npm test                   # Node test runner + compiled TypeScript tests
npm run catalog:validate   # Metadata completeness and catalog integrity
npm run catalog:stats      # Category, audience, tag, and source report
npm run build              # Validation prebuild + Next.js production build
npm run check              # Run the complete validation pipeline
```

GitHub Actions and Vercel builds run type checking, all tests, catalog validation, and a production build.

## Project structure

```text
app/
  page.tsx                    Directory landing page
  my-stack/page.tsx           Local/account saved-services workspace
  docs/page.tsx               In-app documentation
  test-keys/page.tsx          Credential workbench
  api/my-stack/route.ts       Authenticated RLS-backed synchronization
  api/test-key/route.ts       Hardened distributed-rate-limited validation
components/
  ServiceDirectory.tsx        Search state, multi-filters, URL state, and pagination
  ServiceCard.tsx             Metadata, setup, agent access, and save controls
  MyStackProvider.tsx         Local-first state and account synchronization
  MyStackView.tsx             Saved-services UI
  AgentAccessBox.tsx          Copyable official-tooling prompt
  ThemeToggle.tsx             System/light/dark theme control
lib/
  catalog-parser.ts           Typed parser and metadata inference
  service-search.ts           Search, sorting, filters, and URL serialization
  my-stack-core.ts            Stack validation, merging, and storage format
  rate-limit-core.ts          HMAC and memory rate-limit primitives
  rate-limit.ts               Supabase distributed limiter integration
  supabase/admin.ts           Server-only service-role client
  agent-access.ts             Service-specific secure agent prompt generator
  test-runner.ts              Fixed provider validation implementations
supabase/
  schema.sql                  Profiles, stacks, RLS, private rate limits, RPCs
scripts/
  catalog-report.ts           Validation and maintenance reporting
tests/
  catalog-parser.test.ts      Parser and validation coverage
  service-search.test.ts      Fuzzy search, filters, and URL-state coverage
  my-stack.test.ts            Stack storage and catalog validation
  rate-limit.test.ts          Hashing, memory windows, and pruning
```

## Contributing a service

1. Add a unique row to the appropriate catalog file.
2. Use official setup and documentation URLs.
3. Include accurate audiences and capability tags.
4. Add `lastVerified`, the discovery source, platforms, and deployment modes when known.
5. Avoid fragile quota numbers; free-tier limits change frequently.
6. Add a tester ID only when the workbench has a safe allowlisted implementation.
7. Run `npm run check`.
8. Open a pull request describing the provider, free model, verification date, and source.

## Deployment

The app is a standard Next.js project and can be deployed to Vercel or another compatible platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyishaik%2Ffree-stack-starter)

## License

[MIT](LICENSE)
