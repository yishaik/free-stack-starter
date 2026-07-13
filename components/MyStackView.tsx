'use client'

import Link from 'next/link'
import { ServiceCard } from '@/components/ServiceCard'
import { useMyStack } from '@/components/MyStackProvider'
import { SERVICES } from '@/lib/services'

export function MyStackView() {
  const { savedIds, savedCount, mode, syncing, error, clearError } = useMyStack()
  const services = savedIds
    .map((id) => SERVICES.find((service) => service.id === id))
    .filter((service): service is NonNullable<typeof service> => Boolean(service))

  function filterByTag(tag: string) {
    window.location.href = `/?tags=${encodeURIComponent(tag)}#directory`
  }

  if (mode === 'loading') {
    return (
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-[430px] animate-pulse rounded-2xl border border-line bg-panel/70" />)}
      </div>
    )
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-panel/70 p-4">
        <div>
          <div className="font-semibold text-ink">{savedCount} saved {savedCount === 1 ? 'service' : 'services'}</div>
          <p className="mt-1 text-xs text-muted">
            {mode === 'account'
              ? 'Synced to your Supabase account with Row-Level Security.'
              : 'Saved locally in this browser. Sign in to sync across devices.'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {syncing && <span className="text-muted">Syncing…</span>}
          {mode === 'local' && <Link href="/login?next=/my-stack" className="rounded-xl border border-line px-4 py-2 font-semibold text-ink hover:border-accent">Sign in to sync</Link>}
          <Link href="/#directory" className="rounded-xl bg-accent px-4 py-2 font-semibold text-[#06111a]">Browse services</Link>
        </div>
      </div>

      {error && (
        <div role="status" className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-100">
          <span>{error}</span>
          <button type="button" onClick={clearError} aria-label="Dismiss sync error" className="font-bold">×</button>
        </div>
      )}

      {services.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => <ServiceCard key={service.id} service={service} onTagSelect={filterByTag} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-panel/40 p-12 text-center sm:p-16">
          <div className="text-4xl" aria-hidden>☆</div>
          <h2 className="mt-4 text-2xl font-bold text-ink">Build your first stack</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">Save services from the directory to compare the tools you are considering for a project, homelab, IT environment or business workflow.</p>
          <Link href="/#directory" className="mt-6 inline-flex rounded-xl bg-accent px-5 py-3 text-sm font-bold text-[#06111a]">Explore the directory</Link>
        </div>
      )}
    </>
  )
}
