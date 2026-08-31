'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 lg:px-8">
      <div className="bg-card border-hairline max-w-xl rounded-lg border p-6 sm:p-8">
        <h1 className="type-heading-03 font-display text-ink">
          We could not load your cart
        </h1>
        <p className="type-body-sm text-ink-soft mt-3">
          Your cart is still safe with Shopify. Try loading it again, or
          continue shopping while the storefront reconnects.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={reset} variant="brand">
            Try again
          </Button>
          <Button href="/collections/all" variant="secondary">
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
