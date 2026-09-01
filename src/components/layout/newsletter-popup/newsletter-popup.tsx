'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useActionState, useEffect, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { dispatchClientAnalyticsEvent } from '@/lib/analytics/client'
import { createLeadSubmitEvent } from '@/lib/analytics/events'
import { CONSENT_CHANGED_EVENT, readStoredConsent } from '@/lib/consent/storage'
import type { NewsletterSignupActionResult } from '@/lib/contact/types'
import { cn } from '@/lib/utils'

type NewsletterPopupProps = {
  action: (
    previousState: NewsletterSignupActionResult,
    formData: FormData,
  ) => Promise<NewsletterSignupActionResult> | NewsletterSignupActionResult
  className?: string
  delayMs?: number
  forceOpen?: boolean
  storageKey?: string
  suppressionDays?: number
}

const DEFAULT_DELAY_MS = 10_000
const DEFAULT_STORAGE_KEY = 'teavision_newsletter_popup_dismissed_until_v1'
const DEFAULT_SUPPRESSION_DAYS = 30
const INITIAL_STATE: NewsletterSignupActionResult = { success: false }
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function isEligiblePath(pathname: string): boolean {
  return !(
    pathname.startsWith('/account') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout')
  )
}

function isPopupSuppressed(storageKey: string): boolean {
  try {
    const dismissedUntil = Number.parseInt(
      window.localStorage.getItem(storageKey) ?? '',
      10,
    )

    return Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()
  } catch {
    return false
  }
}

function suppressPopup(storageKey: string, suppressionDays: number): void {
  try {
    const dismissedUntil = Date.now() + suppressionDays * MILLISECONDS_PER_DAY
    window.localStorage.setItem(storageKey, String(dismissedUntil))
  } catch {}
}

export function NewsletterPopup({
  action,
  className,
  delayMs = DEFAULT_DELAY_MS,
  forceOpen = false,
  storageKey = DEFAULT_STORAGE_KEY,
  suppressionDays = DEFAULT_SUPPRESSION_DAYS,
}: NewsletterPopupProps) {
  const pathname = usePathname()
  const id = useId()
  const [open, setOpen] = useState(forceOpen)
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)

  useEffect(() => {
    if (forceOpen) return
    if (!isEligiblePath(pathname) || isPopupSuppressed(storageKey)) return

    let timer: number | undefined

    function schedulePopup() {
      if (readStoredConsent() === null || timer !== undefined) return

      timer = window.setTimeout(() => setOpen(true), Math.max(0, delayMs))
    }

    schedulePopup()
    window.addEventListener(CONSENT_CHANGED_EVENT, schedulePopup)

    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      window.removeEventListener(CONSENT_CHANGED_EVENT, schedulePopup)
    }
  }, [delayMs, forceOpen, pathname, storageKey])

  useEffect(() => {
    if (!state.success) return

    suppressPopup(storageKey, suppressionDays)
    void dispatchClientAnalyticsEvent(createLeadSubmitEvent('newsletter'))
  }, [state.success, storageKey, suppressionDays])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen) suppressPopup(storageKey, suppressionDays)
  }

  const messageId = state.error ? `${id}-error` : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={state.success ? "You're on the list" : 'Tea Journal in your inbox'}
      description={
        state.success
          ? 'Thanks for joining Teavision.'
          : 'Monthly market notes, sourcing guides, and wholesale tea ideas.'
      }
      className={cn('max-w-3xl', className)}
    >
      <div className="grid sm:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="bg-brand-deep flex min-h-36 items-center justify-center overflow-hidden px-8 py-5 sm:min-h-88 sm:px-5">
          <Image
            src="/images/newsletter-teapot.png"
            alt="Green Teavision teapot with loose tea leaves"
            width={530}
            height={378}
            sizes="(min-width: 640px) 208px, 240px"
            className="h-auto w-full max-w-60 sm:max-w-none"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center p-5 sm:p-8">
          {state.success ? (
            <div role="status" aria-live="polite">
              <p className="type-body text-ink-soft">
                Look out for the next Tea Journal edition. You can unsubscribe
                from any email.
              </p>
              <Button
                type="button"
                variant="brand"
                className="mt-6"
                onClick={() => handleOpenChange(false)}
              >
                Continue browsing
              </Button>
            </div>
          ) : (
            <form action={formAction} aria-busy={isPending}>
              <label className="type-label text-ink" htmlFor={`${id}-email`}>
                Email address
              </label>
              <input
                id={`${id}-email`}
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
                aria-describedby={messageId}
                aria-invalid={state.error ? true : undefined}
                className="type-body border-hairline bg-card text-ink placeholder:text-ink-faint focus:border-brand focus:shadow-focus mt-2 min-h-12 w-full rounded-md border px-4 focus:ring-0 focus:outline-none"
              />

              <div className="sr-only" aria-hidden="true">
                <label htmlFor={`${id}-website`}>Website</label>
                <input
                  id={`${id}-website`}
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {state.error ? (
                <p
                  id={messageId}
                  role="alert"
                  className="type-body-sm border-danger bg-danger-tint text-danger mt-3 rounded-md border p-3"
                >
                  {state.error}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="brand"
                size="lg"
                isLoading={isPending}
                disabled={isPending}
                className="mt-5 w-full"
              >
                {isPending ? 'Subscribing…' : 'Subscribe'}
              </Button>
              <p className="type-caption text-ink-faint mt-3 text-center">
                No spam. Unsubscribe whenever you like.
              </p>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  )
}
