'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button, Checkbox, Textarea } from '@/components/ui'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createCheckoutStartEvent } from '@/lib/analytics/events'

import {
  CartAccountContext,
  type CartAccountContextState,
} from './account-context'

type CartCheckoutFormProps = {
  accountContextState: CartAccountContextState
  cartIdPresent: boolean
}

export function CartCheckoutForm({
  accountContextState,
  cartIdPresent,
}: CartCheckoutFormProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isBlocked = accountContextState === 'sync-failed-blocked'
  const currentAccountContextState = isSubmitting
    ? 'sync-pending'
    : accountContextState

  return (
    <form
      id="cart-checkout-form"
      action="/cart/checkout"
      method="post"
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        if (!agreedToTerms || isBlocked) {
          event.preventDefault()
          return
        }

        void dispatchClientAnalyticsEvent(
          createCheckoutStartEvent({
            cartIdPresent,
          }),
        )
        setIsSubmitting(true)
      }}
    >
      <CartAccountContext
        state={currentAccountContextState}
        retryDisabled={!agreedToTerms || isSubmitting}
      />

      <Textarea
        name="note"
        placeholder="Order Notes"
        className="min-h-28"
        aria-label="Order notes"
      />

      <label className="flex cursor-pointer items-start gap-2.5">
        <Checkbox
          name="terms"
          value="accepted"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-0.5"
          aria-describedby="terms-link"
        />
        <span className="type-body-sm text-ink font-medium select-none">
          I have read and agree to the{' '}
          <Link
            id="terms-link"
            href="/pages/terms-conditions"
            className="text-brand hover:text-brand-deep underline"
          >
            Terms and Conditions
          </Link>
        </span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <Button href="/collections/all" variant="brand" size="cta">
          Continue Shopping
        </Button>
        {isBlocked ? null : (
          <Button
            type="submit"
            size="cta"
            disabled={!agreedToTerms || isSubmitting}
            isLoading={isSubmitting}
            aria-label="Proceed to checkout"
          >
            Check Out
          </Button>
        )}
      </div>
    </form>
  )
}
