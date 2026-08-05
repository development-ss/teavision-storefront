'use client'

import { useActionState, useEffect, useState } from 'react'

import {
  Button,
  Card,
  FormLabel,
  Select,
  Textarea,
  TextInput,
} from '@/components/ui'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createLeadSubmitEvent } from '@/lib/analytics/events'
import { sendWholesaleAccountAction } from '@/lib/contact/actions'
import type { ContactActionResult } from '@/lib/contact/types'
import {
  WHOLESALE_ACCOUNT_LIMITS,
  WHOLESALE_ACCOUNT_START_OPTIONS,
} from '@/lib/contact/wholesale-account'
import { cn } from '@/lib/utils'

const DEFAULT_ERROR =
  'Unable to send your application right now. Please try again shortly.'

const labelClassName = 'type-mono-meta text-ink-faint'

type WholesaleSubmissionState = ContactActionResult & {
  submissionCount: number
}

const INITIAL_STATE: WholesaleSubmissionState = {
  success: false,
  submissionCount: 0,
}

export function WholesaleAccountForm() {
  const [dismissedSubmissionCount, setDismissedSubmissionCount] = useState<
    number | null
  >(null)
  const [state, formAction, isPending] = useActionState(
    async (
      previousState: WholesaleSubmissionState,
      formData: FormData,
    ): Promise<WholesaleSubmissionState> => {
      try {
        const result = await sendWholesaleAccountAction(formData)

        return {
          ...result,
          submissionCount: previousState.submissionCount + 1,
        }
      } catch {
        return {
          success: false,
          error: DEFAULT_ERROR,
          submissionCount: previousState.submissionCount + 1,
        }
      }
    },
    INITIAL_STATE,
  )

  useEffect(() => {
    if (!state.success || state.submissionCount === 0) return

    void dispatchClientAnalyticsEvent(createLeadSubmitEvent('wholesale'))
  }, [state.submissionCount, state.success])

  if (state.success && dismissedSubmissionCount !== state.submissionCount) {
    return (
      <Card className="border-brand/30 bg-brand-tint p-6 sm:p-8">
        <p className={labelClassName}>Application received</p>
        <h2 className="type-heading-03 text-ink mt-4">
          Thanks, your wholesale request is with us.
        </h2>
        <p className="type-body text-ink-soft mt-3 max-w-xl">
          The Teavision team will review your products, estimated annual volume,
          and timing, then come back with the next steps for a bulk account.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => setDismissedSubmissionCount(state.submissionCount)}
        >
          Submit another request
        </Button>
      </Card>
    )
  }

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      aria-label="Wholesale bulk order account sign up form"
      className="flex flex-col gap-6"
    >
      <Card className="p-5 sm:p-7">
        <p className={labelClassName}>Your details</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="wholesale-first-name">First name *</FormLabel>
            <TextInput
              id="wholesale-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              maxLength={WHOLESALE_ACCOUNT_LIMITS.field}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="wholesale-last-name">Last name *</FormLabel>
            <TextInput
              id="wholesale-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              maxLength={WHOLESALE_ACCOUNT_LIMITS.field}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="wholesale-phone">Phone</FormLabel>
            <TextInput
              id="wholesale-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={WHOLESALE_ACCOUNT_LIMITS.phone}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="wholesale-email">Email *</FormLabel>
            <TextInput
              id="wholesale-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={WHOLESALE_ACCOUNT_LIMITS.email}
              className="mt-2"
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-7">
        <p className={labelClassName}>Bulk order details</p>
        <div className="mt-5 grid gap-5">
          <div>
            <FormLabel htmlFor="wholesale-company">
              Company / business name *
            </FormLabel>
            <TextInput
              id="wholesale-company"
              name="company"
              type="text"
              autoComplete="organization"
              required
              maxLength={WHOLESALE_ACCOUNT_LIMITS.field}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="wholesale-product-list">
              Product list *
            </FormLabel>
            <Textarea
              id="wholesale-product-list"
              name="productList"
              required
              rows={4}
              maxLength={WHOLESALE_ACCOUNT_LIMITS.text}
              className="mt-2"
              placeholder="List the teas, herbs, spices, powders, or blends you expect to purchase."
            />
          </div>

          <div>
            <FormLabel htmlFor="wholesale-annual-volume">
              Product volumes (estimated annual volume in kg) *
            </FormLabel>
            <Textarea
              id="wholesale-annual-volume"
              name="annualVolumeKg"
              required
              rows={3}
              maxLength={WHOLESALE_ACCOUNT_LIMITS.text}
              className="mt-2"
              placeholder="Example: 100kg black tea, 50kg peppermint, 250kg total annual volume."
            />
          </div>

          <div>
            <FormLabel htmlFor="wholesale-start-purchasing">
              When are you looking to start purchasing? *
            </FormLabel>
            <Select
              id="wholesale-start-purchasing"
              name="startPurchasing"
              required
              defaultValue=""
              className="mt-2"
            >
              <option value="" disabled>
                Choose a timeframe...
              </option>
              {WHOLESALE_ACCOUNT_START_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="wholesale-website">Website</label>
        <input
          id="wholesale-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {!state.success && state.error ? (
        <p
          id="wholesale-account-form-error"
          role="alert"
          className={cn(
            'type-body-sm rounded border p-4',
            'border-danger/30 bg-danger-tint text-danger',
          )}
        >
          {state.error}
        </p>
      ) : null}

      <div className="border-hairline flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-body-sm text-ink-soft max-w-2xl">
          By signing up, you agree to receive marketing emails and text
          messages. View our privacy policy and terms of service for more info.
        </p>
        <Button
          type="submit"
          variant="brand"
          size="lg"
          isLoading={isPending}
          disabled={isPending}
          aria-describedby={
            !state.success && state.error
              ? 'wholesale-account-form-error'
              : undefined
          }
          className="w-full sm:w-auto"
        >
          {isPending ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  )
}
