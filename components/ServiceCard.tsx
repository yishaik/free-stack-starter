'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AgentAccessBox } from '@/components/AgentAccessBox'
import { LIVE_TESTER_SET } from '@/lib/live-testers'
import { getAudienceLabel, getPlanCopy, type Service } from '@/lib/services'

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
  'CI/CD & Delivery': 'CI',
  'Containers & Orchestration': 'CTR',
  'Infrastructure as Code': 'IaC',
  'IT & Sysadmin': 'IT',
  'Backup & Recovery': 'BKP',
  'Networking & Remote Access': 'NET',
  'Productivity & Collaboration': 'PRO',
  'Project & Task Management': 'TASK',
  'Knowledge & Documentation': 'DOC',
  'Business Operations': 'OPS',
  'Data & BI': 'BI',
  'Self-Hosting & Homelab': 'HOME',
}

function sourceLabel(source: string) {
  try {
    const url = new URL(source)
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : 'GitHub'
    }
    return url.hostname.replace(/^www\./, '')
  } catch {
    return 'Catalog source'
  }
}

export function ServiceCard({ service, onTagSelect }: {
  service: Service
  onTagSelect: (tag: string) => void
}) {
  const [copied, setCopied] = useState(false)
  const live = Boolean(service.testerId && LIVE_TESTER_SET.has(service.testerId))
  const visibleTags = service.tags.slice(0, 7)
  const extraTags = service.tags.slice(7)

  async function copyLink() {
    const url = new URL(window.location.href)
    url.hash = service.id
    await navigator.clipboard.writeText(url.toString())
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <article
      id={service.id}
      className="group flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-line bg-panel/80 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20"
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="grid h-11 min-w-11 place-items-center rounded-xl border border-line bg-bg px-2 font-mono text-[10px] font-black text-accent">
            {CATEGORY_ICONS[service.category] || '◌'}
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            <span className="rounded-full border border-line bg-bg px-2.5 py-1 text-[10px] font-medium text-muted">{service.plan}</span>
            {live && (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                Live key test
              </span>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent">{service.category}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">{service.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{service.summary}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5" aria-label={`Audiences for ${service.name}`}>
          {service.audiences.map((audience) => (
            <span key={audience} className="rounded-md border border-line bg-bg px-2 py-1 text-[10px] font-medium text-muted">
              {audience}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-muted/90">{getPlanCopy(service.plan)}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagSelect(tag)}
              className="rounded-md bg-bg px-2 py-1 text-[10px] text-muted transition hover:bg-accent/10 hover:text-accent"
              title={`Filter by ${tag}`}
            >
              #{tag}
            </button>
          ))}
          {extraTags.length > 0 && (
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-md bg-bg px-2 py-1 text-[10px] text-muted hover:text-accent">
                +{extraTags.length} tags
              </summary>
              <div className="absolute right-0 z-10 mt-2 flex w-64 flex-wrap gap-1.5 rounded-xl border border-line bg-panel p-3 shadow-2xl">
                {extraTags.map((tag) => (
                  <button key={tag} type="button" onClick={() => onTagSelect(tag)} className="rounded-md bg-bg px-2 py-1 text-[10px] text-muted hover:text-accent">
                    #{tag}
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs">
          <div>
            <dt className="text-muted">Audience</dt>
            <dd className="mt-1 font-medium text-ink">{getAudienceLabel(service.audiences)}</dd>
          </div>
          <div>
            <dt className="text-muted">Last verified</dt>
            <dd className="mt-1 font-mono text-ink">{service.lastVerified}</dd>
          </div>
          <div>
            <dt className="text-muted">Platforms</dt>
            <dd className="mt-1 font-medium text-ink">{service.platforms.length ? service.platforms.join(', ') : 'See official docs'}</dd>
          </div>
          <div>
            <dt className="text-muted">Deployment</dt>
            <dd className="mt-1 font-medium text-ink">{service.deployment.length ? service.deployment.join(', ') : 'Provider-specific'}</dd>
          </div>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a href={service.signup} target="_blank" rel="noreferrer" className="rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-bold text-[#06111a] transition hover:brightness-105">
            {service.actionLabel} ↗
          </a>
          <a href={service.docs} target="_blank" rel="noreferrer" className="rounded-xl border border-line bg-bg px-3 py-2.5 text-center text-sm font-semibold text-ink hover:border-accent">
            Official docs ↗
          </a>
        </div>
      </div>

      <div className="border-t border-line px-5 py-3 text-xs">
        <AgentAccessBox service={service} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3 text-xs">
        <a href={service.source} target="_blank" rel="noreferrer" className="max-w-[180px] truncate text-muted hover:text-accent" title={service.source}>
          Source: {sourceLabel(service.source)} ↗
        </a>
        <div className="flex items-center gap-3">
          <button type="button" onClick={copyLink} className="text-muted hover:text-accent">{copied ? 'Copied ✓' : 'Copy link'}</button>
          <Link href={`/test-keys?service=${service.id}`} className="font-semibold text-ink hover:text-accent">
            {service.testerId ? 'Test setup' : 'Setup guide'}
          </Link>
        </div>
      </div>
    </article>
  )
}
