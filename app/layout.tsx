import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Free Stack Starter',
  description: 'A $0 side-project starter: Next.js + Supabase + Resend + Sentry + Cloudflare R2.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
