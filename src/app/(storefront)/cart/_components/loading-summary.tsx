import { Skeleton } from '@/components/ui/skeleton'

const CART_LOADING_TRUST_SIGNALS = [
  'businesses-served',
  'organic-certified',
  'haccp-certified',
  'global-sourcing',
] as const

export function CartLoadingSummary() {
  return (
    <aside
      aria-label="Loading order summary"
      className="bg-card border-hairline rounded-lg border-t p-6 xl:sticky xl:top-24"
    >
      <Skeleton className="h-8 w-40" />
      <div className="border-hairline mt-5 space-y-3 border-t pt-5">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-14" />
        </div>
        <div className="flex justify-between gap-4">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-20" />
        </div>
      </div>
      <div className="border-hairline mt-4 space-y-2.5 border-t pt-4">
        {CART_LOADING_TRUST_SIGNALS.map((signal) => (
          <div key={signal} className="flex items-start gap-2">
            <Skeleton className="mt-0.5 size-4 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </aside>
  )
}
