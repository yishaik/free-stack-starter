# Side-Project Tech Stack — Free, Scalable Guide (2026-07)

A structured guide to the $0 building blocks for a personal/side project, the trade-offs
inside each category, and one recommended stack that grows to **thousands of users with no
monthly bill** while staying simple and fast.

> The only unavoidable cost is the **domain** (~$8–12/yr at cost). Everything else below is
> genuinely $0 until you hit real scale, and each piece has a no-lock-in escape hatch.

---

## 1. Domains & Email

| | Cloudflare Registrar | ImprovMX | Namecheap |
|---|---|---|---|
| **What it is** | Domain registrar + DNS + SSL | Email *forwarding* for your domain | Registrar with cheap first-year + student deals |
| **Price** | **At-cost** renewals (no markup — the cheapest long-term) | Free forwarding tier | Cheap/free 1st year, **higher renewals** |
| **DNS / SSL** | Best-in-class DNS (fastest globally), free universal SSL | — (you point MX to them) | Decent DNS, free SSL via host |
| **Email** | Free **Email Routing** (forwarding) built in | Free forward `you@domain → inbox`; SMTP send on paid | Basic; email usually via a paid mailbox |
| **Catch** | No free domain; must transfer/register (needs a card) | Forwarding only — not a mailbox; sending needs paid/relay | Renewal prices climb; upsells |

**Verdict:** Register + host DNS on **Cloudflare Registrar** (at-cost, best DNS, free SSL, free
email *routing*). Add **ImprovMX** only if you want extra alias/forwarding flexibility beyond
Cloudflare's. Use **Namecheap** only to grab a domain cheaply via the **GitHub Student Pack**
(free `.me` for a year) — then transfer it to Cloudflare at renewal to stop the markup.

**Practical email setup for a side project:** you don't need a mailbox. Use Cloudflare Email
Routing (or ImprovMX) to forward `hello@yourdomain` to your Gmail for *receiving*, and send
*transactional* mail (signup, password reset) via **Resend** (below). That's $0 and covers both
directions.

---

## 2. Backend & Serverless

| | Firebase (BaaS) | AWS Free Tier | PocketBase (self-hosted) |
|---|---|---|---|
| **Model** | Managed NoSQL BaaS (Firestore, Auth, Functions, Hosting) | Raw cloud primitives (Lambda, DynamoDB, S3, RDS…) | Single Go binary: SQLite + Auth + Realtime + File storage + Admin UI |
| **Time to first feature** | Minutes | Hours–days | Minutes (one binary) |
| **Free tier** | Generous reads/writes; Functions now need Blaze pay-as-you-go w/ free allowance | 12-month limited on many services; always-free on a few (Lambda, DynamoDB) | Free — you only pay the host (can be $0 on a free tier) |
| **Data model** | NoSQL (document) — reshaping is painful later | Anything you build | Relational SQLite — real SQL, portable |
| **Lock-in / risk** | **High** (proprietary; read/egress costs surprise at scale) | Low on primitives but **complex + bill-shock risk** | **None** — your data is a `.db` file you own |
| **Scaling ceiling** | Very high (Google infra) but $$$ | Effectively unlimited | Single-node (vertical) — great to ~thousands, then migrate |
| **Best for** | Realtime chat/mobile MVPs, fast prototypes | Teams needing bespoke infra / heavy compute | Full control, no lock-in, tiny apps that own their data |

**Verdict:**
- **Firebase** — fastest to a realtime MVP, but NoSQL lock-in and read/egress costs make it a
  trap as you grow. Pick it only for realtime-heavy mobile apps.
- **AWS Free Tier** — the most powerful and the most dangerous: 12-month clocks, complexity, and
  surprise bills. Overkill for a side project; save it for when you genuinely need bespoke infra.
- **PocketBase** — brilliant if you want to *own* everything: auth + realtime + storage + admin
  in one binary, on SQLite, self-hosted for $0 (Fly.io/Railway free tier). The trade-off is you
  operate it and it's single-node.

For the recommended stack below I choose **neither** of these three as the primary — I use
**Supabase** (managed Postgres BaaS): it gives Firebase's speed *without* the NoSQL lock-in
(it's just Postgres, portable anywhere) and without AWS's complexity. PocketBase is the pick if
you specifically want self-hosted / offline-first / zero-dependency.

---

## 3. Recommended $0 Stack

| Layer | Choice | Free allowance (approx.) | Why |
|---|---|---|---|
| **Frontend** | **Next.js on Vercel** | ~100 GB bandwidth, serverless + edge functions, custom domain + SSL | Zero-config deploys, global CDN, SSR + static + API routes in one |
| **DB + Auth** | **Supabase** | 500 MB Postgres, ~50k monthly active users auth, storage, realtime, Row-Level Security | Real Postgres (portable, not lock-in), auth built in, RLS = secure by default |
| **Email** | **Resend** | ~3,000 emails/mo (100/day) | Developer-first transactional email (signup, reset); great DX |
| **Error tracking** | **Sentry** | ~5,000 error events/mo | Catch and debug production crashes with stack traces + releases |
| **Storage** | **Cloudflare R2** | 10 GB + **zero egress fees** | Images/video/uploads scale with **no bandwidth bill** — the usual free-tier killer |
| **Domain / DNS** | **Cloudflare Registrar** | at-cost domain (~$10/yr) + free DNS/SSL/email routing | Cheapest long-term, fastest DNS, one place for domain + email forwarding |

**One-line architecture:** Browser → Vercel edge/CDN (Next.js) → Supabase (Postgres + Auth via
RLS) for data, **R2** for large assets, **Resend** for transactional email, **Sentry** watching
it all — domain + DNS + inbound email on **Cloudflare**.

---

## Why this scales to thousands of users at $0

The thing that actually breaks free tiers is **not user count** — it's **bandwidth/egress** and
**DB size**. This stack removes both bottlenecks:

1. **Egress is free where it matters.** Cloudflare R2 charges **$0 egress**, and Vercel serves
   your app + static assets from a global CDN. The single biggest surprise-bill vector on other
   stacks (S3/Firebase egress) is designed out from the start.
2. **The database holds a lot before 500 MB.** Postgres text/relational rows are tiny — thousands
   of users' accounts and content fit comfortably in Supabase's free 500 MB, and auth is free to
   ~50k MAU. Heavy files never touch the DB — they live in R2.
3. **Reads scale via caching, not spend.** Next.js static generation + Vercel's CDN + Postgres
   indexes mean most traffic is served without hitting a paid ceiling.
4. **Email is transactional, not bulk.** Thousands of *users* ≠ thousands of *emails/day* — signup
   and reset volume stays inside Resend's free 3k/mo for a long time.
5. **Errors are sampled.** Sentry's 5k events/mo is plenty once you filter noise; a healthy app
   emits far fewer.

**Simplicity & performance:** every layer is fully managed with its own dashboard — **no DevOps,
no servers to patch.** Postgres + CDN + edge functions is a fast, boring, proven combination.

**No lock-in (the escape hatches):**
- Supabase is *just Postgres* → migrate to Neon / Railway / RDS with a `pg_dump`.
- Vercel → Cloudflare Pages or Netlify (it's a Next.js app).
- R2 is S3-compatible → move to Backblaze B2 / S3 by changing an endpoint.
- Domain on Cloudflare → transfer anywhere.

**When you outgrow free (a good problem):** the first paid step is usually Supabase Pro (~$25/mo
for more DB + no project pausing) or Vercel Pro — and by then the app is generating value. You
scale *one* line item at a time, never a forced rewrite.

---

## Fast-start checklist
1. Grab the domain (Namecheap student deal or Cloudflare directly) → move DNS to **Cloudflare**.
2. `npx create-next-app` → push to GitHub → import into **Vercel** (auto-deploys on push).
3. Create a **Supabase** project → wire auth + a `profiles` table with **RLS on**.
4. Add **Resend** for the signup/reset emails; add **Sentry** DSN in one line.
5. Create an **R2** bucket for uploads (S3 SDK, custom domain via Cloudflare).
6. Cloudflare **Email Routing**: forward `hello@yourdomain` → your Gmail.

Total monthly cost: **$0** (plus ~$10/yr for the domain).
