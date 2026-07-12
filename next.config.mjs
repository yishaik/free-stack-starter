import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

// Sentry wraps the Next config to upload source maps at build (when SENTRY_AUTH_TOKEN
// is set) and instrument the app. It's a no-op without a DSN, so the template runs
// fine before you add Sentry.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  // only attempt source-map upload when a token is present
  authToken: process.env.SENTRY_AUTH_TOKEN,
})
