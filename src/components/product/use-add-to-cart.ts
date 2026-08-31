'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { addToCartAction } from '@/lib/cart/actions'
import { CART_CHANGED_EVENT } from '@/lib/cart/events'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createAddToCartEvent } from '@/lib/analytics/events'

export type AddToCart = (
  variantId: string,
  quantity: number,
) => Promise<unknown>

type UseAddToCartOptions = {
  addToCart?: AddToCart
  getErrorMessage?: (error: unknown) => string
  getSuccessMessage?: (quantity: number) => string
  onCartChanged?: () => void
}

const DEFAULT_ERROR = 'Unable to add to cart. Please try again.'

export function useAddToCart({
  addToCart = addToCartAction,
  getErrorMessage = () => DEFAULT_ERROR,
  getSuccessMessage = (quantity) => `${quantity} added to cart`,
  onCartChanged,
}: UseAddToCartOptions = {}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function resetFeedback() {
    setMessage(null)
    setError(null)
  }

  function reportError(nextError: string) {
    setMessage(null)
    setError(nextError)
  }

  function addItem(variantId: string, quantity: number) {
    setMessage(null)
    setError(null)
    setIsPending(true)

    void (async () => {
      try {
        await addToCart(variantId, quantity)
        setMessage(getSuccessMessage(quantity))
        setError(null)
        if (onCartChanged) {
          onCartChanged()
        } else {
          router.refresh()
        }
        window.dispatchEvent(new Event(CART_CHANGED_EVENT))
        void dispatchClientAnalyticsEvent(
          createAddToCartEvent({
            quantity,
            variantId,
          }),
        )
      } catch (addError) {
        setMessage(null)
        setError(getErrorMessage(addError))
      } finally {
        setIsPending(false)
      }
    })()
  }

  return {
    addItem,
    error,
    isPending,
    message,
    reportError,
    resetFeedback,
  }
}
