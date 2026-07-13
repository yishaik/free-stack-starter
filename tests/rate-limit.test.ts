import assert from 'node:assert/strict'
import test from 'node:test'
import { consumeMemoryBucket, hashRateLimitBucket, pruneMemoryBuckets } from '../lib/rate-limit-core'

test('hashes identities deterministically without exposing raw values', () => {
  const identity = '203.0.113.42'
  const secret = 'a-secure-test-secret-value'
  const first = hashRateLimitBucket(identity, secret)
  const second = hashRateLimitBucket(identity, secret)

  assert.equal(first, second)
  assert.equal(first.length, 64)
  assert.equal(first.includes(identity), false)
  assert.notEqual(first, hashRateLimitBucket(identity, `${secret}-different`))
})

test('memory limiter resets windows and rejects requests over the limit', () => {
  const buckets = new Map<string, { count: number; resetAt: number }>()
  const first = consumeMemoryBucket(buckets, 'bucket', 2, 60, 1_000)
  const second = consumeMemoryBucket(buckets, 'bucket', 2, 60, 2_000)
  const third = consumeMemoryBucket(buckets, 'bucket', 2, 60, 3_000)
  const reset = consumeMemoryBucket(buckets, 'bucket', 2, 60, 62_000)

  assert.deepEqual([first.allowed, second.allowed, third.allowed, reset.allowed], [true, true, false, true])
  assert.deepEqual([first.remaining, second.remaining, third.remaining, reset.remaining], [1, 0, 0, 1])
})

test('prunes expired in-memory buckets', () => {
  const buckets = new Map([
    ['expired', { count: 1, resetAt: 999 }],
    ['active', { count: 1, resetAt: 2_000 }],
  ])
  pruneMemoryBuckets(buckets, 1_000)
  assert.deepEqual([...buckets.keys()], ['active'])
})
