import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Free Stack Directory',
    template: '%s · Free Stack Directory',
  },
  description: 'Discover hundreds of free developer and design services, safely test credentials, and connect coding agents through official provider tooling.',
  metadataBase: new URL('https://free-stack-starter.vercel.app'),
  openGraph: {
    title: 'Free Stack Directory',
    description: 'Free services for developers and designers, secure credential checks, and copyable agent-access setup prompts.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
