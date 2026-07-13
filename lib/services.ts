import { CATALOG_A } from './catalog-a'
import { CATALOG_B } from './catalog-b'
import { CATALOG_C } from './catalog-c'
import { CATALOG_D } from './catalog-d'
import { CATALOG_E } from './catalog-e'
import { LIVE_TESTER_SET } from './live-testers'
import {
  PLAN_COPY,
  getAudienceLabel,
  parseCatalogSources,
  type Audience,
  type PlanType,
  type Service,
} from './catalog-parser'

export type { Audience, PlanType, Service }
export { getAudienceLabel }

export const LAST_REVIEWED = '2026-07-13'

const parsed = parseCatalogSources(
  [CATALOG_A, CATALOG_B, CATALOG_C, CATALOG_D, CATALOG_E],
  { defaultLastVerified: LAST_REVIEWED },
)

export const SERVICES: Service[] = parsed.map((service) => ({
  ...service,
  tags: service.testerId && LIVE_TESTER_SET.has(service.testerId)
    ? [...service.tags, 'live-key-test']
    : service.tags,
}))

export const CATEGORIES = [...new Set(SERVICES.map((service) => service.category))].sort()
export const AUDIENCES: Audience[] = [
  'Developers',
  'DevOps',
  'IT',
  'Security',
  'Data & AI',
  'Designers',
  'Productivity',
  'Business & Operations',
]
export const PLANS: PlanType[] = ['Free tier', 'Open source', 'Free credits', 'Free for OSS']
export const TAGS = [...new Set(SERVICES.flatMap((service) => service.tags))]
  .sort((a, b) => a.localeCompare(b))

export const CATEGORY_COUNTS = new Map(
  CATEGORIES.map((category) => [category, SERVICES.filter((service) => service.category === category).length]),
)

export const AUDIENCE_COUNTS = new Map(
  AUDIENCES.map((audience) => [audience, SERVICES.filter((service) => service.audiences.includes(audience)).length]),
)

export function getService(id: string) {
  return SERVICES.find((service) => service.id === id)
}

export function getPlanCopy(plan: PlanType) {
  return PLAN_COPY[plan]
}
