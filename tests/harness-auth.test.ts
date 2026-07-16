import assert from 'node:assert/strict'
import test from 'node:test'
import { hasHarnessAccess } from '../lib/harness-auth'

const key = 'a-secure-harness-key-that-is-long-enough'

test('accepts only the exact configured bearer key', () => {
  assert.equal(hasHarnessAccess(key, `Bearer ${key}`), true)
  assert.equal(hasHarnessAccess(key, 'Bearer wrong-key-that-is-long-enough'), false)
  assert.equal(hasHarnessAccess(key, key), false)
})

test('fails closed when the configured key is missing or too short', () => {
  assert.equal(hasHarnessAccess(undefined, `Bearer ${key}`), false)
  assert.equal(hasHarnessAccess('too-short', 'Bearer too-short'), false)
  assert.equal(hasHarnessAccess(key, null), false)
})
