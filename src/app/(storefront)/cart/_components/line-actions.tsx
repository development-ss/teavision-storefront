'use client'

import { useRouter } from 'next/navigation'
import { useOptimistic, useState, useTransition } from 'react'

import { QuantityStepper } from '@/components/ui/quantity-stepper'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createCartUpdateEvent } from '@/lib/analytics/events'
import { cartLineFormAction, type CartLineFormState } from '@/lib/cart/actions'
import { CART_CHANGED_EVENT } from '@/lib/cart/events'
import { clampQuantity } from '@/lib/shopify/quantity-rules'

const INITIAL_CART_LINE_FORM_STATE: CartLineFormState = {
  message: null,
}

type CartLineActionsProps = {
  lineId: string
  maximumQuantity?: number
  minimumQuantity?: number
  productTitle: string
  quantity: number
  quantityIncrement?: number
  action?: typeof cartLineFormAction
}

export function CartLineActions({
  lineId,
  maximumQuantity,
  minimumQuantity = 1,
  productTitle,
  quantity,
  quantityIncrement = 1,
  action = cartLineFormAction,
}: CartLineActionsProps) {
  const router = useRouter()
  const [isUpdatePending, startUpdateTransition] = useTransition()

  const [stepperState, setStepperState] = useState<CartLineFormState>(
    INITIAL_CART_LINE_FORM_STATE,
  )

  const [optimisticQuantity, setOptimisticQuantity] = useOptimistic(
    quantity,
    (_current: number, next: number) => next,
  )

  const normalizedQuantity = clampQuantity({
    maximumQuantity,
    minimumQuantity,
    quantityIncrement,
    value: optimisticQuantity,
  })
  function handleQuantityChange(newQuantity: number) {
    if (newQuantity === normalizedQuantity) return
    startUpdateTransition(async () => {
      setOptimisticQuantity(newQuantity)
      setStepperState(INITIAL_CART_LINE_FORM_STATE)
      const data = new FormData()
      data.append('intent', 'update')
      data.append('lineId', lineId)
      data.append('quantity', String(newQuantity))
      const result = await action(INITIAL_CART_LINE_FORM_STATE, data)
      setStepperState(result)
      if (result.cartChanged) {
        router.refresh()
        window.dispatchEvent(new Event(CART_CHANGED_EVENT))
        void dispatchClientAnalyticsEvent(
          createCartUpdateEvent({
            action: 'quantity_change',
            quantity: newQuantity,
          }),
        )
      }
    })
  }

  return (
    <>
      <QuantityStepper
        value={normalizedQuantity}
        onChange={handleQuantityChange}
        min={minimumQuantity}
        max={maximumQuantity}
        step={quantityIncrement}
        busy={isUpdatePending}
        label={`Quantity of ${productTitle}`}
      />

      {stepperState.message ? (
        <p className="type-caption text-danger" role="alert">
          {stepperState.message}
        </p>
      ) : null}
    </>
  )
}
