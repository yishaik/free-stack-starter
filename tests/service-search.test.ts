import assert from 'node:assert/strict'
import test from 'node:test'
import { filterServices, parseFilters, scoreService, serializeFilters, type ServiceFilters } from '../lib/service-search'
import type { Service } from '../lib/catalog-parser'

function service(overrides: Partial<Service>): Service {
  return {
    id: 'tool',
    name: 'Tool',
    category: 'Developer Tools',
    audiences: ['Developers'],
    plan: 'Free tier',
    summary: 'A useful service.',
    signup: 'https://example.com',
    docs: 'https://example.com/docs',
    tags: ['developer-tools', 'free-tier', 'agent-ready'],
    actionLabel: 'Sign up',
    lastVerified: '2026-07-13',
    source: 'https://github.com/example/source',
    platforms: [],
    deployment: [],
    ...overrides,
  }
}

const services = [
  service({ id: 'kubernetes', name: 'Kubernetes', category: 'Containers & Orchestration', audiences: ['Developers', 'DevOps', 'IT'], plan: 'Open source', tags: ['kubernetes', 'containers', 'open-source', 'devops'] }),
  service({ id: 'joplin', name: 'Joplin', category: 'Knowledge & Documentation', audiences: ['Productivity'], plan: 'Open source', tags: ['notes', 'markdown', 'open-source', 'productivity'] }),
  service({ id: 'github', name: 'GitHub', audiences: ['Developers', 'DevOps'], tags: ['git', 'ci', 'free-tier'], testerId: 'github' }),
]

test('fuzzy search tolerates a small misspelling', () => {
  assert.ok(scoreService(services[0], 'kubernets') > 0)
  const results = filterServices(services, {
    query: 'kubernets', categories: [], audiences: [], plans: [], tags: [], liveOnly: false, sort: 'relevance',
  })
  assert.equal(results[0]?.id, 'kubernetes')
})

test('combines multi-select dimensions predictably', () => {
  const results = filterServices(services, {
    query: '',
    categories: ['Containers & Orchestration', 'Knowledge & Documentation'],
    audiences: ['DevOps'],
    plans: ['Open source'],
    tags: ['containers'],
    liveOnly: false,
    sort: 'name',
  })
  assert.deepEqual(results.map((item) => item.id), ['kubernetes'])
})

test('live key filter uses the allowlisted tester set', () => {
  const results = filterServices(services, {
    query: '', categories: [], audiences: [], plans: [], tags: [], liveOnly: true, sort: 'live-test',
  })
  assert.deepEqual(results.map((item) => item.id), ['github'])
})

test('filter state round-trips through the URL', () => {
  const filters: ServiceFilters = {
    query: 'backup',
    categories: ['Backup & Recovery'],
    audiences: ['IT', 'DevOps'],
    plans: ['Open source'],
    tags: ['encryption'],
    liveOnly: true,
    sort: 'recently-verified',
  }
  const serialized = serializeFilters(filters)
  const parsed = parseFilters(serialized, {
    categories: ['Backup & Recovery'],
    audiences: ['IT', 'DevOps'],
    plans: ['Open source'],
    tags: ['encryption'],
  })
  assert.deepEqual(parsed, filters)
})
