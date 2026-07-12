import * as Sentry from '@sentry/nextjs'

// Client-side Sentry. No-op when NEXT_PUBLIC_SENTRY_DSN is unset, so the template
// runs without Sentry configured.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
})
