'use client'

import { useActionState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createCartUpdateEvent } from '@/lib/analytics/events'
import { cartLineFormAction, type CartLineFormState } from '@/lib/cart/actions'
import { CART_CHANGED_EVENT } from '@/lib/cart/events'

const INITIAL_CART_LINE_FORM_STATE: CartLineFormState = {
  message: null,
}

type CartLineRemoveProps = {
  lineId: string
  productTitle: string
  action?: typeof cartLineFormAction
}

export function CartLineRemove({
  lineId,
  productTitle,
  action = cartLineFormAction,
}: CartLineRemoveProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_CART_LINE_FORM_STATE,
  )

  useEffect(() => {
    if (!state.cartChanged) return

    window.dispatchEvent(new Event(CART_CHANGED_EVENT))
    void dispatchClientAnalyticsEvent(
      createCartUpdateEvent({
        action: 'remove',
      }),
    )
  }, [state.cartChanged])

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="intent" value="remove" />
      <input type="hidden" name="lineId" value={lineId} />
      <Button
        variant="quiet"
        size="quiet"
        type="submit"
        disabled={isPending}
        isLoading={isPending}
        aria-label={`Remove ${productTitle} from cart`}
      >
        Remove
      </Button>
      {state.message ? (
        <p className="type-caption text-danger" role="alert">
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
