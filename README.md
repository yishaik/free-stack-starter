# Free Stack Directory

[![Live demo](https://img.shields.io/badge/demo-live-34d399?logo=vercel&logoColor=white)](https://free-stack-starter.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Catalog](https://img.shields.io/badge/catalog-348%20services-8b5cf6.svg)](https://free-stack-starter.vercel.app/#directory)

A searchable directory of free tiers, open-source tools, design resources, APIs, and developer platforms. It helps builders discover services, review official setup documentation, safely validate credentials, and give coding agents provider-specific access instructions.

**Live site:** https://free-stack-starter.vercel.app

## What the site includes

- **348 services across 18 categories** — hosting, databases, AI, design, observability, security, automation, payments, storage, and more.
- **Search and filters** — category, audience, free-plan model, and API-key support.
- **Official provider links** — every card links to the provider's sign-up flow and documentation.
- **Agent access prompts** — every service has a copyable prompt that asks a coding agent to install and configure the provider's official MCP server or CLI, with an official SDK/API fallback when neither exists.
- **Credential workbench** — common providers receive a live, read-only key validation; other services receive a setup checklist or no-key guide.
- **In-app documentation** — usage, security, data model, and contribution guidance at [`/docs`](https://free-stack-starter.vercel.app/docs).

## Routes

| Route | Purpose |
|---|---|
| `/` | Searchable service directory and provider cards |
| `/docs` | Product usage, agent-access, security, and contribution documentation |
| `/test-keys` | Credential setup and read-only API-key validation |
| `/api/test-key` | Server-side credential validation endpoint used by the workbench |

## Agent access workflow

Each service card includes a **Give an agent access** panel. The generated prompt contains the service name, official documentation URL, and account setup URL, then instructs the agent to:

1. Prefer a provider-maintained official MCP server.
2. Fall back to the provider's official CLI.
3. Use the official SDK or API only when no official MCP or CLI exists.
4. Start with read-only, least-privileged permissions.
5. Keep credentials out of chat, source control, shell history, and generated files.
6. Run a harmless verification command and report what was installed and configured.

Install commands are intentionally resolved from current official documentation instead of being hard-coded in the catalog. This reduces stale package names and protects against unofficial look-alike packages.

## Credential security

The credential tester is designed as a setup utility, not a secret store.

- Tokens are submitted to a server-side route and are not stored by the application.
- Live tests use fixed, provider-specific, read-only identity or account endpoints.
- Users cannot supply arbitrary target URLs, preventing SSRF through the tester.
- Redirects are refused.
- Request bodies are capped and requests are rate-limited.
- Unsupported providers receive a format/setup guide instead of an unsafe generic request.

Use test or least-privileged credentials whenever possible. Review the implementation in `app/api/test-key/route.ts` and `lib/test-runner.ts` before operating a public deployment.

## Local development

```bash
git clone https://github.com/yishaik/free-stack-starter.git
cd free-stack-starter
npm install
npm run dev
```

Open http://localhost:3000. The directory and documentation render without provider credentials.

### Validation

```bash
npm run typecheck
npm run build
```

## Project structure

```text
app/
  page.tsx                    Directory landing page
  docs/page.tsx               In-app documentation
  test-keys/page.tsx          Credential workbench
  api/test-key/route.ts       Rate-limited server-side validation
components/
  ServiceDirectory.tsx        Search, filters, pagination, and service cards
  AgentAccessBox.tsx          Copyable official-tooling prompt
  KeyTester.tsx               Credential-testing interface
  SiteHeader.tsx              Shared navigation
lib/
  catalog-a.ts ... catalog-d.ts  Pipe-delimited service catalog
  services.ts                 Catalog parser, types, categories, and sorting
  agent-access.ts             Service-specific agent prompt generator
  live-testers.ts             Providers with supported live checks
  test-runner.ts              Fixed provider validation implementations
```

## Catalog format

Services live in `lib/catalog-a.ts` through `lib/catalog-d.ts`. Each row follows this format:

```text
Name|category|audience|plan|summary|signup|docs|tag1,tag2|testerId
```

The parser in `lib/services.ts` validates required fields, generates stable IDs, rejects duplicates, and sorts the complete directory alphabetically.

### Codes

- **Audience:** `d` developers, `g` designers, `b` both.
- **Plan:** `f` permanent free tier, `o` open source, `c` starter credits/trial, `s` free for qualifying OSS projects.
- **Category:** mapped in `lib/services.ts` to the existing site categories.
- **Tester ID:** optional; include it only when the credential workbench has a corresponding setup or validation implementation.

## Contributing a service

1. Add a unique row to the appropriate catalog file.
2. Use the provider's official sign-up and documentation URLs.
3. Avoid fragile quota numbers in the summary; free-tier limits change frequently.
4. Add accurate capability tags for search.
5. Run `npm run typecheck` and `npm run build`.
6. Open a pull request describing the provider, free model, and source used to verify it.

The generated agent-access feature applies automatically to every valid catalog entry, so no separate prompt content is required.

## Deployment

The app is a standard Next.js project and can be deployed to Vercel or another compatible platform.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyishaik%2Ffree-stack-starter)

For a public credential tester, use a shared rate limiter such as Redis rather than relying only on the included in-memory limiter, and review your hosting provider's logging configuration to ensure request bodies are never captured.

## License

[MIT](LICENSE)
