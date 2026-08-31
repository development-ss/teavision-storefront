import { Skeleton } from '@/components/ui/skeleton'

import { CartLoadingCheckoutForm } from './loading-checkout-form'
import { CartLoadingHeader } from './loading-header'
import { CartLoadingLine } from './loading-line'
import { CartLoadingSummary } from './loading-summary'

const CART_LOADING_LINES = ['first', 'second'] as const

export function CartLoadingSkeleton() {
  return (
    <div
      className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-10"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading cart</span>

      <div className="min-w-0">
        <CartLoadingHeader />

        <ul className="divide-hairline space-y-0 divide-y" aria-hidden="true">
          {CART_LOADING_LINES.map((line) => (
            <CartLoadingLine key={line} />
          ))}
        </ul>

        <Skeleton
          className="bg-brand-tint mt-6 h-18 rounded-md sm:h-12 xl:h-9"
          data-skeleton="packaging-note"
        />

        <CartLoadingCheckoutForm />
      </div>

      <CartLoadingSummary />
    </div>
  )
}
