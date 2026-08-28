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
