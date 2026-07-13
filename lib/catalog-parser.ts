export type Audience =
  | 'Developers'
  | 'Designers'
  | 'DevOps'
  | 'IT'
  | 'Productivity'
  | 'Security'
  | 'Data & AI'
  | 'Business & Operations'

export type PlanType = 'Free tier' | 'Open source' | 'Free credits' | 'Free for OSS'

export type Service = {
  id: string
  name: string
  category: string
  audiences: Audience[]
  plan: PlanType
  summary: string
  signup: string
  docs: string
  tags: string[]
  testerId?: string
  actionLabel: string
  lastVerified: string
  source: string
  platforms: string[]
  deployment: string[]
}

export const CATEGORY: Record<string, string> = {
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
  S: 'CI/CD & Delivery',
  T: 'Containers & Orchestration',
  U: 'Infrastructure as Code',
  V: 'IT & Sysadmin',
  W: 'Backup & Recovery',
  X: 'Networking & Remote Access',
  Y: 'Productivity & Collaboration',
  Z: 'Project & Task Management',
  AA: 'Knowledge & Documentation',
  AB: 'Business Operations',
  AC: 'Data & BI',
  AD: 'Self-Hosting & Homelab',
}

const AUDIENCE_CODE: Record<string, Audience[]> = {
  d: ['Developers'],
  g: ['Designers'],
  b: ['Developers', 'Designers'],
  v: ['DevOps'],
  i: ['IT'],
  p: ['Productivity'],
  s: ['Security'],
  a: ['Data & AI'],
  o: ['Business & Operations'],
}

const PLAN_CODE: Record<string, PlanType> = {
  f: 'Free tier',
  o: 'Open source',
  c: 'Free credits',
  s: 'Free for OSS',
}

export const PLAN_COPY: Record<PlanType, string> = {
  'Free tier': 'A permanent free plan is available, with product-specific quotas.',
  'Open source': 'Free to download or self-host under an open-source license.',
  'Free credits': 'Free starter credits or a trial are available; ongoing usage may be paid.',
  'Free for OSS': 'Free usage is available for qualifying open-source projects.',
}

const CATEGORY_AUDIENCES: Record<string, Audience[]> = {
  'AI & ML': ['Developers', 'Data & AI'],
  Accessibility: ['Developers', 'Designers'],
  Authentication: ['Developers', 'Security'],
  'Automation & Forms': ['Developers', 'Productivity', 'Business & Operations'],
  'CMS & Content': ['Designers', 'Productivity', 'Business & Operations'],
  'Database & Backend': ['Developers', 'Data & AI'],
  'Design & Creative': ['Designers'],
  'Design Assets': ['Designers'],
  'Developer Tools': ['Developers', 'DevOps'],
  'Email & Messaging': ['Developers', 'Business & Operations'],
  'Hosting & Deploy': ['Developers', 'DevOps'],
  'Maps & Data APIs': ['Developers', 'Data & AI'],
  'Observability & Analytics': ['DevOps', 'IT', 'Data & AI'],
  'Payments & Commerce': ['Developers', 'Business & Operations'],
  'Search & Vector': ['Developers', 'Data & AI'],
  Security: ['Security', 'DevOps', 'IT'],
  'Storage & Media': ['Developers', 'DevOps'],
  'Testing & QA': ['Developers', 'DevOps'],
  'CI/CD & Delivery': ['Developers', 'DevOps'],
  'Containers & Orchestration': ['Developers', 'DevOps', 'IT'],
  'Infrastructure as Code': ['DevOps', 'IT'],
  'IT & Sysadmin': ['IT', 'DevOps'],
  'Backup & Recovery': ['IT', 'DevOps'],
  'Networking & Remote Access': ['IT', 'Security', 'DevOps'],
  'Productivity & Collaboration': ['Productivity', 'Business & Operations'],
  'Project & Task Management': ['Productivity', 'Business & Operations'],
  'Knowledge & Documentation': ['Productivity', 'Business & Operations'],
  'Business Operations': ['Business & Operations', 'Productivity'],
  'Data & BI': ['Data & AI', 'Business & Operations'],
  'Self-Hosting & Homelab': ['IT', 'DevOps'],
}

const TAG_AUDIENCES: Array<[RegExp, Audience[]]> = [
  [/\b(vpn|network|dns|remote|endpoint|asset|ldap|sysadmin|homelab)\b/i, ['IT']],
  [/\b(security|sast|malware|threat|zero trust|secrets|iam|vulnerability)\b/i, ['Security']],
  [/\b(ci|cd|deploy|container|kubernetes|infrastructure|iac|gitops|observability)\b/i, ['DevOps']],
  [/\b(ai|llm|vector|dataset|analytics|bi|etl|warehouse|database)\b/i, ['Data & AI']],
  [/\b(tasks?|notes?|calendar|knowledge|collaboration|office|productivity)\b/i, ['Productivity']],
  [/\b(crm|erp|billing|commerce|helpdesk|ticketing|operations)\b/i, ['Business & Operations']],
]

export const DEFAULT_SOURCE = 'https://github.com/yishaik/free-stack-starter'

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function unique<T>(items: T[]) {
  return [...new Set(items)]
}

function parseList(value: string | undefined) {
  return unique((value || '').split(',').map((item) => item.trim()).filter(Boolean))
}

function parseAudiences(codes: string, category: string, tags: string[]): Audience[] {
  const explicit = codes
    .split(',')
    .flatMap((code) => AUDIENCE_CODE[code.trim()] || [])

  const inferred = [...(CATEGORY_AUDIENCES[category] || [])]
  const searchable = tags.join(' ')
  for (const [pattern, audiences] of TAG_AUDIENCES) {
    if (pattern.test(searchable)) inferred.push(...audiences)
  }

  return unique([...explicit, ...inferred])
}

function assertHttpUrl(value: string, field: string, rowNumber: number) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`Invalid ${field} URL in catalog row ${rowNumber}: ${value}`)
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Unsupported ${field} URL protocol in catalog row ${rowNumber}: ${value}`)
  }
}

function assertDate(value: string, rowNumber: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error(`Invalid lastVerified date in catalog row ${rowNumber}: ${value}`)
  }
}

export function parseCatalog(source: string, options: {
  defaultLastVerified: string
  defaultSource?: string
}): Service[] {
  return source.trim().split('\n').filter((line) => line.trim()).map((line, index) => {
    const rowNumber = index + 1
    const fields = line.split('|').map((field) => field.trim())
    const [
      name,
      categoryCode,
      audienceCodes,
      planCode,
      summary,
      signup,
      docs,
      rawTags = '',
      testerId = '',
      rawLastVerified = '',
      rawSource = '',
      rawPlatforms = '',
      rawDeployment = '',
    ] = fields

    const category = CATEGORY[categoryCode]
    const plan = PLAN_CODE[planCode]
    if (!name || !category || !audienceCodes || !plan || !summary || !signup || !docs) {
      throw new Error(`Invalid service catalog row ${rowNumber}`)
    }

    assertHttpUrl(signup, 'signup', rowNumber)
    assertHttpUrl(docs, 'docs', rowNumber)

    const lastVerified = rawLastVerified || options.defaultLastVerified.trim()
    assertDate(lastVerified, rowNumber)

    const sourceUrl = rawSource || options.defaultSource?.trim() || DEFAULT_SOURCE
    assertHttpUrl(sourceUrl, 'source', rowNumber)

    const baseTags = parseList(rawTags).map((tag) => tag.toLowerCase())
    const audiences = parseAudiences(audienceCodes, category, baseTags)
    const tags = unique([
      ...baseTags,
      slugify(category),
      slugify(plan),
      ...audiences.map(slugify),
      'agent-ready',
    ])

    return {
      id: slugify(name),
      name,
      category,
      audiences,
      plan,
      summary,
      signup,
      docs,
      tags,
      testerId: testerId || undefined,
      actionLabel: plan === 'Open source' ? 'Get started' : plan === 'Free credits' ? 'Start free' : 'Sign up',
      lastVerified,
      source: sourceUrl,
      platforms: parseList(rawPlatforms),
      deployment: parseList(rawDeployment),
    }
  })
}

export function parseCatalogSources(sources: string[], options: {
  defaultLastVerified: string
  defaultSource?: string
}) {
  const services = sources.flatMap((source) => parseCatalog(source, options))
  const ids = new Set<string>()
  for (const service of services) {
    if (ids.has(service.id)) throw new Error(`Duplicate service id: ${service.id}`)
    ids.add(service.id)
  }
  return services.sort((a, b) => a.name.localeCompare(b.name))
}

export function getAudienceLabel(audiences: Audience[]) {
  if (audiences.length <= 2) return audiences.join(' · ')
  return `${audiences.slice(0, 2).join(' · ')} +${audiences.length - 2}`
}
