'use client'

import { useEffect, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  type ConsentState,
  DEFAULT_CONSENT,
  updateConsentCategories,
} from '@/lib/consent/adapter'
import { readStoredConsent, writeStoredConsent } from '@/lib/consent/storage'
import { applyShopifyCustomerPrivacyConsent } from '@/lib/consent/shopify-customer-privacy'
import { cn } from '@/lib/utils'

export type ConsentPreferencesProps = {
  initialConsent?: ConsentState
  className?: string
  onSaved?: (consent: ConsentState) => void
}

const optionalCategories = [
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'These cookies measure how people use our website, including the pages and products they view. We only collect this information if you allow analytics cookies.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description:
      'These cookies help measure which ads bring people to our website and may be used to show more relevant advertising. We only use them if you allow marketing cookies.',
  },
] as const

export function ConsentPreferences({
  initialConsent = DEFAULT_CONSENT,
  className,
  onSaved,
}: ConsentPreferencesProps) {
  const fieldsetId = useId()
  const [draftConsent, setDraftConsent] = useState<ConsentState>(initialConsent)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDraftConsent(readStoredConsent() ?? initialConsent)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [initialConsent])

  const optionalDenied = !draftConsent.analytics && !draftConsent.marketing

  function handleOptionalChange(
    category: (typeof optionalCategories)[number]['id'],
    checked: boolean,
  ) {
    setDraftConsent((current) =>
      updateConsentCategories(
        {
          [category]: checked,
        },
        current,
      ),
    )
    setStatusMessage(null)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const savedConsent = writeStoredConsent(
      updateConsentCategories(
        {
          analytics: draftConsent.analytics,
          marketing: draftConsent.marketing,
        },
        draftConsent,
      ),
    )

    setDraftConsent(savedConsent)
    setStatusMessage('Your cookie choices have been saved.')
    onSaved?.(savedConsent)
    void applyShopifyCustomerPrivacyConsent(savedConsent)
  }

  return (
    <form
      className={cn('flex flex-col gap-5', className)}
      onSubmit={handleSubmit}
    >
      {optionalDenied && (
        <Card padding="md" radius="md" tone="sunken">
          <p className="type-heading-05 text-ink">Optional cookies are off</p>
          <p className="type-body-sm text-ink-soft mt-2">
            Analytics and marketing cookies are currently off. Turn on either
            category below if you want to allow it.
          </p>
        </Card>
      )}

      <fieldset
        aria-describedby={statusMessage ? `${fieldsetId}-status` : undefined}
        className="flex flex-col gap-3"
      >
        <legend className="type-label text-ink">
          Choose which cookies to allow
        </legend>

        <Card padding="md" radius="md" tone="surface">
          <label className="flex gap-3">
            <Checkbox
              checked
              disabled
              aria-describedby={`${fieldsetId}-lock`}
            />
            <span className="min-w-0">
              <span className="type-label text-ink block">Essential</span>
              <span
                id={`${fieldsetId}-lock`}
                className="type-body-sm text-ink-soft mt-1 block"
              >
                Always on. These cookies are needed for security, your cart,
                checkout and remembering your cookie choices.
              </span>
            </span>
          </label>
        </Card>

        {optionalCategories.map((category) => (
          <Card key={category.id} padding="md" radius="md" tone="surface">
            <label className="flex gap-3">
              <Checkbox
                checked={draftConsent[category.id]}
                name={category.id}
                aria-describedby={`${fieldsetId}-${category.id}-description`}
                onChange={(event) =>
                  handleOptionalChange(category.id, event.currentTarget.checked)
                }
              />
              <span className="min-w-0">
                <span className="type-label text-ink block">
                  {category.label}
                </span>
                <span
                  id={`${fieldsetId}-${category.id}-description`}
                  className="type-body-sm text-ink-soft mt-1 block"
                >
                  {category.description}
                </span>
              </span>
            </label>
          </Card>
        ))}
      </fieldset>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" variant="brand">
          Save choices
        </Button>
        {statusMessage && (
          <p
            id={`${fieldsetId}-status`}
            className="type-body-sm text-brand"
            role="status"
          >
            {statusMessage}
          </p>
        )}
      </div>
    </form>
  )
}
