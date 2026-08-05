'use client'

import { useActionState } from 'react'

import type { NewsletterSignupActionResult } from '@/lib/contact/types'
import { cn } from '@/lib/utils'

import { Button } from '../button'
import { Section } from '../section'

type NewsletterSignupProps = {
  action: (
    previousState: NewsletterSignupActionResult,
    formData: FormData,
  ) => Promise<NewsletterSignupActionResult> | NewsletterSignupActionResult
  tone?: 'surface' | 'brand'
  className?: string
}

const DEFAULT_ERROR =
  'Unable to send your signup right now. Please try again shortly.'
const INITIAL_STATE: NewsletterSignupActionResult = { success: false }

export function NewsletterSignup({
  action,
  tone = 'surface',
  className,
}: NewsletterSignupProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)

  if (state.success) {
    return (
      <div
        className={cn(
          'rounded-lg border p-6',
          tone === 'brand'
            ? 'border-paper/30 bg-brand-deep text-paper'
            : 'border-brand bg-brand-tint text-brand',
          className,
        )}
        role="status"
      >
        <p className="type-label">You&rsquo;re in.</p>
        <p
          className={cn(
            'type-body-sm mt-2',
            tone === 'brand' ? 'text-paper/90' : 'text-ink',
          )}
        >
          Look out for the next Tea Journal edition.
        </p>
      </div>
    )
  }

  return (
    <Section.Root
      tone={tone}
      spacing="none"
      className={cn(
        'rounded-lg border p-6',
        tone === 'brand' ? 'border-paper/30' : 'border-hairline',
        className,
      )}
      aria-labelledby="newsletter-signup-heading"
    >
      <p className="type-eyebrow">Tea Journal</p>
      <h2 id="newsletter-signup-heading" className="type-heading-03 mt-3">
        Tea Journal in your inbox
      </h2>
      <p
        className={cn(
          'type-body-sm mt-3 max-w-xl',
          tone === 'brand' ? 'text-paper/90' : 'text-ink-soft',
        )}
      >
        Monthly market notes, sourcing guides, and wholesale tea ideas from the
        Teavision team.
      </p>

      <form
        action={formAction}
        className="mt-5 flex flex-col gap-3 sm:max-w-xl sm:flex-row"
      >
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          inputMode="email"
          autoCapitalize="off"
          autoComplete="email"
          autoCorrect="off"
          spellCheck={false}
          required
          maxLength={254}
          placeholder="you@example.com"
          className={cn(
            'type-body min-h-11 flex-1 rounded-full border px-4.5 py-3.5 transition-colors focus:ring-0 focus:outline-none',
            tone === 'brand'
              ? 'border-paper/20 bg-paper/5 text-paper placeholder:text-paper/60 focus:border-gold'
              : 'border-hairline bg-card text-ink placeholder:text-ink-faint focus:border-brand focus:shadow-focus',
          )}
          aria-describedby={state.error ? 'newsletter-error' : undefined}
        />

        <div className="sr-only" aria-hidden="true">
          <label htmlFor="newsletter-website">Website</label>
          <input
            id="newsletter-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <Button type="submit" isLoading={isPending} disabled={isPending}>
          {isPending ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>

      {state.error && (
        <p
          id="newsletter-error"
          role="alert"
          className={cn(
            'type-body-sm mt-3 rounded-md border p-3',
            tone === 'brand'
              ? 'border-paper/30 text-paper'
              : 'border-danger bg-danger-tint text-danger',
          )}
        >
          {state.error ?? DEFAULT_ERROR}
        </p>
      )}
    </Section.Root>
  )
}
