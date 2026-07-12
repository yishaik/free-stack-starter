'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <p className="text-sm uppercase tracking-wide text-muted">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-bold">The page could not be loaded.</h1>
      <p className="mt-3 text-muted">The error was recorded. Try the request again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 w-fit rounded-lg bg-accent px-4 py-2 font-semibold text-[#06111a]"
      >
        Try again
      </button>
    </main>
  )
}
