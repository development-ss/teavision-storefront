import { Suspense } from 'react'

import { LoginPanel } from '../_components/login-panel'
import { getAccountLoginStartHref } from '../_lib/return-path'
import { LoginPanelSlot } from './_components/panel-slot'

type LoginPageProps = {
  searchParams: Promise<{
    reason?: string
    returnTo?: string
  }>
}

// The card shell is static so navigation never falls back to the /account
// dashboard skeleton; only the reason copy and returnTo href stream in.
export default function AccountLoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="min-h-136 md:min-h-128">
      <Suspense
        fallback={<LoginPanel loginHref={getAccountLoginStartHref(null)} />}
      >
        <LoginPanelSlot searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
