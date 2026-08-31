import { LoginPanel } from '../../_components/login-panel'
import type { LoginReason } from '../../_components/login-panel'
import { getAccountLoginStartHref } from '../../_lib/return-path'

type LoginPanelSlotProps = {
  searchParams: Promise<{
    reason?: string
    returnTo?: string
  }>
}

function getLoginReason(reason: string | undefined): LoginReason {
  if (reason === 'expired') return 'expired'
  if (reason === 'verification-failed') return 'verification-failed'
  if (reason === 'logged-out-cart-retained') {
    return 'logged-out-cart-retained'
  }

  return 'default'
}

export async function LoginPanelSlot({ searchParams }: LoginPanelSlotProps) {
  const params = await searchParams

  return (
    <LoginPanel
      loginHref={getAccountLoginStartHref(params.returnTo ?? null)}
      reason={getLoginReason(params.reason)}
    />
  )
}
