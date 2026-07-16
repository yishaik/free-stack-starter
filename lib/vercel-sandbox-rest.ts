const API_BASE = 'https://api.vercel.com/v2/sandboxes'

export type SandboxRunResult = {
  sandboxId: string
  commandId: string | null
  exitCode: number
  output: string
}

type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonRecord
    : null
}

function query(teamId: string) {
  return `teamId=${encodeURIComponent(teamId)}`
}

async function readError(response: Response) {
  const text = await response.text()
  try {
    const data = JSON.parse(text) as { error?: { message?: string }; message?: string }
    return data.error?.message || data.message || text || `HTTP ${response.status}`
  } catch {
    return text || `HTTP ${response.status}`
  }
}

async function requestJson(url: string, token: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(await readError(response))
  return response.json() as Promise<unknown>
}

function findCommandId(events: unknown[]) {
  for (const event of events) {
    const record = asRecord(event)
    const command = asRecord(record?.command)
    const id = command?.id ?? record?.cmdId ?? record?.commandId
    if (typeof id === 'string') return id
  }
  return null
}

function findExitCode(events: unknown[]) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const record = asRecord(events[index])
    const command = asRecord(record?.command)
    const raw = command?.exitCode ?? record?.exitCode ?? record?.code
    const parsed = typeof raw === 'number' ? raw : Number(raw)
    if (Number.isInteger(parsed)) return parsed
  }
  return 1
}

function collectLogText(events: unknown[]) {
  const lines: string[] = []

  for (const event of events) {
    const record = asRecord(event)
    if (!record) continue

    const stream = typeof record.stream === 'string' ? record.stream : null
    const data = record.data ?? record.message ?? record.output ?? record.log

    if (typeof data === 'string') {
      lines.push(stream ? `[${stream}] ${data}` : data)
      continue
    }

    const logs = Array.isArray(record.logs) ? record.logs : []
    for (const log of logs) {
      const logRecord = asRecord(log)
      const logData = logRecord?.data ?? logRecord?.message
      if (typeof logData === 'string') {
        const logStream = typeof logRecord?.stream === 'string' ? logRecord.stream : null
        lines.push(logStream ? `[${logStream}] ${logData}` : logData)
      }
    }
  }

  return lines.join('\n').trim()
}

function parseNdjson(text: string): unknown[] {
  const events: unknown[] = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try { events.push(JSON.parse(trimmed)) } catch { events.push({ data: trimmed }) }
  }
  return events
}

export function resolveVercelToken(headers: Headers) {
  return process.env.VERCEL_ACCESS_TOKEN
    || process.env.VERCEL_OIDC_TOKEN
    || headers.get('x-vercel-oidc-token')
    || null
}

export async function runVercelSandbox(input: {
  token: string
  repository: string
  gitRef: string
  command: string
}) : Promise<SandboxRunResult> {
  const teamId = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || 'team_ZKpdeShcRUJptlPmkXbqEqfI'
  const projectId = process.env.VERCEL_PROJECT_ID || 'prj_nxD9AaFfV2PfjHTlLjN2I9Vyp526'

  const created = await requestJson(`${API_BASE}?${query(teamId)}`, input.token, {
    method: 'POST',
    body: JSON.stringify({
      runtime: 'node24',
      source: {
        type: 'git',
        url: input.repository,
        revision: input.gitRef,
        depth: 1,
      },
      projectId,
      timeout: 240_000,
      persistent: false,
      tags: { purpose: 'ai-project-harness' },
    }),
  })

  const createdRecord = asRecord(created)
  const session = asRecord(createdRecord?.session) || asRecord(createdRecord?.sandbox) || createdRecord
  const sandboxId = session?.id
  if (typeof sandboxId !== 'string') throw new Error('Vercel Sandbox did not return a session ID.')

  try {
    const response = await fetch(`${API_BASE}/sessions/${encodeURIComponent(sandboxId)}/cmd?${query(teamId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: 'bash',
        args: ['-lc', input.command],
        cwd: '/vercel/sandbox',
        wait: true,
        logs: true,
        timeout: 225_000,
      }),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(await readError(response))

    const events = parseNdjson(await response.text())
    return {
      sandboxId,
      commandId: findCommandId(events),
      exitCode: findExitCode(events),
      output: collectLogText(events),
    }
  } finally {
    try {
      await requestJson(`${API_BASE}/sessions/${encodeURIComponent(sandboxId)}/stop?${query(teamId)}`, input.token, {
        method: 'POST',
      })
    } catch (error) {
      console.warn('Unable to stop Vercel Sandbox cleanly', {
        sandboxId,
        message: error instanceof Error ? error.message : 'unknown',
      })
    }
  }
}
