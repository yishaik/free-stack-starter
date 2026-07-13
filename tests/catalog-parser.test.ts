import assert from 'node:assert/strict'
import test from 'node:test'
import { parseCatalog, parseCatalogSources } from '../lib/catalog-parser'

const options = { defaultLastVerified: '2026-07-13' }

test('parses legacy rows and enriches audiences and tags', () => {
  const [service] = parseCatalog(
    'Example|K|b|f|A useful platform.|https://example.com/signup|https://example.com/docs|deploy,cdn|example',
    options,
  )

  assert.equal(service.id, 'example')
  assert.deepEqual(service.audiences, ['Developers', 'Designers', 'DevOps'])
  assert.equal(service.lastVerified, '2026-07-13')
  assert.equal(service.source, 'https://github.com/yishaik/free-stack-starter')
  assert.ok(service.tags.includes('hosting-and-deploy'))
  assert.ok(service.tags.includes('free-tier'))
  assert.ok(service.tags.includes('agent-ready'))
})

test('parses extended metadata fields', () => {
  const [service] = parseCatalog(
    'Tool|V|i,v|o|Operations tool.|https://example.com/install|https://example.com/docs|assets,inventory||2026-06-20|https://github.com/example/awesome-list|linux,windows|self-hosted,local',
    options,
  )

  assert.deepEqual(service.audiences, ['IT', 'DevOps'])
  assert.deepEqual(service.platforms, ['linux', 'windows'])
  assert.deepEqual(service.deployment, ['self-hosted', 'local'])
  assert.equal(service.source, 'https://github.com/example/awesome-list')
  assert.equal(service.lastVerified, '2026-06-20')
})

test('trims fields before creating ids and validating metadata', () => {
  const [service] = parseCatalog(
    '  dbt Core  | AC | a,d | o | SQL transformations. | https://example.com/install | https://example.com/docs | SQL, ETL || 2026-07-01 | https://github.com/example/list | linux, macos | local, cloud ',
    options,
  )

  assert.equal(service.name, 'dbt Core')
  assert.equal(service.id, 'dbt-core')
  assert.deepEqual(service.tags.slice(0, 2), ['sql', 'etl'])
  assert.deepEqual(service.platforms, ['linux', 'macos'])
  assert.deepEqual(service.deployment, ['local', 'cloud'])
})

test('rejects invalid URLs and dates', () => {
  assert.throws(
    () => parseCatalog('Bad|K|d|f|Broken.|not-a-url|https://example.com/docs|tag', options),
    /Invalid signup URL/,
  )
  assert.throws(
    () => parseCatalog('Bad|K|d|f|Broken.|https://example.com|https://example.com/docs|tag||June|https://example.com', options),
    /Invalid lastVerified date/,
  )
})

test('rejects duplicate service ids across catalog sources', () => {
  const row = 'Same Tool|K|d|f|Description.|https://example.com|https://example.com/docs|tag'
  assert.throws(() => parseCatalogSources([row, row], options), /Duplicate service id/)
})
