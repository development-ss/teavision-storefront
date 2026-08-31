'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="bg-card border-hairline mx-auto max-w-xl rounded-lg border p-6 sm:p-8"
      role="alert"
    >
      <h1 className="type-heading-03 text-ink">
        We could not load your account
      </h1>
      <p className="type-body-sm text-ink-soft mt-3">
        Refresh this account section, or contact support if it keeps happening.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset} variant="brand">
          Try again
        </Button>
        <Button href="/pages/contact" variant="secondary">
          Contact support
        </Button>
      </div>
    </div>
  )
}
