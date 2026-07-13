import Link from 'next/link'
import { login, signup } from './actions'

export default function LoginPage({ searchParams }: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>
}) {
  return <LoginForm searchParams={searchParams} />
}

async function LoginForm({ searchParams }: {
  searchParams: Promise<{ error?: string; message?: string; next?: string }>
}) {
  const sp = await searchParams
  const next = sp.next?.startsWith('/') && !sp.next.startsWith('//') ? sp.next : '/dashboard'

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-3 font-semibold text-ink">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-mono text-sm font-black text-[#06111a]">$0</span>
        Free Stack Directory
      </Link>
      <h1 className="text-2xl font-bold text-ink">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Sync My Stack securely across devices with Supabase Auth.</p>

      {sp.error && <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-200">{sp.error}</p>}
      {sp.message && <p className="mt-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-200">{sp.message}</p>}

      <form className="mt-6 space-y-3">
        <input type="hidden" name="next" value={next} />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-ink outline-none focus:border-accent"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="password"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-ink outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <button formAction={login} className="flex-1 rounded-lg bg-accent px-4 py-2 font-semibold text-[#06111a]">Log in</button>
          <button formAction={signup} className="flex-1 rounded-lg border border-line px-4 py-2 text-ink hover:border-accent">Sign up</button>
        </div>
      </form>
      <Link href={next === '/my-stack' ? '/my-stack' : '/'} className="mt-5 text-center text-sm text-muted hover:text-accent">Continue without signing in</Link>
    </main>
  )
}
