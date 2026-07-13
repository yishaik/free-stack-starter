import type { Metadata } from 'next'
import './globals.css'

const themeScript = `(() => {
  try {
    const stored = localStorage.getItem('theme') || 'system'
    const dark = stored === 'dark' || (stored === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = stored
  } catch {}
})()`

export const metadata: Metadata = {
  title: {
    default: 'Free Stack Directory',
    template: '%s · Free Stack Directory',
  },
  description: 'A curated directory of free and open-source tools for developers, DevOps, IT, design, data, productivity and business operations — built as a real $0 stack example.',
  metadataBase: new URL('https://free-stack-starter.vercel.app'),
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Free Stack Directory',
    description: 'Discover free and open-source services, safely test credentials, and connect agents through official provider tooling.',
    type: 'website',
    siteName: 'Free Stack Directory',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Stack Directory',
    description: 'Free tools for development, DevOps, IT, productivity, design and operations.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
