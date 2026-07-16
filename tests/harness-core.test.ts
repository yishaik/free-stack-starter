import assert from 'node:assert/strict'
import test from 'node:test'
import {
  commandForMode,
  normalizeGitRef,
  normalizeMode,
  normalizeRepository,
  normalizeTask,
  truncateOutput,
} from '../lib/harness-core'

test('accepts normalized public GitHub repository URLs', () => {
  assert.equal(
    normalizeRepository('https://github.com/yishaik/free-stack-starter'),
    'https://github.com/yishaik/free-stack-starter.git',
  )
  assert.equal(
    normalizeRepository('https://github.com/yishaik/free-stack-starter.git/'),
    'https://github.com/yishaik/free-stack-starter.git',
  )
})

test('rejects non-GitHub, credentialed, queried, and nested repository URLs', () => {
  for (const value of [
    'http://github.com/owner/repo',
    'https://gitlab.com/owner/repo',
    'https://user:token@github.com/owner/repo',
    'https://github.com/owner/repo?tab=readme',
    'https://github.com/owner/repo#readme',
    'https://github.com/owner/repo/issues',
    'https://github.com/owner',
    'not a url',
  ]) {
    assert.equal(normalizeRepository(value), null, `should reject ${value}`)
  }
})

test('validates refs and modes without accepting command input', () => {
  assert.equal(normalizeGitRef('feature/harness'), 'feature/harness')
  assert.equal(normalizeGitRef('main'), 'main')
  assert.equal(normalizeGitRef('../main'), null)
  assert.equal(normalizeGitRef('feature//unsafe'), null)
  assert.equal(normalizeMode('inspect'), 'inspect')
  assert.equal(normalizeMode('shell'), null)

  for (const mode of ['inspect', 'test', 'build'] as const) {
    const command = commandForMode(mode)
    assert.ok(command.length > 20)
    assert.ok(!command.includes('requested task'))
  }
})

test('normalizes task text and truncates stored output', () => {
  assert.equal(normalizeTask('  inspect\u0000 this  '), 'inspect  this')
  assert.equal(normalizeTask('x'.repeat(3000)).length, 2000)
  assert.match(truncateOutput('x'.repeat(100), 20), /output truncated by harness/)
})
