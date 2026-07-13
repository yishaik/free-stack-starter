import { AUDIENCES, CATEGORIES, SERVICES, TAGS } from '../lib/services'

const validate = process.argv.includes('--validate')
const errors: string[] = []
const warnings: string[] = []
const now = Date.now()

for (const service of SERVICES) {
  if (!service.audiences.length) errors.push(`${service.name}: missing audiences`)
  if (service.tags.length < 5) errors.push(`${service.name}: expected at least five searchable tags`)
  if (!service.lastVerified) errors.push(`${service.name}: missing lastVerified`)
  if (!service.source) errors.push(`${service.name}: missing source`)
  if (new Date(`${service.lastVerified}T00:00:00Z`).getTime() > now) errors.push(`${service.name}: lastVerified is in the future`)

  const ageDays = Math.floor((now - new Date(`${service.lastVerified}T00:00:00Z`).getTime()) / 86_400_000)
  if (ageDays > 365) warnings.push(`${service.name}: verification is ${ageDays} days old`)
}

const categoryRows = CATEGORIES
  .map((category) => ({ category, count: SERVICES.filter((service) => service.category === category).length }))
  .sort((left, right) => right.count - left.count)

const audienceRows = AUDIENCES
  .map((audience) => ({ audience, count: SERVICES.filter((service) => service.audiences.includes(audience)).length }))
  .sort((left, right) => right.count - left.count)

const sourceCounts = new Map<string, number>()
for (const service of SERVICES) {
  sourceCounts.set(service.source, (sourceCounts.get(service.source) || 0) + 1)
}

console.log(`Catalog: ${SERVICES.length} services · ${CATEGORIES.length} categories · ${AUDIENCES.length} audiences · ${TAGS.length} tags`)
console.log('\nLargest categories:')
console.table(categoryRows.slice(0, 12))
console.log('\nAudience coverage:')
console.table(audienceRows)
console.log('\nSources:')
console.table([...sourceCounts.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count))

if (warnings.length) {
  console.warn(`\nWarnings (${warnings.length}):`)
  for (const warning of warnings.slice(0, 30)) console.warn(`- ${warning}`)
  if (warnings.length > 30) console.warn(`- …and ${warnings.length - 30} more`)
}

if (errors.length) {
  console.error(`\nValidation errors (${errors.length}):`)
  for (const error of errors) console.error(`- ${error}`)
  if (validate) process.exitCode = 1
} else {
  console.log('\nCatalog validation passed.')
}
