import Link from 'next/link'

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-mono text-sm font-black text-[#06111a]">$0</span>
          <span>Free Stack Directory</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/" className="rounded-lg px-3 py-2 text-muted hover:bg-panel hover:text-ink">Services</Link>
          <Link href="/test-keys" className="rounded-lg px-3 py-2 text-muted hover:bg-panel hover:text-ink">API key tester</Link>
          <a href="https://github.com/yishaik/free-stack-starter" target="_blank" rel="noreferrer" className="rounded-lg border border-line px-3 py-2 hover:border-accent">GitHub ↗</a>
        </nav>
      </div>
    </header>
  )
}
