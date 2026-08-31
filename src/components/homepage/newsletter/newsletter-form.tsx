'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createLeadSubmitEvent } from '@/lib/analytics/events'
import type { NewsletterSignupActionResult } from '@/lib/contact/types'
import { cn } from '@/lib/utils'

type HomepageNewsletterFormProps = {
  action: (
    previousState: NewsletterSignupActionResult,
    formData: FormData,
  ) => Promise<NewsletterSignupActionResult> | NewsletterSignupActionResult
}

const DEFAULT_ERROR =
  'Unable to send your signup right now. Please try again shortly.'
const INITIAL_STATE: NewsletterSignupActionResult = { success: false }

export function HomepageNewsletterForm({
  action,
}: HomepageNewsletterFormProps) {
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)

  useEffect(() => {
    if (!state.success) return

    formRef.current?.reset()
    void dispatchClientAnalyticsEvent(createLeadSubmitEvent('newsletter'))
  }, [state.success])

  const messageId = state.success ? `${id}-success` : `${id}-error`
  const hasMessage = state.success || Boolean(state.error)

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={isPending}
      className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap"
    >
      <label className="sr-only" htmlFor={`${id}-email`}>
        Enter your email
      </label>
      <input
        id={`${id}-email`}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        maxLength={254}
        placeholder="Enter your email"
        aria-describedby={hasMessage ? messageId : undefined}
        className="border-paper/25 bg-paper/10 text-paper placeholder:text-paper/60 focus:border-gold focus-visible:ring-ring min-h-12 min-w-55 flex-1 rounded-full border px-5.5 focus-visible:ring-2 focus-visible:outline-none"
      />
      <div className="sr-only" aria-hidden="true">
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <Button
        type="submit"
        variant="inverse"
        size="cta"
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending ? 'Subscribing…' : 'Subscribe'}
        {!isPending && <ArrowRight className="size-4" aria-hidden="true" />}
      </Button>
      {hasMessage ? (
        <p
          id={messageId}
          role={state.success ? 'status' : 'alert'}
          aria-live="polite"
          className={cn(
            'type-body-sm w-full rounded-md border p-3 text-center',
            state.success
              ? 'border-paper/25 text-paper'
              : 'border-gold bg-paper text-ink',
          )}
        >
          {state.success
            ? 'Thanks for signing up.'
            : (state.error ?? DEFAULT_ERROR)}
        </p>
      ) : null}
    </form>
  )
}
