'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Free Stack Directory render error', { message: error.message, digest: error.digest })
  }, [error])

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-5 py-16 text-center">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-xl">
        <div className="font-mono text-sm text-accent">ERROR</div>
        <h1 className="mt-3 text-2xl font-bold text-ink">The directory could not be displayed</h1>
        <p className="mt-3 text-sm leading-6 text-muted">No credentials were stored. Retry the page; if the problem continues, report the error digest on GitHub.</p>
        {error.digest && <p className="mt-3 font-mono text-xs text-muted">Digest: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-[#06111a]">Try again</button>
          <a href="https://github.com/yishaik/free-stack-starter/issues" className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent">Report issue ↗</a>
        </div>
      </div>
    </main>
  )
}
