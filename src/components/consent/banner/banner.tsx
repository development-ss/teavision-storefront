'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import {
  grantOptionalConsent,
  rejectOptionalConsent,
} from '@/lib/consent/adapter'
import { readStoredConsent, writeStoredConsent } from '@/lib/consent/storage'
import { applyShopifyCustomerPrivacyConsent } from '@/lib/consent/shopify-customer-privacy'
import { cn } from '@/lib/utils'

import { ConsentPreferences } from '../preferences'

export type ConsentBannerProps = {
  forceVisible?: boolean
  className?: string
}

export function ConsentBanner({
  forceVisible = false,
  className,
}: ConsentBannerProps) {
  const [visible, setVisible] = useState(forceVisible)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (forceVisible) {
        setVisible(true)
        return
      }

      setVisible(readStoredConsent() === null)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [forceVisible])

  function saveAndHide(consent: ReturnType<typeof grantOptionalConsent>) {
    const savedConsent = writeStoredConsent(consent)

    setVisible(false)
    setPreferencesOpen(false)
    void applyShopifyCustomerPrivacyConsent(savedConsent)
  }

  if (!visible) return null

  return (
    <>
      <div className={cn('fixed inset-x-3 bottom-3 z-40', className)}>
        <Card
          padding="md"
          radius="md"
          tone="surface"
          className="shadow-4 mx-auto max-w-4xl"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="type-label text-ink">
                We use optional cookies only after you allow them.
              </p>
              <p className="type-body-sm text-ink-soft mt-1">
                Essential cookies stay on for cart, checkout, security, and
                saved preferences.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              <Button
                type="button"
                variant="brand"
                size="sm"
                onClick={() => saveAndHide(grantOptionalConsent())}
              >
                Accept optional cookies
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => saveAndHide(rejectOptionalConsent())}
              >
                Reject optional cookies
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPreferencesOpen(true)}
              >
                Manage preferences
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        title="Cookie preferences"
        description="Choose which optional cookies you allow. Essential cookies are always on."
        className="max-w-3xl"
      >
        <div className="p-4 sm:p-5">
          <ConsentPreferences
            onSaved={() => {
              setVisible(false)
              setPreferencesOpen(false)
            }}
          />
        </div>
      </Dialog>
    </>
  )
}
