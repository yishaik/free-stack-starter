import assert from 'node:assert/strict'
import test from 'node:test'
import { authCallbackUrl, deployedBaseUrl } from '../lib/site-url'

test('uses the configured production origin for the email link', () => {
  const env = { NEXT_PUBLIC_SITE_URL: 'https://free-stack-starter.vercel.app' }
  assert.equal(deployedBaseUrl(env), 'https://free-stack-starter.vercel.app')
  assert.equal(
    authCallbackUrl('/my-stack', env),
    'https://free-stack-starter.vercel.app/auth/callback?next=%2Fmy-stack',
  )
})

test('falls back to Vercel-provided origins', () => {
  assert.equal(
    deployedBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'app.example.com' }),
    'https://app.example.com',
  )
  assert.equal(
    deployedBaseUrl({ VERCEL_URL: 'preview-abc.vercel.app' }),
    'https://preview-abc.vercel.app',
  )
})

test('returns null for local dev so the override applies only to deployed envs', () => {
  assert.equal(deployedBaseUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' }), null)
  assert.equal(deployedBaseUrl({ NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3000' }), null)
  assert.equal(deployedBaseUrl({}), null)
  assert.equal(deployedBaseUrl({ NEXT_PUBLIC_SITE_URL: 'not a url' }), null)
  assert.equal(authCallbackUrl('/my-stack', { NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' }), null)
})
