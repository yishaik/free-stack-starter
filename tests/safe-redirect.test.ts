import assert from 'node:assert/strict'
import test from 'node:test'
import { safeRedirectPath } from '../lib/safe-redirect'

test('accepts same-origin absolute paths', () => {
  assert.equal(safeRedirectPath('/my-stack'), '/my-stack')
  assert.equal(safeRedirectPath('/dashboard?tab=1'), '/dashboard?tab=1')
})

test('rejects protocol-relative and off-site redirects (CWE-601)', () => {
  for (const bad of ['//evil.com', '/\\evil.com', '/\\\\evil.com', 'https://evil.com', 'javascript:alert(1)', 'evil.com', '', '   ']) {
    assert.equal(safeRedirectPath(bad), '/dashboard', `should reject ${JSON.stringify(bad)}`)
  }
})

test('rejects non-string input and honors a custom fallback', () => {
  assert.equal(safeRedirectPath(undefined), '/dashboard')
  assert.equal(safeRedirectPath(null), '/dashboard')
  assert.equal(safeRedirectPath(123), '/dashboard')
  assert.equal(safeRedirectPath('//evil.com', '/'), '/')
})
