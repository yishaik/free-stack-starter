import type { Metadata } from 'next'
import { MyStackProvider } from '@/components/MyStackProvider'
import { MyStackView } from '@/components/MyStackView'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'My Stack',
  description: 'Save and compare services from Free Stack Directory, locally or synced securely with Supabase.',
  robots: { index: false, follow: false },
}

export default function MyStackPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Personal workspace</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-ink sm:text-5xl">My Stack</h1>
          <p className="mt-4 text-lg leading-8 text-muted">
            Save the services you are evaluating. Anonymous stacks stay in this browser; signed-in stacks sync through Supabase and are protected by Row-Level Security.
          </p>
        </div>
        <MyStackProvider><MyStackView /></MyStackProvider>
      </main>
    </>
  )
}
