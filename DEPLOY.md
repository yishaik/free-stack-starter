# Deploy to Vercel with CI/CD (free tier)

This repo is configured for **push-to-deploy CI/CD** on Vercel's Hobby (free) plan,
with guardrails that keep it inside the free limits.

## Connect the repo (one-time, ~1 min)

Vercel deploys from GitHub via the **Vercel GitHub App** — connecting the repo is a
browser step (it grants Vercel access to the repo). After that, **every push to `main`
auto-builds and deploys.**

1. Go to **https://vercel.com/new** → **Import Git Repository** → pick
   `yishaik/free-stack-starter`. (First time only, it installs the Vercel GitHub App.)
2. Framework is auto-detected as **Next.js** (also pinned in `vercel.json`).
3. Add **Environment Variables** (from `.env.example`) under the project's
   Settings → Environment Variables — for **Production** (and Preview if you use it):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_SENTRY_DSN`, `R2_*`, `NEXT_PUBLIC_SITE_URL`.
   *(The app builds and the landing page renders even with none set.)*
4. **Deploy.** From now on, `git push` → automatic production deployment.

> CLI alternative: `npm i -g vercel` → `vercel login` → `vercel link` → `vercel git connect` → `vercel --prod`. (Still needs a one-time `vercel login` in the browser.)

## Free-tier cost guardrails (already configured)

| Guardrail | Where | Effect |
|---|---|---|
| **Skip doc-only builds** | `vercel.json` → `ignoreCommand` → `scripts/vercel-ignore.sh` | A README/docs edit does **not** trigger a full Next.js build + deploy — saves build minutes. |
| **Deploy only `main`** | `vercel.json` → `git.deploymentEnabled: { main: true }` | Production builds fire only for the `main` branch. |
| **Lean upload** | `.vercelignore` | Docs/guide/schema excluded from the deploy bundle. |
| **Framework pinned** | `vercel.json` → `framework: nextjs` | No detection overhead. |

### Recommended dashboard toggles (do once, complement the config)

- **Settings → Git → "Ignored Build Step"** — confirm it's set to *"Run my ignore command"* (Vercel reads `vercel.json`'s `ignoreCommand` automatically; nothing to change).
- **Settings → Git** — turn **OFF "Automatically deploy all branches"** if you create feature branches, so only `main` (production) and PRs you choose build. Preview deployments each consume build time.
- **Settings → Deployment Protection** — leave Vercel Authentication ON for Preview so random previews aren't publicly hit.
- **Settings → Functions** — the default 10s function timeout and small memory are free-tier friendly; don't raise them unless needed.
- **Spend caps**: Hobby has hard free limits (no overage billing on Hobby — it pauses instead), so you can't be surprised-charged. If you upgrade to Pro later, set a **Spend Management** limit.

### Hobby free-tier limits to stay under (as of 2026)
- ~6,000 build-execution minutes / month (the doc-skip step protects these).
- 100 GB bandwidth / month (served from CDN; heavy assets live in **R2**, not Vercel).
- Serverless/Edge function invocations within the generous Hobby allowance.

If you approach a limit, Vercel notifies you and pauses new builds on Hobby rather
than charging — no bill shock.
