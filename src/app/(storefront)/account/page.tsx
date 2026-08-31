import type { Metadata } from 'next'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCustomerAccountDashboard } from '@/lib/shopify/customer-account/operations'
import type { CustomerAccountSession } from '@/lib/shopify/customer-account/types'

import { Dashboard } from './_components/dashboard'
import { AccountLoading } from './_components/loading'
import { requireAccountSessionForPath } from './_lib/protection'

export const metadata: Metadata = withNoindexRobots({
  title: 'Your Account',
})

async function AccountContent() {
  const session: CustomerAccountSession =
    await requireAccountSessionForPath('/account')
  const dashboard = await getCustomerAccountDashboard(session)

  return <Dashboard dashboard={dashboard} />
}

export default function AccountPage() {
  return (
    <div className="min-h-136 md:min-h-128">
      <Suspense fallback={<AccountLoading />}>
        <AccountContent />
      </Suspense>
    </div>
  )
}
