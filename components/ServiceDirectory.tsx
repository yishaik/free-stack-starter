'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ServiceCard } from '@/components/ServiceCard'
import {
  AUDIENCES,
  AUDIENCE_COUNTS,
  CATEGORIES,
  CATEGORY_COUNTS,
  PLANS,
  SERVICES,
  TAGS,
  type Audience,
  type PlanType,
} from '@/lib/services'
import {
  DEFAULT_FILTERS,
  filterServices,
  getPopularTags,
  parseFilters,
  serializeFilters,
  type ServiceFilters,
  type SortMode,
} from '@/lib/service-search'

const PAGE_SIZE = 48

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function toggleValue<T extends string>(items: T[], value: T) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
}

function FilterChip({ active, children, onClick, title }: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-line bg-bg text-muted hover:border-accent/50 hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

function ActiveChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:border-accent">
      {children}<span aria-hidden>×</span>
    </button>
  )
}

const QUICK_AUDIENCES: Audience[] = ['DevOps', 'IT', 'Productivity']

export function ServiceDirectory() {
  const [filters, setFilters] = useState<ServiceFilters>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [urlReady, setUrlReady] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebouncedValue(searchInput, 240)
  const popularTags = useMemo(() => getPopularTags(SERVICES, 36), [])

  useEffect(() => {
    const applyLocation = () => {
      const next = parseFilters(window.location.search, {
        categories: CATEGORIES,
        audiences: AUDIENCES,
        plans: PLANS,
        tags: TAGS,
      })
      setFilters(next)
      setSearchInput(next.query)
      setVisible(PAGE_SIZE)
    }
    applyLocation()
    setUrlReady(true)
    window.addEventListener('popstate', applyLocation)
    return () => window.removeEventListener('popstate', applyLocation)
  }, [])

  useEffect(() => {
    setFilters((current) => current.query === debouncedQuery ? current : { ...current, query: debouncedQuery })
  }, [debouncedQuery])

  useEffect(() => {
    if (!urlReady) return
    const query = serializeFilters(filters)
    const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [filters, urlReady])

  useEffect(() => setVisible(PAGE_SIZE), [filters])

  const filtered = useMemo(() => filterServices(SERVICES, filters), [filters])
  const shown = filtered.slice(0, visible)

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || visible >= filtered.length) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) setVisible((count) => Math.min(count + PAGE_SIZE, filtered.length))
    }, { rootMargin: '500px 0px' })
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, filtered.length])

  const activeCount = filters.categories.length
    + filters.audiences.length
    + filters.plans.length
    + filters.tags.length
    + Number(filters.liveOnly)

  const availableTags = useMemo(() => {
    const normalized = tagSearch.trim().toLowerCase()
    const source = normalized
      ? TAGS.filter((tag) => tag.includes(normalized)).slice(0, 40).map((tag) => [tag, SERVICES.filter((service) => service.tags.includes(tag)).length] as const)
      : popularTags
    return source
  }, [tagSearch, popularTags])

  function patch(next: Partial<ServiceFilters>) {
    setFilters((current) => ({ ...current, ...next }))
  }

  function reset() {
    setFilters(DEFAULT_FILTERS)
    setSearchInput('')
    setTagSearch('')
    setVisible(PAGE_SIZE)
  }

  function selectTag(tag: string) {
    patch({ tags: filters.tags.includes(tag) ? filters.tags : [...filters.tags, tag] })
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="mt-10">
      <div className="sticky top-2 z-20 rounded-2xl border border-line bg-bg/95 p-4 shadow-xl shadow-black/5 backdrop-blur dark:shadow-black/20">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_190px_auto]">
          <label className="grid gap-1.5 text-xs font-medium text-muted">
            Search services, capabilities and tags
            <div className="relative">
              <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Try Kubernetes, backup, CRM, diagrams…"
                className="h-11 w-full rounded-xl border border-line bg-panel pl-9 pr-10 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">×</button>
              )}
            </div>
          </label>

          <label className="grid gap-1.5 text-xs font-medium text-muted">
            Sort results
            <select
              value={filters.sort}
              onChange={(event) => patch({ sort: event.target.value as SortMode })}
              className="h-11 rounded-xl border border-line bg-panel px-3 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="relevance">Best match</option>
              <option value="name">Name</option>
              <option value="recently-verified">Recently verified</option>
              <option value="open-source">Open source first</option>
              <option value="live-test">Live key tests first</option>
            </select>
          </label>

          <div className="grid content-end">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="h-11 rounded-xl border border-line bg-panel px-4 text-sm font-semibold text-ink hover:border-accent"
              aria-expanded={filtersOpen}
            >
              {filtersOpen ? 'Hide filters' : 'More filters'}{activeCount ? ` · ${activeCount}` : ''}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <FilterChip active={filters.plans.includes('Open source')} onClick={() => patch({ plans: toggleValue(filters.plans, 'Open source') })}>Open source</FilterChip>
          <FilterChip active={filters.liveOnly} onClick={() => patch({ liveOnly: !filters.liveOnly })}>Live key test</FilterChip>
          {QUICK_AUDIENCES.map((audience) => (
            <FilterChip key={audience} active={filters.audiences.includes(audience)} onClick={() => patch({ audiences: toggleValue(filters.audiences, audience) })}>
              {audience} · {AUDIENCE_COUNTS.get(audience)}
            </FilterChip>
          ))}
        </div>

        {filtersOpen && (
          <div className="mt-4 grid gap-5 border-t border-line pt-4">
            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Categories</legend>
              <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-2">
                {CATEGORIES.map((category) => (
                  <FilterChip key={category} active={filters.categories.includes(category)} onClick={() => patch({ categories: toggleValue(filters.categories, category) })}>
                    {category} · {CATEGORY_COUNTS.get(category)}
                  </FilterChip>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 lg:grid-cols-2">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Audience</legend>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map((audience) => (
                    <FilterChip key={audience} active={filters.audiences.includes(audience)} onClick={() => patch({ audiences: toggleValue(filters.audiences, audience) })}>
                      {audience} · {AUDIENCE_COUNTS.get(audience)}
                    </FilterChip>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Free model</legend>
                <div className="flex flex-wrap gap-2">
                  {PLANS.map((plan) => (
                    <FilterChip key={plan} active={filters.plans.includes(plan)} onClick={() => patch({ plans: toggleValue(filters.plans, plan) })}>{plan}</FilterChip>
                  ))}
                </div>
              </fieldset>
            </div>

            <fieldset>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Tags</legend>
              <input
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value.toLowerCase())}
                placeholder="Find a tag…"
                className="mb-3 h-10 w-full max-w-sm rounded-xl border border-line bg-panel px-3 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent"
              />
              <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-2">
                {availableTags.map(([tag, count]) => (
                  <FilterChip key={tag} active={filters.tags.includes(tag)} onClick={() => patch({ tags: toggleValue(filters.tags, tag) })}>
                    #{tag} · {count}
                  </FilterChip>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm">
          <span className="text-muted"><strong className="text-ink">{filtered.length}</strong> of {SERVICES.length} services</span>
          {(activeCount > 0 || filters.query) && <button type="button" onClick={reset} className="font-semibold text-accent hover:underline">Clear all</button>}
        </div>

        {(activeCount > 0) && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
            {filters.categories.map((category) => <ActiveChip key={category} onRemove={() => patch({ categories: filters.categories.filter((item) => item !== category) })}>{category}</ActiveChip>)}
            {filters.audiences.map((audience) => <ActiveChip key={audience} onRemove={() => patch({ audiences: filters.audiences.filter((item) => item !== audience) })}>{audience}</ActiveChip>)}
            {filters.plans.map((plan) => <ActiveChip key={plan} onRemove={() => patch({ plans: filters.plans.filter((item) => item !== plan) })}>{plan}</ActiveChip>)}
            {filters.tags.map((tag) => <ActiveChip key={tag} onRemove={() => patch({ tags: filters.tags.filter((item) => item !== tag) })}>#{tag}</ActiveChip>)}
            {filters.liveOnly && <ActiveChip onRemove={() => patch({ liveOnly: false })}>Live key test</ActiveChip>}
          </div>
        )}
      </div>

      {shown.length ? (
        <>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((service) => <ServiceCard key={service.id} service={service} onTagSelect={selectTag} />)}
          </div>
          <div ref={loadMoreRef} className="mt-8 flex min-h-14 items-center justify-center">
            {visible < filtered.length && (
              <button type="button" onClick={() => setVisible((count) => Math.min(count + PAGE_SIZE, filtered.length))} className="rounded-xl border border-line bg-panel px-5 py-3 text-sm font-semibold text-ink hover:border-accent">
                Load {Math.min(PAGE_SIZE, filtered.length - visible)} more
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-panel/40 p-10 text-center sm:p-16">
          <div className="text-4xl" aria-hidden>⌕</div>
          <h2 className="mt-4 text-xl font-bold text-ink">No services match this combination</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Try a broader search, remove one of the tags, or clear the audience and category filters.</p>
          <button type="button" onClick={reset} className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-[#06111a]">Clear all filters</button>
        </div>
      )}
    </section>
  )
}
