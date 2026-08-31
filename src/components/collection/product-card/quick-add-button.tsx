'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useAddToCart } from '@/components/product/use-add-to-cart'

type QuickAddButtonProps = {
  productTitle: string
  variantId: string
}

// Quick-add for single-variant products — the interactive leaf of ProductCard,
// kept client-only so the card shell stays server-rendered in collection grids.
export function QuickAddButton({
  productTitle,
  variantId,
}: QuickAddButtonProps) {
  const { addItem, error, isPending, message, resetFeedback } = useAddToCart()
  const justAdded = !!message && !isPending

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(resetFeedback, 2500)
    return () => clearTimeout(timer)
  }, [message, resetFeedback])

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => addItem(variantId, 1)}
        disabled={isPending || justAdded}
        isLoading={isPending}
        className="w-full"
        aria-label={
          justAdded ? `${productTitle} added` : `Add ${productTitle} to cart`
        }
      >
        {justAdded ? 'Added' : 'Add to cart'}
      </Button>
      <p role="status" className="sr-only">
        {justAdded ? message : ''}
      </p>
      {error && (
        <p role="alert" className="type-body-sm text-danger sr-only">
          {error}
        </p>
      )}
    </>
  )
}
