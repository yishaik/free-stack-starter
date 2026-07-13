export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-panel" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-panel" />
      <div className="mt-10 h-28 animate-pulse rounded-2xl border border-line bg-panel/70" />
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="h-[430px] animate-pulse rounded-2xl border border-line bg-panel/70" />
        ))}
      </div>
    </main>
  )
}
