import { login, signup } from './actions'

export default function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  return <LoginForm searchParams={searchParams} />
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string; message?: string }> }) {
  const sp = await searchParams
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-muted">Email + password, backed by Supabase Auth.</p>

      {sp.error && <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{sp.error}</p>}
      {sp.message && <p className="mt-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">{sp.message}</p>}

      <form className="mt-6 space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="password"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <button formAction={login} className="flex-1 rounded-lg bg-accent px-4 py-2 font-semibold text-[#06111a]">
            Log in
          </button>
          <button formAction={signup} className="flex-1 rounded-lg border border-line px-4 py-2">
            Sign up
          </button>
        </div>
      </form>
    </main>
  )
}
