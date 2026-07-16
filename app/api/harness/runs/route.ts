import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  commandForMode,
  normalizeGitRef,
  normalizeMode,
  normalizeRepository,
  normalizeTask,
  truncateOutput,
} from '@/lib/harness-core'
import { summarizeHarnessRun } from '@/lib/harness-ai'
import { createClient } from '@/lib/supabase/server'
import { resolveVercelToken, runVercelSandbox } from '@/lib/vercel-sandbox-rest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_BODY_BYTES = 16_384

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

async function authenticated(requestId: string) {
  if (!hasSupabaseConfig()) {
    return { response: json(requestId, { error: 'Supabase authentication is not configured.' }, 503) }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    return { response: json(requestId, { error: 'Sign in before running projects.' }, 401) }
  }

  return { supabase, user: data.user }
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

  const { data, error } = await auth.supabase
    .from('harness_runs')
    .select('id,repository,git_ref,mode,task,status,exit_code,output,ai_summary,sandbox_id,created_at,started_at,finished_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Harness history read failed', { requestId, message: error.message })
    return json(requestId, { error: 'Harness database schema is unavailable.' }, 503)
  }

  return json(requestId, { runs: data || [] })
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const parsed = await parseJson(request, requestId)
  if ('response' in parsed) return parsed.response

  const body = parsed.body
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json(requestId, { error: 'Invalid request.' }, 400)
  }

  const raw = body as Record<string, unknown>
  const repository = normalizeRepository(raw.repository)
  const gitRef = normalizeGitRef(raw.gitRef)
  const mode = normalizeMode(raw.mode)
  const task = normalizeTask(raw.task)

  if (!repository) return json(requestId, { error: 'Provide a public HTTPS GitHub repository URL.' }, 400)
  if (!gitRef) return json(requestId, { error: 'The Git ref is invalid.' }, 400)
  if (!mode) return json(requestId, { error: 'Mode must be inspect, test, or build.' }, 400)

  const auth = await authenticated(requestId)
  if ('response' in auth) return auth.response

  const token = resolveVercelToken(request.headers)
  if (!token) {
    return json(requestId, { error: 'Vercel Sandbox authentication is unavailable. Deploy on Vercel with OIDC or configure VERCEL_ACCESS_TOKEN.' }, 503)
  }

  const command = commandForMode(mode)
  const inserted = await auth.supabase
    .from('harness_runs')
    .insert({
      user_id: auth.user.id,
      repository,
      git_ref: gitRef,
      mode,
      task,
      command,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (inserted.error || !inserted.data) {
    console.error('Harness run insert failed', { requestId, message: inserted.error?.message })
    return json(requestId, { error: 'Harness database schema is unavailable.' }, 503)
  }

  const runId = inserted.data.id as string

  try {
    const result = await runVercelSandbox({ token, repository, gitRef, command })
    const output = truncateOutput(result.output || 'Command completed without captured output.')
    const aiSummary = await summarizeHarnessRun({
      token,
      repository,
      gitRef,
      mode,
      task,
      exitCode: result.exitCode,
      output,
    })
    const status = result.exitCode === 0 ? 'succeeded' : 'failed'
    const finishedAt = new Date().toISOString()

    const updated = await auth.supabase
      .from('harness_runs')
      .update({
        status,
        exit_code: result.exitCode,
        output,
        ai_summary: aiSummary,
        sandbox_id: result.sandboxId,
        finished_at: finishedAt,
      })
      .eq('id', runId)
      .select('id,repository,git_ref,mode,task,status,exit_code,output,ai_summary,sandbox_id,created_at,started_at,finished_at')
      .single()

    if (updated.error || !updated.data) throw updated.error || new Error('Unable to persist run result.')
    return json(requestId, { run: updated.data }, status === 'succeeded' ? 200 : 422)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown harness failure.'
    const output = truncateOutput(message)
    const aiSummary = `The harness could not complete the ${mode} run. ${message}`.slice(0, 4_000)

    await auth.supabase
      .from('harness_runs')
      .update({
        status: 'failed',
        exit_code: 1,
        output,
        ai_summary: aiSummary,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId)

    console.error('Harness run failed', { requestId, runId, message })
    return json(requestId, { error: message, runId }, 502)
  }
}
