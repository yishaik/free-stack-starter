# Free Stack Directory

[![Live demo](https://img.shields.io/badge/demo-live-34d399?logo=vercel&logoColor=white)](https://free-stack-starter.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Catalog](https://img.shields.io/badge/catalog-450%2B%20services-8b5cf6.svg)](https://free-stack-starter.vercel.app/#directory)

A curated directory of free tiers and open-source tools for **development, DevOps, IT, security, data, design, productivity, and business operations** — built as a real-world example of a maintainable **$0 starting stack**.

**Live site:** https://free-stack-starter.vercel.app

## Product highlights

- **450+ services across 30 categories** — development platforms, containers, CI/CD, infrastructure as code, IT operations, backups, networking, productivity, business tools, BI, self-hosting, design, AI, and more.
- **Fuzzy client-side search** — weighted matching across names, summaries, categories, audiences, and tags, with debounce and typo tolerance.
- **Powerful multi-select filters** — categories, audiences, free-plan models, tags, live key tests, sorting, active chips, and URL persistence.
- **Complete service cards** — official links, source, last verification date, audiences, tags, platforms, deployment model, credential guidance, and agent access.
- **Agent access prompts** — every service generates a supply-chain-aware prompt that prefers the provider's official MCP server, then CLI, then SDK/API.
- **Credential workbench** — allowlisted providers receive server-side, read-only validation; other services receive a guided setup path.
- **Maintenance tooling** — parser tests, search/filter tests, catalog validation, statistics, and GitHub Actions CI.
- **Responsive themes** — system, light, and dark modes with accessible focus and reduced-motion behavior.

## Routes

| Route | Purpose |
|---|---|
| `/` | Fuzzy searchable directory, filters, service cards, and curated audience collections |
| `/docs` | Usage, catalog model, security, sources, and contribution documentation |
| `/test-keys` | Credential setup and read-only API-key validation |
| `/api/test-key` | Server-side allowlisted credential validation endpoint |
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

## Credential workbench

The key tester is a setup utility, not a secret store.

- Tokens are submitted once to a server-side route and are not stored by the application.
- Live checks use fixed provider-specific identity, account, metadata, list, or ping endpoints.
- Users cannot provide arbitrary destination URLs.
- Redirects are refused, request bodies are capped, and requests time out.
- Permission-related responses are reported as inconclusive rather than automatically invalid.

A distributed rate limiter is planned for the next Supabase-focused phase. The current endpoint still uses an in-memory limiter and should be reviewed before high-volume public deployment.

## Local development

```bash
git clone https://github.com/yishaik/free-stack-starter.git
cd free-stack-starter
npm ci
npm run dev
```

Open http://localhost:3000. The directory and docs render without provider credentials.

## Validation and maintenance

```bash
npm run typecheck          # TypeScript application check
npm test                   # Node test runner + compiled TypeScript tests
npm run catalog:validate   # Metadata completeness and catalog integrity
npm run catalog:stats      # Category, audience, tag, and source report
npm run build              # Next.js production build
npm run check              # Run the complete validation pipeline
```

GitHub Actions runs type checking, tests, catalog validation, and a production build for every pull request.

## Project structure

```text
app/
  page.tsx                    Directory landing page
  docs/page.tsx               In-app documentation
  test-keys/page.tsx          Credential workbench
  api/test-key/route.ts       Rate-limited server-side validation
  loading.tsx                 Loading skeletons
  error.tsx                   Recoverable route error state
  sitemap.ts / robots.ts      SEO discovery metadata
components/
  ServiceDirectory.tsx        Search state, multi-filters, URL state, and pagination
  ServiceCard.tsx             Consistent metadata-rich service card
  AgentAccessBox.tsx          Copyable official-tooling prompt
  ThemeToggle.tsx             System/light/dark theme control
  KeyTester.tsx               Credential-testing interface
lib/
  catalog-parser.ts           Typed parser and metadata inference
  service-search.ts           Search, sorting, filters, and URL serialization
  agent-access.ts             Service-specific secure agent prompt generator
  live-testers.ts             Providers with supported live checks
  test-runner.ts              Fixed provider validation implementations
scripts/
  catalog-report.ts           Validation and maintenance reporting
tests/
  catalog-parser.test.ts      Parser and validation coverage
  service-search.test.ts      Fuzzy search, filters, and URL-state coverage
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
