import { LIVE_TESTER_SET } from './live-testers'
import type { Audience, PlanType, Service } from './catalog-parser'

export type SortMode = 'relevance' | 'name' | 'recently-verified' | 'open-source' | 'live-test'

export type ServiceFilters = {
  query: string
  categories: string[]
  audiences: Audience[]
  plans: PlanType[]
  tags: string[]
  liveOnly: boolean
  sort: SortMode
}

export const DEFAULT_FILTERS: ServiceFilters = {
  query: '',
  categories: [],
  audiences: [],
  plans: [],
  tags: [],
  liveOnly: false,
  sort: 'relevance',
}

function normalize(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function subsequenceScore(needle: string, haystack: string) {
  let cursor = 0
  let gaps = 0
  let first = -1

  for (let index = 0; index < haystack.length && cursor < needle.length; index += 1) {
    if (haystack[index] === needle[cursor]) {
      if (first === -1) first = index
      cursor += 1
    } else if (cursor > 0) {
      gaps += 1
    }
  }

  if (cursor !== needle.length) return 0
  return Math.max(10, 90 - gaps - Math.max(0, first) * 2)
}

function scoreToken(token: string, service: Service) {
  const name = normalize(service.name)
  const summary = normalize(service.summary)
  const category = normalize(service.category)
  const audiences = normalize(service.audiences.join(' '))
  const tags = service.tags.map(normalize)

  if (name === token) return 1000
  if (name.startsWith(token)) return 700
  if (name.includes(token)) return 520
  if (tags.some((tag) => tag === token)) return 460
  if (tags.some((tag) => tag.startsWith(token))) return 380
  if (category.includes(token)) return 300
  if (audiences.includes(token)) return 260
  if (summary.includes(token)) return 220

  return Math.max(
    subsequenceScore(token, name) * 2,
    ...tags.map((tag) => subsequenceScore(token, tag)),
  )
}

export function scoreService(service: Service, rawQuery: string) {
  const query = normalize(rawQuery)
  if (!query) return 0
  const tokens = query.split(/\s+/).filter(Boolean)
  const scores = tokens.map((token) => scoreToken(token, service))
  if (scores.some((score) => score === 0)) return 0
  return scores.reduce((total, score) => total + score, 0)
}

export function filterServices(services: Service[], filters: ServiceFilters) {
  const scored = services
    .map((service) => ({ service, score: scoreService(service, filters.query) }))
    .filter(({ service, score }) => {
      if (filters.query.trim() && score === 0) return false
      if (filters.categories.length && !filters.categories.includes(service.category)) return false
      if (filters.audiences.length && !filters.audiences.some((audience) => service.audiences.includes(audience))) return false
      if (filters.plans.length && !filters.plans.includes(service.plan)) return false
      if (filters.tags.length && !filters.tags.every((tag) => service.tags.includes(tag))) return false
      if (filters.liveOnly && !(service.testerId && LIVE_TESTER_SET.has(service.testerId))) return false
      return true
    })

  return scored.sort((left, right) => {
    if (filters.sort === 'relevance' && filters.query.trim() && left.score !== right.score) {
      return right.score - left.score
    }
    if (filters.sort === 'recently-verified' && left.service.lastVerified !== right.service.lastVerified) {
      return right.service.lastVerified.localeCompare(left.service.lastVerified)
    }
    if (filters.sort === 'open-source' && left.service.plan !== right.service.plan) {
      return left.service.plan === 'Open source' ? -1 : right.service.plan === 'Open source' ? 1 : 0
    }
    if (filters.sort === 'live-test') {
      const leftLive = Boolean(left.service.testerId && LIVE_TESTER_SET.has(left.service.testerId))
      const rightLive = Boolean(right.service.testerId && LIVE_TESTER_SET.has(right.service.testerId))
      if (leftLive !== rightLive) return leftLive ? -1 : 1
    }
    return left.service.name.localeCompare(right.service.name)
  }).map(({ service }) => service)
}

export function getPopularTags(services: Service[], limit = 30) {
  const counts = new Map<string, number>()
  for (const service of services) {
    for (const tag of service.tags) counts.set(tag, (counts.get(tag) || 0) + 1)
  }
  return [...counts.entries()]
    .filter(([tag]) => !['agent-ready', 'developers', 'designers', 'devops', 'it', 'security', 'data-and-ai', 'productivity', 'business-and-operations'].includes(tag))
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
}

export function serializeFilters(filters: ServiceFilters) {
  const params = new URLSearchParams()
  if (filters.query.trim()) params.set('q', filters.query.trim())
  if (filters.categories.length) params.set('categories', filters.categories.join(','))
  if (filters.audiences.length) params.set('audiences', filters.audiences.join(','))
  if (filters.plans.length) params.set('plans', filters.plans.join(','))
  if (filters.tags.length) params.set('tags', filters.tags.join(','))
  if (filters.liveOnly) params.set('live', '1')
  if (filters.sort !== 'relevance') params.set('sort', filters.sort)
  return params.toString()
}

export function parseFilters(search: string, valid: {
  categories: string[]
  audiences: Audience[]
  plans: PlanType[]
  tags: string[]
}): ServiceFilters {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const list = (key: string) => (params.get(key) || '').split(',').map((item) => item.trim()).filter(Boolean)
  const categories = list('categories').filter((item) => valid.categories.includes(item))
  const audiences = list('audiences').filter((item): item is Audience => valid.audiences.includes(item as Audience))
  const plans = list('plans').filter((item): item is PlanType => valid.plans.includes(item as PlanType))
  const tags = list('tags').filter((item) => valid.tags.includes(item))
  const candidateSort = params.get('sort') as SortMode | null
  const sort: SortMode = candidateSort && ['relevance', 'name', 'recently-verified', 'open-source', 'live-test'].includes(candidateSort)
    ? candidateSort
    : 'relevance'

  return {
    query: params.get('q') || '',
    categories,
    audiences,
    plans,
    tags,
    liveOnly: params.get('live') === '1',
    sort,
  }
}
