import { Skeleton } from '@/components/ui'

export default function AccountLoading() {
  return (
    <div
      className="grid min-h-136 gap-8 md:min-h-128 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-10"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading account</span>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-72 max-w-full" />
        </div>
        <div className="bg-card border-hairline rounded-lg border p-6">
          <Skeleton className="h-7 w-40" />
          <div className="mt-5 grid gap-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </div>
      <aside className="grid gap-5">
        <div className="bg-card border-hairline h-44 rounded-lg border p-6">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-3/4" />
        </div>
        <div className="bg-card border-hairline h-52 rounded-lg border p-6">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-5 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-5/6" />
          <Skeleton className="mt-3 h-4 w-2/3" />
        </div>
      </aside>
    </div>
  )
}
