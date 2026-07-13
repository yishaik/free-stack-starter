'use client'

import { useState } from 'react'
import { buildAgentAccessPrompt, type AgentAccessService } from '@/lib/agent-access'

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export function AgentAccessBox({ service }: { service: AgentAccessService }) {
  const [copied, setCopied] = useState(false)
  const prompt = buildAgentAccessPrompt(service)

  async function copyPrompt() {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(prompt)
      else fallbackCopy(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      fallbackCopy(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <details className="group/agent">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-ink marker:hidden hover:text-accent">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="font-mono text-accent">&gt;_</span>
          Give an agent access
        </span>
        <span aria-hidden className="text-muted transition group-open/agent:rotate-180">⌄</span>
      </summary>
      <div className="mt-3 rounded-xl border border-line bg-bg p-3">
        <p className="mb-2 text-[11px] leading-5 text-muted">
          Copy this prompt into your coding agent. It requires official provider tooling and least-privileged credentials.
        </p>
        <textarea
          readOnly
          value={prompt}
          rows={8}
          aria-label={`Agent access instructions for ${service.name}`}
          className="w-full resize-y rounded-lg border border-line bg-panel p-3 font-mono text-[11px] leading-5 text-ink outline-none focus:border-accent"
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          onClick={copyPrompt}
          className="mt-2 w-full rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent hover:bg-accent/15"
        >
          {copied ? 'Copied ✓' : 'Copy agent setup prompt'}
        </button>
      </div>
    </details>
  )
}
