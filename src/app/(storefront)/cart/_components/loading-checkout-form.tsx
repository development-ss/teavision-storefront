import { Skeleton } from '@/components/ui/skeleton'

export function CartLoadingCheckoutForm() {
  return (
    <div className="mt-8 space-y-4" aria-label="Loading checkout form">
      <Skeleton
        className="border-hairline h-28 rounded-sm border"
        data-skeleton="checkout-note"
      />
      <div className="flex items-start gap-2.5" data-skeleton="terms">
        <Skeleton className="mt-0.5 size-5" />
        <Skeleton className="h-12 w-72 max-w-full sm:h-5" />
      </div>
      <div className="grid grid-cols-2 gap-3" data-skeleton="checkout-actions">
        <Skeleton className="h-12 rounded-full" />
        <Skeleton className="h-12 rounded-full" />
      </div>
    </div>
  )
}
