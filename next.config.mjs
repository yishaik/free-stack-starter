import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const hasSentryUploadCredentials = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
)

// Sentry instrumentation remains available when a DSN is configured. Release creation and
// source-map upload are enabled only when the full upload credential set is present, so a fresh
// clone builds quietly and does not publish source maps accidentally.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !hasSentryUploadCredentials,
  disableLogger: true,
  telemetry: false,
  widenClientFileUpload: hasSentryUploadCredentials,
  sourcemaps: {
    disable: !hasSentryUploadCredentials,
    deleteSourcemapsAfterUpload: true,
  },
})
