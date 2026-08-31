'use client'

import { useActionState, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form-label'
import { Textarea } from '@/components/ui/textarea'
import { TextInput } from '@/components/ui/text-input'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createLeadSubmitEvent } from '@/lib/analytics/events'
import type { ContactActionResult } from '@/lib/contact/types'

export type { ContactActionResult } from '@/lib/contact/types'

type ContactFormProps = {
  action: (formData: FormData) => Promise<ContactActionResult>
  initialState?: 'idle' | 'success' | 'error'
  initialError?: string
  eyebrow?: string
  title?: string
  description?: string
  submitLabel?: string
  pendingLabel?: string
}

type ContactSubmissionState = ContactActionResult & {
  submissionCount: number
}

const DEFAULT_ERROR =
  'Unable to send your message right now. Please try again shortly.'

const labelClassName = 'type-mono-meta text-ink-faint'

export function ContactForm({
  action,
  initialState = 'idle',
  initialError = DEFAULT_ERROR,
  eyebrow = 'Procurement desk',
  title = 'Start an enquiry',
  description = 'Tell us what you need sourced, blended, packed, or quoted. A short brief is enough to start the conversation.',
  submitLabel = 'Send enquiry',
  pendingLabel = 'Sending enquiry...',
}: ContactFormProps) {
  const initialActionState: ContactSubmissionState = {
    success: initialState === 'success',
    error: initialState === 'error' ? initialError : undefined,
    submissionCount: 0,
  }
  const [dismissedSubmissionCount, setDismissedSubmissionCount] = useState<
    number | null
  >(null)
  const [state, formAction, isPending] = useActionState(
    async (
      previousState: ContactSubmissionState,
      formData: FormData,
    ): Promise<ContactSubmissionState> => {
      try {
        const result = await action(formData)

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
    initialActionState,
  )

  useEffect(() => {
    if (!state.success || state.submissionCount === 0) return

    void dispatchClientAnalyticsEvent(createLeadSubmitEvent('contact'))
  }, [state.submissionCount, state.success])

  if (state.success && dismissedSubmissionCount !== state.submissionCount) {
    return (
      <div className="border-brand/30 bg-brand-tint rounded-lg border p-6">
        <p className={labelClassName}>Enquiry received</p>
        <h2 className="type-heading-03 text-ink mt-4">
          Thanks for your message.
        </h2>
        <p className="type-body text-ink-soft mt-3 max-w-xl">
          We&rsquo;ll review the details and come back to you shortly. If your
          request is time-sensitive, call 1300 729 617.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => setDismissedSubmissionCount(state.submissionCount)}
        >
          Send another enquiry
        </Button>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6"
      aria-label="Contact enquiry form"
    >
      <div>
        <p className={labelClassName}>{eyebrow}</p>
        <h2 className="type-heading-03 text-ink mt-3">{title}</h2>
        <p className="type-body text-ink-soft mt-3 max-w-2xl">{description}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FormLabel className={labelClassName} htmlFor="contact-name">
            Name
          </FormLabel>
          <TextInput
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            className="mt-2"
          />
        </div>

        <div>
          <FormLabel className={labelClassName} htmlFor="contact-phone">
            Phone
          </FormLabel>
          <TextInput
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={20}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <FormLabel className={labelClassName} htmlFor="contact-email">
          Email
        </FormLabel>
        <TextInput
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="mt-2"
        />
      </div>

      <div>
        <FormLabel className={labelClassName} htmlFor="contact-message">
          Message
        </FormLabel>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={2000}
          className="mt-2 min-h-40"
          placeholder="Wholesale account, custom blend, private label, sample request, or general supply question."
        />
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {!state.success && state.error && (
        <p
          id="contact-form-error"
          role="alert"
          className="type-body-sm border-danger/30 bg-danger-tint text-danger rounded border p-4"
        >
          {state.error}
        </p>
      )}

      <div className="border-hairline flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-body-sm text-ink-soft">
          We reply from Teavision during Australian business hours.
        </p>
        <Button
          type="submit"
          variant="brand"
          size="lg"
          isLoading={isPending}
          disabled={isPending}
          aria-describedby={
            !state.success && state.error ? 'contact-form-error' : undefined
          }
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  )
}
