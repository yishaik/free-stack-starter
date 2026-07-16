import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { hasHarnessAccess } from '@/lib/harness-auth'
import {
  commandForMode,
  normalizeGitRef,
  normalizeMode,
  normalizeRepository,
  normalizeTask,
  truncateOutput,
} from '@/lib/harness-core'
import { summarizeHarnessRun } from '@/lib/harness-ai'
import { resolveVercelToken, runVercelSandbox } from '@/lib/vercel-sandbox-rest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_BODY_BYTES = 16_384

type HarnessStatus = 'running' | 'succeeded' | 'failed'

type HarnessRun = {
  id: string
  repository: string
  git_ref: string
  mode: 'inspect' | 'test' | 'build'
  task: string
  status: HarnessStatus
  exit_code: number | null
  output: string | null
  ai_summary: string | null
  sandbox_id: string | null
  created_at: string
  started_at: string
  finished_at: string | null
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

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const accessKey = process.env.HARNESS_ACCESS_KEY

  if (!accessKey || accessKey.length < 24) {
    return json(requestId, { error: 'Harness access is not configured. Set HARNESS_ACCESS_KEY in Vercel.' }, 503)
  }
  if (!hasHarnessAccess(accessKey, request.headers.get('authorization'))) {
    return json(requestId, { error: 'The harness access key is invalid.' }, 401)
  }

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

  const token = resolveVercelToken(request.headers)
  if (!token) {
    return json(requestId, { error: 'Vercel Sandbox authentication is unavailable. Deploy on Vercel with OIDC or configure VERCEL_ACCESS_TOKEN.' }, 503)
  }

  const id = randomUUID()
  const startedAt = new Date().toISOString()
  const baseRun: HarnessRun = {
    id,
    repository,
    git_ref: gitRef,
    mode,
    task,
    status: 'running',
    exit_code: null,
    output: null,
    ai_summary: null,
    sandbox_id: null,
    created_at: startedAt,
    started_at: startedAt,
    finished_at: null,
  }

  try {
    const result = await runVercelSandbox({ token, repository, gitRef, command: commandForMode(mode) })
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
    const run: HarnessRun = {
      ...baseRun,
      status,
      exit_code: result.exitCode,
      output,
      ai_summary: aiSummary,
      sandbox_id: result.sandboxId,
      finished_at: new Date().toISOString(),
    }

    return json(requestId, { run }, status === 'succeeded' ? 200 : 422)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown harness failure.'
    const run: HarnessRun = {
      ...baseRun,
      status: 'failed',
      exit_code: 1,
      output: truncateOutput(message),
      ai_summary: `The harness could not complete the ${mode} run. ${message}`.slice(0, 4_000),
      finished_at: new Date().toISOString(),
    }

    console.error('Harness run failed', { requestId, runId: id, message })
    return json(requestId, { error: message, run }, 502)
  }
}
