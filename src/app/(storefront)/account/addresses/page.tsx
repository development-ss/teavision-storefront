import type { Metadata } from 'next'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCustomerAccountDashboard } from '@/lib/shopify/customer-account'
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from '@/lib/shopify/customer-account/actions'

import { AddressBook } from '../_components/address-book'
import { AccountLoading } from '../_components/loading'
import { requireAccountSessionForPath } from '../_lib/protection'

export const metadata: Metadata = withNoindexRobots({
  title: 'Saved Addresses',
})

async function AddressesContent() {
  const session = await requireAccountSessionForPath('/account/addresses')
  const dashboard = await getCustomerAccountDashboard(session)
  const addresses = dashboard.profile?.addresses ?? []

  return (
    <AddressBook
      addresses={addresses}
      defaultAddressId={dashboard.defaultAddress?.id ?? null}
      deleteAddressAction={deleteAddressAction}
      setDefaultAction={setDefaultAddressAction}
    />
  )
}

export default function AccountAddressesPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AddressesContent />
    </Suspense>
  )
}
