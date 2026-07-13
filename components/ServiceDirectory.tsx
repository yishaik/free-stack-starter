'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AgentAccessBox } from '@/components/AgentAccessBox'
import { AUDIENCES, CATEGORIES, PLANS, SERVICES, getPlanCopy, type Audience, type PlanType } from '@/lib/services'
import { LIVE_TESTER_SET } from '@/lib/live-testers'

const PAGE_SIZE = 72

const CATEGORY_ICONS: Record<string, string> = {
  'Hosting & Deploy': '▲',
  'Database & Backend': 'DB',
  'Storage & Media': '◫',
  Authentication: 'ID',
  Security: '◆',
  'AI & ML': 'AI',
  'Search & Vector': '⌕',
  'Email & Messaging': '✉',
  'Observability & Analytics': '◉',
  'Developer Tools': '</>',
  'Testing & QA': '✓',
  'Automation & Forms': '↯',
  'CMS & Content': '¶',
  'Design & Creative': '✦',
  'Design Assets': '◇',
  'Maps & Data APIs': '⌖',
  'Payments & Commerce': '$',
  Accessibility: 'A11Y',
}

function Select({ value, onChange, label, children }: {
  value: string
  onChange: (value: string) => void
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5 text-xs font-medium text-muted">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-line bg-panel px-3 text-sm text-ink outline-none transition focus:border-accent"
      >
        {children}
      </select>
    </label>
  )
}

export function ServiceDirectory() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [audience, setAudience] = useState<'All' | Audience>('All')
  const [plan, setPlan] = useState<'All' | PlanType>('All')
  const [keyMode, setKeyMode] = useState('All')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return SERVICES.filter((service) => {
      const searchable = `${service.name} ${service.summary} ${service.category} ${service.tags.join(' ')}`.toLowerCase()
      const audienceMatch = audience === 'All' || service.audience === audience || service.audience === 'Both'
      const keyMatch = keyMode === 'All'
        || (keyMode === 'Live test' && Boolean(service.testerId && LIVE_TESTER_SET.has(service.testerId)))
        || (keyMode === 'Credential guide' && Boolean(service.testerId && !LIVE_TESTER_SET.has(service.testerId)))
        || (keyMode === 'No key' && !service.testerId)
      return (!normalized || searchable.includes(normalized))
        && (category === 'All' || service.category === category)
        && audienceMatch
        && (plan === 'All' || service.plan === plan)
        && keyMatch
    })
  }, [query, category, audience, plan, keyMode])

  const shown = filtered.slice(0, visible)
  const activeFilters = [query, category !== 'All', audience !== 'All', plan !== 'All', keyMode !== 'All'].filter(Boolean).length

  function reset() {
    setQuery('')
    setCategory('All')
    setAudience('All')
    setPlan('All')
    setKeyMode('All')
    setVisible(PAGE_SIZE)
  }

  return (
    <section className="mt-10">
      <div className="sticky top-3 z-20 rounded-2xl border border-line bg-bg/95 p-4 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_repeat(4,minmax(130px,180px))]">
          <label className="grid gap-1.5 text-xs font-medium text-muted">
            Search all services
            <input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setVisible(PAGE_SIZE) }}
              placeholder="Search Postgres, icons, email, vector…"
              className="h-10 rounded-xl border border-line bg-panel px-4 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent"
            />
          </label>
          <Select value={category} onChange={(value) => { setCategory(value); setVisible(PAGE_SIZE) }} label="Category">
            <option>All</option>
            {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select value={audience} onChange={(value) => { setAudience(value as 'All' | Audience); setVisible(PAGE_SIZE) }} label="Audience">
            <option>All</option>
            {AUDIENCES.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select value={plan} onChange={(value) => { setPlan(value as 'All' | PlanType); setVisible(PAGE_SIZE) }} label="Free model">
            <option>All</option>
            {PLANS.map((item) => <option key={item}>{item}</option>)}
          </Select>
          <Select value={keyMode} onChange={(value) => { setKeyMode(value); setVisible(PAGE_SIZE) }} label="API-key support">
            <option>All</option>
            <option>Live test</option>
            <option>Credential guide</option>
            <option>No key</option>
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted"><strong className="text-ink">{filtered.length}</strong> services match</span>
          {activeFilters > 0 && (
            <button onClick={reset} className="rounded-lg border border-line px-3 py-1.5 text-muted hover:border-accent hover:text-ink">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {shown.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((service) => {
            const live = Boolean(service.testerId && LIVE_TESTER_SET.has(service.testerId))
            return (
              <article key={service.id} className="group flex min-h-[270px] flex-col overflow-hidden rounded-2xl border border-line bg-panel/70 transition hover:-translate-y-0.5 hover:border-accent/70 hover:bg-panel">
                <a href={service.signup} target="_blank" rel="noreferrer" className="flex flex-1 flex-col p-5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid h-10 min-w-10 place-items-center rounded-xl border border-line bg-bg font-mono text-[11px] font-bold text-accent">
                      {CATEGORY_ICONS[service.category] || '◌'}
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <span className="rounded-full border border-line px-2 py-1 text-[11px] text-muted">{service.plan}</span>
                      {live && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">Live key test</span>}
                    </div>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-accent">{service.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{service.summary}</p>
                  <p className="mt-3 text-xs leading-5 text-muted/80">{getPlanCopy(service.plan)}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {service.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-md bg-bg px-2 py-1 text-[11px] text-muted">{tag}</span>)}
                  </div>
                  <span className="mt-5 inline-flex items-center gap-2 font-semibold text-accent">
                    {service.actionLabel} <span aria-hidden>↗</span>
                  </span>
                </a>
                <div className="border-t border-line px-5 py-3 text-xs">
                  <AgentAccessBox service={service} />
                </div>
                <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs">
                  <span className="text-muted">{service.category} · {service.audience}</span>
                  <div className="flex gap-3">
                    <a href={service.docs} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">Docs</a>
                    <Link href={`/test-keys?service=${service.id}`} className="font-medium text-ink hover:text-accent">Test setup</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line p-12 text-center">
          <div className="text-lg font-semibold">No services match these filters.</div>
          <button onClick={reset} className="mt-3 text-sm font-medium text-accent">Reset the directory</button>
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-8 text-center">
          <button onClick={() => setVisible((count) => count + PAGE_SIZE)} className="rounded-xl border border-line bg-panel px-5 py-3 font-semibold hover:border-accent">
            Load {Math.min(PAGE_SIZE, filtered.length - visible)} more
          </button>
        </div>
      )}
    </section>
  )
}
