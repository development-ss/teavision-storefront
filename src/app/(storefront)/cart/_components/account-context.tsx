import { Button } from '@/components/ui/button'

export type CartAccountContextState =
  | 'guest'
  | 'signed-in'
  | 'sync-pending'
  | 'sync-failed-blocked'
  | null

type CartAccountContextProps = {
  accountEmail?: string | null
  retryDisabled?: boolean
  state: CartAccountContextState
}

export function CartAccountContext({
  accountEmail = null,
  retryDisabled = false,
  state,
}: CartAccountContextProps) {
  if (!state) return null

  if (state === 'guest') {
    return (
      <div
        className="bg-paper-2 border-hairline rounded-lg border px-4 py-3"
        role="status"
      >
        <p className="type-body-sm text-ink">
          Checking out as a guest. Sign in to use saved addresses and view
          orders.
        </p>
        <Button
          href="/account/login?returnTo=/cart"
          variant="secondary"
          size="sm"
          className="mt-3"
        >
          Sign in to use saved addresses
        </Button>
      </div>
    )
  }
  if (state === 'sync-failed-blocked') {
    return (
      <div
        className="bg-danger-tint text-danger border-danger rounded-lg border px-4 py-3"
        role="alert"
      >
        <p className="type-body-sm">
          We could not confirm your account for checkout. Retry checkout or sign
          in again before continuing.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            variant="brand"
            size="sm"
            disabled={retryDisabled}
          >
            Retry checkout
          </Button>
          <Button
            href="/account/login?returnTo=/cart"
            variant="secondary"
            size="sm"
          >
            Sign in again
          </Button>
          <Button href="/pages/contact" variant="quiet" size="quiet">
            Contact support
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-paper-2 border-hairline rounded-lg border px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <p className="type-body-sm text-ink">
        {state === 'sync-pending'
          ? 'Confirming your account for checkout'
          : 'Checking out with your Teavision account'}
      </p>
      {state === 'signed-in' ? (
        <>
          {accountEmail ? (
            <p className="type-caption text-ink-soft mt-1">
              Order confirmation:{' '}
              <span className="font-medium">{accountEmail}</span>
            </p>
          ) : null}
          <p className="type-caption text-ink-soft mt-1">
            Shop Pay may show a different email. It does not change the
            Teavision account used for this order.
          </p>
        </>
      ) : null}
    </div>
  )
}
