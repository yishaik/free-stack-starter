import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '../login/actions'
import { UploadDemo } from '@/components/UploadDemo'

// Protected route: the middleware refreshes the session; here we gate on the user.
export default async function Dashboard() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) redirect('/login')

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <form action={logout}>
          <button className="rounded-lg border border-line px-3 py-1.5 text-sm">Log out</button>
        </form>
      </div>

      <p className="mt-2 text-muted">
        Signed in as <span className="text-ink">{data.user.email}</span>. This route is protected
        by Supabase Auth + middleware session refresh.
      </p>

      <section className="mt-8 rounded-xl border border-line bg-panel p-5">
        <h2 className="font-semibold">Upload a file to Cloudflare R2</h2>
        <p className="mt-1 text-sm text-muted">
          The browser gets a short-lived presigned URL and PUTs the file straight to R2 —
          zero egress, never touching your server.
        </p>
        <UploadDemo />
      </section>
    </main>
  )
}
