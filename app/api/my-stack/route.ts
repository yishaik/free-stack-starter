import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { MAX_STACK_SERVICES, normalizeServiceIds } from '@/lib/my-stack-core'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 16_384

type StackRecord = { id: string; name: string }

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function allowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const allowed = new Set([request.nextUrl.origin])
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) {
    try { allowed.add(new URL(configured).origin) } catch { /* invalid deployment config */ }
  }
  return allowed.has(origin)
}

function json(requestId: string, body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Request-ID': requestId,
    },
  })
}

async function authenticated(requestId: string) {
  if (!hasSupabaseConfig()) return { response: json(requestId, { error: 'Account sync is not configured.' }, 503) }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return { response: json(requestId, { error: 'Sign in to sync My Stack.' }, 401) }
  return { supabase, user: data.user }
}

async function getOrCreateDefaultStack(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<StackRecord> {
  const existing = await supabase
    .from('user_stacks')
    .select('id,name')
    .eq('user_id', userId)
    .eq('is_default', true)
    .maybeSingle()

  if (existing.data) return existing.data as StackRecord
  if (existing.error && existing.error.code !== 'PGRST116') throw existing.error

  const created = await supabase
    .from('user_stacks')
    .insert({ user_id: userId, name: 'My Stack', is_default: true })
    .select('id,name')
    .single()

  if (created.data) return created.data as StackRecord

  // A concurrent request may have created the partial-unique default stack first.
  if (created.error?.code === '23505') {
    const concurrent = await supabase
      .from('user_stacks')
      .select('id,name')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single()
    if (concurrent.data) return concurrent.data as StackRecord
  }

  throw created.error || new Error('Unable to create the default stack.')
}

async function readServiceIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stackId: string,
) {
  const { data, error } = await supabase
    .from('stack_services')
    .select('service_id')
    .eq('stack_id', stackId)
    .order('added_at', { ascending: true })

  if (error) throw error
  return normalizeServiceIds((data || []).map((row) => row.service_id))
}

async function parseJson(request: NextRequest, requestId: string) {
  if (!allowedOrigin(request)) return { response: json(requestId, { error: 'Request origin is not allowed.' }, 403) }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return { response: json(requestId, { error: 'Content-Type must be application/json.' }, 415) }
  }
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (!Number.isFinite(contentLength) || contentLength > MAX_BODY_BYTES) {
    return { response: json(requestId, { error: 'Request is too large.' }, 413) }
  }
  try {
    return { body: await request.json() as unknown }
  } catch {
    return { response: json(requestId, { error: 'Invalid JSON body.' }, 400) }
  }
}

export async function GET() {
  const requestId = randomUUID()
  const auth = await authenticated(requestId)
  if ('response' in auth) return auth.response

  try {
    const stack = await getOrCreateDefaultStack(auth.supabase, auth.user.id)
    const serviceIds = await readServiceIds(auth.supabase, stack.id)
    return json(requestId, { stack, serviceIds, mode: 'account' })
  } catch (error) {
    console.error('My Stack read failed', { requestId, message: error instanceof Error ? error.message : 'unknown' })
    return json(requestId, { error: 'My Stack database schema is unavailable. Run supabase/schema.sql.' }, 503)
  }
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const parsed = await parseJson(request, requestId)
  if ('response' in parsed) return parsed.response

  const body = parsed.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(requestId, { error: 'Invalid request.' }, 400)
  }

  const raw = body as { serviceId?: unknown; serviceIds?: unknown }
  const requested = raw.serviceIds !== undefined
    ? normalizeServiceIds(raw.serviceIds)
    : normalizeServiceIds([raw.serviceId])

  if (!requested.length || requested.length > MAX_STACK_SERVICES) {
    return json(requestId, { error: 'No valid services were provided.' }, 400)
  }

  const auth = await authenticated(requestId)
  if ('response' in auth) return auth.response

  try {
    const stack = await getOrCreateDefaultStack(auth.supabase, auth.user.id)
    const rows = requested.map((serviceId) => ({ stack_id: stack.id, service_id: serviceId }))
    const { error } = await auth.supabase
      .from('stack_services')
      .upsert(rows, { onConflict: 'stack_id,service_id', ignoreDuplicates: true })
    if (error) throw error

    const serviceIds = await readServiceIds(auth.supabase, stack.id)
    return json(requestId, { stack, serviceIds, mode: 'account' })
  } catch (error) {
    console.error('My Stack update failed', { requestId, message: error instanceof Error ? error.message : 'unknown' })
    return json(requestId, { error: 'Unable to update My Stack.' }, 503)
  }
}

export async function DELETE(request: NextRequest) {
  const requestId = randomUUID()
  const parsed = await parseJson(request, requestId)
  if ('response' in parsed) return parsed.response

  const body = parsed.body
  const serviceId = body && typeof body === 'object' && !Array.isArray(body)
    ? normalizeServiceIds([(body as { serviceId?: unknown }).serviceId])[0]
    : undefined
  if (!serviceId) return json(requestId, { error: 'A valid serviceId is required.' }, 400)

  const auth = await authenticated(requestId)
  if ('response' in auth) return auth.response

  try {
    const stack = await getOrCreateDefaultStack(auth.supabase, auth.user.id)
    const { error } = await auth.supabase
      .from('stack_services')
      .delete()
      .eq('stack_id', stack.id)
      .eq('service_id', serviceId)
    if (error) throw error

    const serviceIds = await readServiceIds(auth.supabase, stack.id)
    return json(requestId, { stack, serviceIds, mode: 'account' })
  } catch (error) {
    console.error('My Stack delete failed', { requestId, message: error instanceof Error ? error.message : 'unknown' })
    return json(requestId, { error: 'Unable to update My Stack.' }, 503)
  }
}
