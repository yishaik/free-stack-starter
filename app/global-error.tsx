'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="grid min-h-screen place-items-center bg-[#0b0f17] px-5 text-[#e8eef7]">
        <main className="w-full max-w-xl rounded-2xl border border-[#1f2a3a] bg-[#111827] p-8 text-center shadow-2xl">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#22d3ee]">Application error</div>
          <h1 className="mt-3 text-2xl font-bold">Free Stack Directory could not start</h1>
          <p className="mt-3 text-sm leading-6 text-[#93a7c4]">
            The failure was reported without including provider credentials. Retry the application or open the repository issue tracker if it continues.
          </p>
          {error.digest && <p className="mt-3 font-mono text-xs text-[#93a7c4]">Digest: {error.digest}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="rounded-xl bg-[#22d3ee] px-5 py-2.5 text-sm font-bold text-[#06111a]">Try again</button>
            <a href="https://github.com/yishaik/free-stack-starter/issues" className="rounded-xl border border-[#1f2a3a] px-5 py-2.5 text-sm font-semibold hover:border-[#22d3ee]">Report issue ↗</a>
          </div>
        </main>
      </body>
    </html>
  )
}
