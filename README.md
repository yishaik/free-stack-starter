# Free Stack Starter

[![CI](https://github.com/yishaik/free-stack-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/yishaik/free-stack-starter/actions/workflows/ci.yml)
[![CodeQL](https://github.com/yishaik/free-stack-starter/actions/workflows/codeql.yml/badge.svg)](https://github.com/yishaik/free-stack-starter/actions/workflows/codeql.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyishaik%2Ffree-stack-starter)
[![Live demo](https://img.shields.io/badge/demo-live-34d399?logo=vercel&logoColor=white)](https://free-stack-starter.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee.svg)](LICENSE)

A **production-minded zero-cost starter for personal projects, prototypes, and validation**.
It provides explicit security defaults and clear upgrade paths when a project becomes commercial.

> Next.js 16 · Supabase Postgres + Auth · Resend · Sentry · Cloudflare R2 · optional Hugging Face

## What is included

- Supabase email/password auth, confirmation callback, session refresh, and protected routes.
- Postgres migrations with Row-Level Security for profiles and upload metadata.
- Authenticated direct-to-R2 uploads with MIME allowlisting, size limits, UUID object names, and short-lived signatures.
- Transactional email through a lazily initialized Resend client.
- Sentry instrumentation with safe public API errors and request IDs.
- `/api/health` and `/api/ready` diagnostics.
- Security headers, CI, CodeQL, Dependabot, linting, type checking, tests, and production builds.
- A setup that renders without service credentials so a fresh clone remains inspectable.

## Cost boundary

The stack can remain at $0 for substantial personal and validation usage, but **$0 is not a production SLA**.

| Stage | Expected position | Main constraint |
|---|---|---|
| Personal prototype | Usually $0 | Free-tier limits and sleeping projects |
| Public validation | Often $0 | Bandwidth, email volume, DB size, function limits |
| Commercial product | Budget an upgrade | Hosting terms, backups, support, reliability |
| Production AI | Separate compute budget | Inference is not covered by the core stack promise |

Vercel Hobby is intended for personal/non-commercial usage. Review every provider's current limits before launch; dated estimates and migration options are documented in [`docs/STACK-GUIDE.md`](docs/STACK-GUIDE.md).

## Quick start

```bash
git clone https://github.com/yishaik/free-stack-starter.git my-app
cd my-app
npm install
cp .env.example .env.local
npm run dev
```

Run the database migration with the Supabase CLI or paste files from `supabase/migrations/` into the SQL editor.

```bash
npm run check
```

## Configuration

| Capability | Required variables |
|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Resend | `RESEND_API_KEY`, `EMAIL_FROM` |
| Sentry | `NEXT_PUBLIC_SENTRY_DSN`, optional build-time `SENTRY_*` |
| R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` |
| AI, optional | `HF_TOKEN` |

The Supabase service-role key is intentionally absent from the default starter because it bypasses RLS. Add it only inside a narrowly scoped server-only admin recipe.

## Architecture

```text
Browser
  ├─ Next.js UI + Server Actions on Vercel
  ├─ authenticated API routes
  └─ direct signed uploads ──────────────> Cloudflare R2
                 │
                 ├─ Supabase Auth + Postgres/RLS
                 ├─ Resend transactional email
                 └─ Sentry errors and tracing
```

## Production checklist

- Run migrations and verify RLS with more than one test user.
- Keep R2 private unless public assets are intentional; use signed reads for user files.
- Add persistent rate limiting before exposing public mutation endpoints.
- Configure Turnstile or another anti-abuse layer for signup and password reset.
- Enable branch protection, required CI checks, secret scanning, and push protection.
- Configure backups, monitoring, budgets, retention, and provider spend alerts.
- Review [`SECURITY.md`](SECURITY.md) and [`DEPLOY.md`](DEPLOY.md).

## Escape hatches

- Supabase is Postgres: migrate with standard Postgres tooling.
- R2 is S3-compatible: swap the endpoint and credentials.
- Next.js can move to another compatible host, although provider-specific features may require adaptation.
- Hugging Face models can move to local or another inference provider when licensing permits.

## License

[MIT](LICENSE)
