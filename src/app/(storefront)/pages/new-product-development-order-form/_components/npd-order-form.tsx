'use client'

import { useActionState, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormLabel } from '@/components/ui/form-label'
import { Radio } from '@/components/ui/radio'
import { Select } from '@/components/ui/select'
import { TextInput } from '@/components/ui/text-input'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createLeadSubmitEvent } from '@/lib/analytics/events'
import { sendNpdOrderAction } from '@/lib/contact/actions'
import type { ContactActionResult } from '@/lib/contact/types'
import {
  NPD_BLEND_DEVELOPMENT_COST,
  NPD_NATUROPATH_COST,
  NPD_ORDER_LIMITS,
  NPD_PRODUCT_TYPES,
  NPD_TIMEFRAMES,
} from '@/lib/contact/npd-order'

import { BlendFields } from './blend-fields'

const DEFAULT_ERROR =
  'Unable to send your form right now. Please try again shortly.'

const groupClassName = 'border-hairline bg-card rounded-lg border p-5 sm:p-6'
const legendClassName = 'type-mono-meta text-brand'
const labelClassName = 'type-mono-meta text-ink-faint'
const optionClassName =
  'type-body-sm border-hairline hover:bg-paper-2 flex min-h-11 items-center gap-3 rounded-sm border px-3 transition-colors'

const MULTI_BLEND_COUNTS = Array.from(
  { length: NPD_ORDER_LIMITS.maxBlends - 1 },
  (_, index) => index + 2,
)

type NpdSubmissionState = ContactActionResult & {
  submissionCount: number
}

const INITIAL_STATE: NpdSubmissionState = {
  success: false,
  submissionCount: 0,
}

export function NpdOrderForm() {
  const [dismissedSubmissionCount, setDismissedSubmissionCount] = useState<
    number | null
  >(null)
  const [timeframe, setTimeframe] = useState('')
  const [blendMode, setBlendMode] = useState<'one' | 'multiple'>('one')
  const [multiBlendCount, setMultiBlendCount] = useState(2)
  const [state, formAction, isPending] = useActionState(
    async (
      previousState: NpdSubmissionState,
      formData: FormData,
    ): Promise<NpdSubmissionState> => {
      try {
        const result = await sendNpdOrderAction(formData)

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

  const blendCount = blendMode === 'one' ? 1 : multiBlendCount

  useEffect(() => {
    if (!state.success || state.submissionCount === 0) return

    void dispatchClientAnalyticsEvent(createLeadSubmitEvent('npd'))
  }, [state.submissionCount, state.success])

  if (state.success && dismissedSubmissionCount !== state.submissionCount) {
    return (
      <div className="border-brand/30 bg-brand-tint rounded-lg border p-6">
        <p className={labelClassName}>Form received</p>
        <h2 className="type-heading-03 text-ink mt-4">
          Thank you, your form has been received.
        </h2>
        <p className="type-body text-ink-soft mt-3 max-w-xl">
          Our team will review your blend details and be in touch shortly.
          We&rsquo;ll reply within 1&ndash;2 business days.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => {
            setTimeframe('')
            setBlendMode('one')
            setMultiBlendCount(2)
            setDismissedSubmissionCount(state.submissionCount)
          }}
        >
          Submit another form
        </Button>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6"
      aria-label="New product development order form"
    >
      <div className={groupClassName}>
        <p className={legendClassName}>Order details</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="npd-company">
              Company / customer name *
            </FormLabel>
            <TextInput
              id="npd-company"
              name="company"
              type="text"
              autoComplete="organization"
              required
              maxLength={NPD_ORDER_LIMITS.field}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="npd-date">Date *</FormLabel>
            <TextInput
              id="npd-date"
              name="date"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="dd/mm/yyyy"
              pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
              title="Enter a date in dd/mm/yyyy format"
              aria-describedby="npd-date-hint"
              required
              maxLength={10}
              className="mt-2"
            />
            <p id="npd-date-hint" className="type-body-sm text-ink-soft mt-2">
              Use dd/mm/yyyy, for example 01/07/2026.
            </p>
          </div>

          <div>
            <FormLabel htmlFor="npd-timeframe">Estimated timeframe</FormLabel>
            <Select
              id="npd-timeframe"
              name="timeframe"
              value={timeframe}
              onChange={(event) => setTimeframe(event.target.value)}
              className="mt-2"
            >
              <option value="">Choose an option&hellip;</option>
              {NPD_TIMEFRAMES.map((option) => (
                <option key={option} value={option}>
                  {option === 'Other' ? 'Other (specify)' : option}
                </option>
              ))}
            </Select>
          </div>

          {timeframe === 'Other' ? (
            <div>
              <FormLabel htmlFor="npd-other-timeframe">
                Specify other timeframe
              </FormLabel>
              <TextInput
                id="npd-other-timeframe"
                name="otherTimeframe"
                type="text"
                maxLength={NPD_ORDER_LIMITS.text}
                placeholder="Example: launch by 15/03/2027, coordinate with retailer promo"
                className="mt-2"
              />
            </div>
          ) : null}
        </div>
      </div>

      <fieldset className={groupClassName}>
        <legend className="sr-only">Product type</legend>
        <p aria-hidden="true" className={legendClassName}>
          Product type
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {NPD_PRODUCT_TYPES.map((productType) => (
            <label key={productType.value} className={optionClassName}>
              <Checkbox name="productTypes" value={productType.value} />
              <span className="min-w-0">
                {productType.label}
                {productType.note ? (
                  <span className="text-ink-faint"> ({productType.note})</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
        <p className="type-body-sm text-ink-soft mt-4">
          Note: product type applies to all blends in this submission.
        </p>
      </fieldset>

      <fieldset className={groupClassName}>
        <legend className="sr-only">Is your brand certified organic?</legend>
        <p aria-hidden="true" className={legendClassName}>
          Is your brand certified organic?
        </p>
        <div className="mt-5 flex flex-wrap gap-6">
          <label className="type-body-sm text-ink flex items-center gap-3">
            <Radio name="brandCertifiedOrganic" value="YES" />
            <span>Yes</span>
          </label>
          <label className="type-body-sm text-ink flex items-center gap-3">
            <Radio name="brandCertifiedOrganic" value="NO" />
            <span>No</span>
          </label>
        </div>
      </fieldset>

      <fieldset className={groupClassName}>
        <legend className="sr-only">
          How many blends would you like to create?
        </legend>
        <p aria-hidden="true" className={legendClassName}>
          How many blends would you like to create?
        </p>
        <p className="type-body-sm text-ink-soft mt-5">
          Each blend costs {NPD_BLEND_DEVELOPMENT_COST} to develop and will
          include the formulation and recipe details.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <label className="type-body-sm text-ink flex items-center gap-3">
            <Radio
              name="blendMode"
              value="one"
              checked={blendMode === 'one'}
              onChange={() => setBlendMode('one')}
            />
            <span>Create one blend</span>
          </label>
          <label className="type-body-sm text-ink flex items-center gap-3">
            <Radio
              name="blendMode"
              value="multiple"
              checked={blendMode === 'multiple'}
              onChange={() => setBlendMode('multiple')}
            />
            <span>Create multiple blends</span>
          </label>

          {blendMode === 'multiple' ? (
            <div className="flex items-center gap-3">
              <FormLabel htmlFor="npd-blend-count">Number of blends</FormLabel>
              <Select
                id="npd-blend-count"
                value={multiBlendCount}
                onChange={(event) =>
                  setMultiBlendCount(Number(event.target.value))
                }
                className="w-auto"
              >
                {MULTI_BLEND_COUNTS.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
        </div>
        <input type="hidden" name="blendCount" value={blendCount} />
      </fieldset>

      {Array.from({ length: blendCount }, (_, blendIndex) => (
        <BlendFields key={blendIndex + 1} index={blendIndex + 1} />
      ))}

      <div className={groupClassName}>
        <p className={legendClassName}>Contact details</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="npd-first-name">First name *</FormLabel>
            <TextInput
              id="npd-first-name"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              maxLength={NPD_ORDER_LIMITS.field}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="npd-last-name">Last name *</FormLabel>
            <TextInput
              id="npd-last-name"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              maxLength={NPD_ORDER_LIMITS.field}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="npd-email">Email *</FormLabel>
            <TextInput
              id="npd-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={NPD_ORDER_LIMITS.email}
              className="mt-2"
            />
          </div>

          <div>
            <FormLabel htmlFor="npd-phone">Phone (optional)</FormLabel>
            <TextInput
              id="npd-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={NPD_ORDER_LIMITS.phone}
              className="mt-2"
            />
          </div>
        </div>
        <p className="type-body-sm text-ink-soft mt-4">
          By submitting, you agree we may contact you about your NPD request.
        </p>
      </div>

      <div className="border-brand/30 bg-brand-tint rounded-lg border p-5 sm:p-6">
        <label className="flex items-start gap-4">
          <Checkbox
            name="naturopathCertification"
            value="YES"
            className="mt-1"
          />
          <span className="min-w-0">
            <span className="type-body text-ink block font-medium">
              Include naturopath certification &mdash; {NPD_NATUROPATH_COST}
            </span>
            <span className="type-body-sm text-ink-soft mt-1 block">
              Increase your sales by building customer trust with a naturopath
              approved product. Approval includes a certificate.
            </span>
          </span>
        </label>
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="npd-website">Website</label>
        <input
          id="npd-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {!state.success && state.error ? (
        <p
          id="npd-form-error"
          role="alert"
          className="type-body-sm border-danger/30 bg-danger-tint text-danger rounded border p-4"
        >
          {state.error}
        </p>
      ) : null}

      <div className="border-hairline flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-body-sm text-ink-soft">
          We&rsquo;ll reply within 1&ndash;2 business days.
        </p>
        <Button
          type="submit"
          variant="brand"
          size="lg"
          isLoading={isPending}
          disabled={isPending}
          aria-describedby={
            !state.success && state.error ? 'npd-form-error' : undefined
          }
        >
          {isPending ? 'Sending form...' : 'Submit NPD form'}
        </Button>
      </div>
    </form>
  )
}
