import { CATALOG_A } from './catalog-a'
import { CATALOG_B } from './catalog-b'
import { CATALOG_C } from './catalog-c'
import { CATALOG_D } from './catalog-d'

export type Audience = 'Developers' | 'Designers' | 'Both'
export type PlanType = 'Free tier' | 'Open source' | 'Free credits' | 'Free for OSS'

export type Service = {
  id: string
  name: string
  category: string
  audience: Audience
  plan: PlanType
  summary: string
  signup: string
  docs: string
  tags: string[]
  testerId?: string
  actionLabel: string
}

const CATEGORY: Record<string, string> = {
  A: 'AI & ML',
  B: 'Accessibility',
  C: 'Authentication',
  D: 'Automation & Forms',
  E: 'CMS & Content',
  F: 'Database & Backend',
  G: 'Design & Creative',
  H: 'Design Assets',
  I: 'Developer Tools',
  J: 'Email & Messaging',
  K: 'Hosting & Deploy',
  L: 'Maps & Data APIs',
  M: 'Observability & Analytics',
  N: 'Payments & Commerce',
  O: 'Search & Vector',
  P: 'Security',
  Q: 'Storage & Media',
  R: 'Testing & QA',
}
const AUDIENCE: Record<string, Audience> = { d: 'Developers', g: 'Designers', b: 'Both' }
const PLAN: Record<string, PlanType> = { f: 'Free tier', o: 'Open source', c: 'Free credits', s: 'Free for OSS' }

const PLAN_COPY: Record<PlanType, string> = {
  'Free tier': 'A permanent free plan is available, with product-specific quotas.',
  'Open source': 'Free to download or self-host under an open-source license.',
  'Free credits': 'Free starter credits or a trial are available; ongoing usage may be paid.',
  'Free for OSS': 'Free usage is available for qualifying open-source projects.',
}

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseCatalog(source: string): Service[] {
  return source.trim().split('\n').filter(Boolean).map((line, index) => {
    const [name, categoryCode, audienceCode, planCode, summary, signup, docs, tags, testerId] = line.split('|')
    if (!name || !CATEGORY[categoryCode] || !AUDIENCE[audienceCode] || !PLAN[planCode] || !summary || !signup || !docs) {
      throw new Error(`Invalid service catalog row ${index + 1}`)
    }
    const plan = PLAN[planCode]
    return {
      id: slugify(name),
      name,
      category: CATEGORY[categoryCode],
      audience: AUDIENCE[audienceCode],
      plan,
      summary,
      signup,
      docs,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      testerId: testerId || undefined,
      actionLabel: plan === 'Open source' ? 'Get started' : plan === 'Free credits' ? 'Start free' : 'Sign up',
    }
  })
}

const parsed = parseCatalog(`${CATALOG_A}\n${CATALOG_B}\n${CATALOG_C}\n${CATALOG_D}`)
const ids = new Set<string>()
for (const service of parsed) {
  if (ids.has(service.id)) throw new Error(`Duplicate service id: ${service.id}`)
  ids.add(service.id)
}

export const SERVICES = parsed.sort((a, b) => a.name.localeCompare(b.name))
export const CATEGORIES = [...new Set(SERVICES.map((service) => service.category))].sort()
export const AUDIENCES: Audience[] = ['Both', 'Developers', 'Designers']
export const PLANS: PlanType[] = ['Free tier', 'Open source', 'Free credits', 'Free for OSS']
export const LAST_REVIEWED = '2026-07-13'

export function getService(id: string) {
  return SERVICES.find((service) => service.id === id)
}

export function getPlanCopy(plan: PlanType) {
  return PLAN_COPY[plan]
}
