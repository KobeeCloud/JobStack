export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="h-4 w-96 animate-pulse rounded bg-muted" />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-5 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
