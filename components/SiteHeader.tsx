import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold text-ink sm:gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent font-mono text-sm font-black text-[#06111a]">$0</span>
          <span className="hidden truncate sm:inline">Free Stack <span className="hidden lg:inline">Directory</span></span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-0.5 text-sm sm:gap-1" aria-label="Primary navigation">
            <Link href="/#directory" className="rounded-lg px-2 py-2 text-muted hover:bg-panel hover:text-ink sm:px-3">Services</Link>
            <Link href="/my-stack" className="rounded-lg px-2 py-2 font-medium text-ink hover:bg-panel hover:text-accent sm:px-3">My Stack</Link>
            <Link href="/docs" className="hidden rounded-lg px-3 py-2 text-muted hover:bg-panel hover:text-ink md:inline-flex">Docs</Link>
            <Link href="/test-keys" className="rounded-lg px-2 py-2 text-muted hover:bg-panel hover:text-ink sm:px-3"><span className="hidden lg:inline">API key </span>Tester</Link>
            <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="hidden rounded-lg border border-line px-3 py-2 text-ink hover:border-accent xl:inline-flex">GitHub ↗</a>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
