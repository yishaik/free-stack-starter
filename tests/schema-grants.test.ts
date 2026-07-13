import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

// Resolved from the repo root (npm test runs from cwd) so it works regardless of the
// compiled test's location under the tsc outDir.
const schemaPath = join(process.cwd(), 'supabase', 'schema.sql')

// Regression guard for a defect found during PR #5 verification: RLS policies are
// necessary but NOT sufficient in Postgres — the `authenticated` role also needs
// table-level GRANTs, or PostgREST returns "42501 permission denied" for signed-in
// users. These assertions lock in the least-privilege grants (authenticated only,
// never anon) and the rate-limit function isolation that were verified against a
// real Supabase instance with two authenticated users.
const schema = readFileSync(schemaPath, 'utf8').toLowerCase()

test('authenticated has DML grants on the My Stack tables', () => {
  assert.match(schema, /grant\s+select,\s*insert,\s*update\s+on\s+public\.profiles\s+to\s+authenticated/)
  assert.match(schema, /grant\s+select,\s*insert,\s*update,\s*delete\s+on\s+public\.user_stacks\s+to\s+authenticated/)
  assert.match(schema, /grant\s+select,\s*insert,\s*update,\s*delete\s+on\s+public\.stack_services\s+to\s+authenticated/)
})

test('anon is never granted DML on account tables (local-first only)', () => {
  assert.doesNotMatch(schema, /grant\s+[a-z, ]*(select|insert|update|delete)[a-z, ]*\s+on\s+public\.(profiles|user_stacks|stack_services)\s+to\s+[^;]*\banon\b/)
})

test('rate-limit function is executable only by service_role', () => {
  assert.match(schema, /grant\s+execute\s+on\s+function\s+public\.consume_rate_limit\([^)]*\)\s+to\s+service_role/)
  assert.match(schema, /revoke\s+all\s+on\s+function\s+public\.consume_rate_limit\([^)]*\)\s+from\s+public/)
  assert.match(schema, /revoke\s+all\s+on\s+function\s+public\.consume_rate_limit\([^)]*\)\s+from\s+anon,\s*authenticated/)
})

test('private schema is revoked from anon and authenticated', () => {
  assert.match(schema, /revoke\s+all\s+on\s+schema\s+private\s+from\s+anon,\s*authenticated/)
})

test('security-definer functions pin a fixed search_path', () => {
  assert.match(schema, /security\s+definer\s+set\s+search_path\s*=/)
})
