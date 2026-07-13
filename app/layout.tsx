import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Free Stack Directory',
    template: '%s · Free Stack Directory',
  },
  description: 'A comprehensive directory of free developer services, design tools, APIs and open-source building blocks, with a secure API-key tester.',
  metadataBase: new URL('https://free-stack-starter.vercel.app'),
  openGraph: {
    title: 'Free Stack Directory',
    description: 'Hundreds of free services for developers and designers, plus a secure API-key tester.',
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
