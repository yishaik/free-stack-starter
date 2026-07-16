'use client'

import { FormEvent, useEffect, useState } from 'react'

type HarnessRun = {
  id: string
  repository: string
  git_ref: string
  mode: 'inspect' | 'test' | 'build'
  task: string
  status: 'running' | 'succeeded' | 'failed'
  exit_code: number | null
  output: string | null
  ai_summary: string | null
  sandbox_id: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
}

const HISTORY_KEY = 'free-stack:harness-runs:v1'
const ACCESS_KEY = 'free-stack:harness-access-key:v1'
const MAX_LOCAL_RUNS = 20

function repositoryLabel(repository: string) {
  return repository.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
}

function statusClass(status: HarnessRun['status']) {
  if (status === 'succeeded') return 'border-accent/50 bg-accent/10 text-accent'
  if (status === 'failed') return 'border-red-400/40 bg-red-400/10 text-red-300'
  return 'border-amber-400/40 bg-amber-400/10 text-amber-200'
}

function readLocalRuns(): HarnessRun[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as unknown
    return Array.isArray(parsed) ? parsed.slice(0, MAX_LOCAL_RUNS) as HarnessRun[] : []
  } catch {
    return []
  }
}

function writeLocalRuns(runs: HarnessRun[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(runs.slice(0, MAX_LOCAL_RUNS)))
}

export function HarnessView() {
  const [accessKey, setAccessKey] = useState('')
  const [repository, setRepository] = useState('https://github.com/yishaik/free-stack-starter')
  const [gitRef, setGitRef] = useState('main')
  const [mode, setMode] = useState<HarnessRun['mode']>('inspect')
  const [task, setTask] = useState('Inspect the project and identify the most important next improvement.')
  const [runs, setRuns] = useState<HarnessRun[]>([])
  const [selected, setSelected] = useState<HarnessRun | null>(null)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const localRuns = readLocalRuns()
    setRuns(localRuns)
    setSelected(localRuns[0] || null)
    setAccessKey(sessionStorage.getItem(ACCESS_KEY) || '')
    setHistoryLoading(false)
  }, [])

  function rememberRun(run: HarnessRun) {
    setSelected(run)
    setRuns((current) => {
      const next = [run, ...current.filter((item) => item.id !== run.id)].slice(0, MAX_LOCAL_RUNS)
      writeLocalRuns(next)
      return next
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (accessKey.length < 24) {
      setError('Enter the private harness access key configured in Vercel.')
      return
    }

    setLoading(true)
    sessionStorage.setItem(ACCESS_KEY, accessKey)

    try {
      const response = await fetch('/api/harness/runs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repository, gitRef, mode, task }),
      })
      const data = await response.json() as { run?: HarnessRun; error?: string }
      if (data.run) rememberRun(data.run)
      if (!response.ok) throw new Error(data.error || data.run?.ai_summary || 'The harness run failed.')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The harness run failed.')
    } finally {
      setLoading(false)
    }
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
    setRuns([])
    setSelected(null)
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <section className="rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Run a project</h2>
            <p className="mt-1 text-sm leading-6 text-muted">Public GitHub repositories only. Commands are fixed by mode and execute in an isolated Vercel Sandbox.</p>
          </div>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">OIDC</span>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-ink">Private access key</span>
            <input
              type="password"
              required
              minLength={24}
              value={accessKey}
              onChange={(event) => setAccessKey(event.target.value)}
              autoComplete="off"
              placeholder="HARNESS_ACCESS_KEY"
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <span className="mt-2 block text-xs leading-5 text-muted">Kept only in this browser tab. It is never written to local history.</span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-ink">GitHub repository</span>
            <input
              type="url"
              required
              value={repository}
              onChange={(event) => setRepository(event.target.value)}
              placeholder="https://github.com/owner/repository"
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Git ref</span>
              <input
                value={gitRef}
                onChange={(event) => setGitRef(event.target.value)}
                className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 font-mono text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-ink">Run mode</span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as HarnessRun['mode'])}
                className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                <option value="inspect">Inspect</option>
                <option value="test">Install + test</option>
                <option value="build">Install + build</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-ink">What should the AI focus on?</span>
            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              rows={4}
              maxLength={2000}
              className="mt-2 w-full resize-y rounded-xl border border-line bg-bg px-4 py-3 text-sm leading-6 text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>

          {error ? (
            <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 font-bold text-[#06111a] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? 'Running in isolated sandbox…' : `Run ${mode}`}
          </button>
        </form>
      </section>

      <section className="min-w-0 rounded-2xl border border-line bg-panel p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">Run result</h2>
            <p className="mt-1 text-sm text-muted">AI analysis and raw output, with the last 20 runs stored only in this browser.</p>
          </div>
          <button type="button" onClick={clearHistory} disabled={!runs.length} className="rounded-lg border border-line px-3 py-2 text-sm text-muted hover:border-accent hover:text-ink disabled:opacity-40">Clear</button>
        </div>

        {selected ? (
          <div className="mt-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(selected.status)}`}>{selected.status}</span>
              <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">{selected.mode}</span>
              <span className="font-mono text-xs text-muted">{repositoryLabel(selected.repository)}@{selected.git_ref}</span>
            </div>

            <div className="rounded-xl border border-line bg-bg p-4">
              <h3 className="font-semibold text-ink">AI analysis</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{selected.ai_summary || 'The analysis will appear after execution.'}</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-ink">Execution output</h3>
                <span className="font-mono text-xs text-muted">exit {selected.exit_code ?? '—'}</span>
              </div>
              <pre className="mt-2 max-h-[34rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-line bg-[#071018] p-4 font-mono text-xs leading-5 text-slate-200">{selected.output || 'No output captured yet.'}</pre>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-line px-5 py-12 text-center text-sm text-muted">
            {historyLoading ? 'Loading local run history…' : 'Run a repository to see its result here.'}
          </div>
        )}

        {runs.length ? (
          <div className="mt-7 border-t border-line pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Recent local runs</h3>
            <div className="mt-3 space-y-2">
              {runs.slice(0, 8).map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => setSelected(run)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-3 text-left hover:border-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{repositoryLabel(run.repository)}</span>
                    <span className="mt-1 block font-mono text-xs text-muted">{run.mode} · {new Date(run.created_at).toLocaleString()}</span>
                  </span>
                  <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${statusClass(run.status)}`}>{run.status}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
