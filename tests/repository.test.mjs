import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8')
}

test('default environment does not request the Supabase service role key', async () => {
  assert.doesNotMatch(await text('.env.example'), /SUPABASE_SERVICE_ROLE_KEY/)
})

test('Next 16 proxy is present and legacy middleware is not referenced by docs', async () => {
  assert.match(await text('proxy.ts'), /export async function proxy/)
  assert.doesNotMatch(await text('README.md'), /middleware\.ts/)
})

test('upload policy includes size and MIME validation', async () => {
  const uploads = await text('lib/uploads.ts')
  assert.match(uploads, /UPLOAD_MAX_BYTES/)
  assert.match(uploads, /ALLOWED_UPLOAD_TYPES/)
  assert.match(uploads, /crypto\.randomUUID/)
})

test('security headers disable framing and MIME sniffing', async () => {
  const config = await text('next.config.mjs')
  assert.match(config, /X-Frame-Options/)
  assert.match(config, /X-Content-Type-Options/)
})
