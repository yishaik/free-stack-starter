# Free Stack Starter

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyishaik%2Ffree-stack-starter)
[![Live demo](https://img.shields.io/badge/demo-live-34d399?logo=vercel&logoColor=white)](https://free-stack-starter.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-22d3ee.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Cost](https://img.shields.io/badge/cost-%240%2Fmo-8b5cf6.svg)](docs/STACK-GUIDE.md)

A **$0/month** side-project starter that scales to **thousands of users** with no monthly bill —
and no lock-in. Clone it, add your keys, deploy to Vercel. **Live demo → https://free-stack-starter.vercel.app**

> **The stack:** [Next.js](https://nextjs.org) on [Vercel](https://vercel.com) · [Supabase](https://supabase.com) (Postgres + Auth) · [Resend](https://resend.com) (email) · [Sentry](https://sentry.io) (errors) · [Cloudflare R2](https://developers.cloudflare.com/r2/) (storage) · [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (domain).
>
> Full comparison + reasoning: **[docs/STACK-GUIDE.md](docs/STACK-GUIDE.md)**.

## Why it's free at scale

The thing that breaks free tiers is **egress/bandwidth** and **DB size**, not user count. This
stack removes both: **R2 has zero egress**, Vercel's CDN serves the app globally, a 500 MB
Postgres holds thousands of users' data, auth is free to ~50k MAU, and transactional email stays
inside Resend's free 3k/mo. Every layer is managed (no DevOps) and portable (no lock-in).

## What's wired

- **Auth** — email/password via Supabase, session refresh in `middleware.ts`, a protected `/dashboard`.
- **Database** — Postgres with **Row-Level Security ON** (`supabase/schema.sql`), server + browser clients via `@supabase/ssr`.
- **Email** — `POST /api/send-email` sends a transactional email to the signed-in user via Resend.
- **Storage** — `POST /api/upload` returns a short-lived presigned URL; the browser PUTs straight to R2 (zero egress). Demo UI on the dashboard.
- **Errors** — Sentry wired for client/server/edge; no-op until you add a DSN.
- **UI** — Tailwind, dark theme.

## Quick start

```bash
git clone <this-repo> my-app && cd my-app
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

The landing page renders **without any keys**. Add them to unlock each feature:

| Service | Get keys | Env vars |
|---|---|---|
| Supabase | Project → Settings → API | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Resend | resend.com → API Keys | `RESEND_API_KEY`, `EMAIL_FROM` |
| Sentry | Project → Client Keys (DSN) | `NEXT_PUBLIC_SENTRY_DSN` (+ optional `SENTRY_*`) |
| Cloudflare R2 | Dashboard → R2 → API Tokens | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL` |

Then run the DB schema: open Supabase → **SQL Editor** → paste `supabase/schema.sql` → Run.
That creates a `profiles` table with RLS and an auto-insert trigger on signup.

## Deploy (free)

1. Push to GitHub.
2. Import the repo into **Vercel** → it autodetects Next.js.
3. Add the same env vars in **Vercel → Settings → Environment Variables**.
4. Deploy. Add a custom domain (DNS on Cloudflare) → free SSL.

Inbound email: set up **Cloudflare Email Routing** to forward `hello@yourdomain` → your inbox.

## Project layout

```
app/                 App Router — landing, /login, /dashboard, /api/*
components/          client components (upload demo)
lib/supabase/        browser + server + middleware clients (@supabase/ssr)
lib/resend.ts        transactional email helper
lib/r2.ts            S3-compatible R2 client + presigned uploads
supabase/schema.sql  example table + RLS policies
sentry.*.config.ts   Sentry per-runtime init
docs/STACK-GUIDE.md  the full free-stack comparison + reasoning
```

## Scripts

```bash
npm run dev        # local dev
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
```

## No lock-in (escape hatches)

- Supabase is *just Postgres* → `pg_dump` to Neon / Railway / RDS.
- Vercel → Cloudflare Pages / Netlify (it's a Next.js app).
- R2 is S3-compatible → swap the endpoint to Backblaze B2 / S3.

## License

[MIT](LICENSE). Use it for anything.
