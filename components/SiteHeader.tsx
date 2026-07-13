import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold text-ink">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent font-mono text-sm font-black text-[#06111a]">$0</span>
          <span className="truncate">Free Stack <span className="hidden sm:inline">Directory</span></span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-0.5 text-sm sm:gap-1" aria-label="Primary navigation">
            <Link href="/#directory" className="rounded-lg px-2.5 py-2 text-muted hover:bg-panel hover:text-ink sm:px-3">Services</Link>
            <Link href="/docs" className="rounded-lg px-2.5 py-2 text-muted hover:bg-panel hover:text-ink sm:px-3">Docs</Link>
            <Link href="/test-keys" className="rounded-lg px-2.5 py-2 text-muted hover:bg-panel hover:text-ink sm:px-3"><span className="hidden sm:inline">API key </span>Tester</Link>
            <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="hidden rounded-lg border border-line px-3 py-2 text-ink hover:border-accent md:inline-flex">GitHub ↗</a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
