import type { Metadata } from 'next'
import { KeyTester } from '@/components/KeyTester'
import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'API Key Tester · Free Stack Directory',
  description: 'Safely validate API keys and credential setup for free developer and design services.',
}

export default async function TestKeysPage({ searchParams }: {
  searchParams: Promise<{ service?: string | string[] }>
}) {
  const params = await searchParams
  const service = Array.isArray(params.service) ? params.service[0] : params.service

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Safe setup utility</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">API key and credential tester</h1>
          <p className="mt-3 text-base leading-7 text-muted">
            Select any catalog service. Common APIs get a live, read-only validation request; other providers get a structured credential checklist or a no-key setup guide.
          </p>
        </div>
        <KeyTester initialServiceId={service} />
      </main>
    </>
  )
}
