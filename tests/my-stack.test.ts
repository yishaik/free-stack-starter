import assert from 'node:assert/strict'
import test from 'node:test'
import { mergeServiceIds, normalizeServiceIds, parseStoredStack } from '../lib/my-stack-core'

test('keeps only known unique service ids', () => {
  const ids = normalizeServiceIds(['github', 'github', 'unknown-service', null, ' vercel '])
  assert.deepEqual(ids, ['github', 'vercel'])
})

test('parses safe local storage values and rejects malformed JSON', () => {
  assert.deepEqual(parseStoredStack('["github","vercel"]'), ['github', 'vercel'])
  assert.deepEqual(parseStoredStack('{broken'), [])
  assert.deepEqual(parseStoredStack(null), [])
})

test('merges local and account stacks without duplicates', () => {
  assert.deepEqual(mergeServiceIds(['github', 'vercel'], ['vercel', 'supabase']), ['github', 'vercel', 'supabase'])
})
