import type { Metadata } from 'next'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import { createAddressAction } from '@/lib/shopify/customer-account/actions'

import { AddressForm } from '../../_components/address-form'
import { AccountLoading } from '../../_components/loading'
import { requireAccountSessionForPath } from '../../_lib/protection'

export const metadata: Metadata = withNoindexRobots({
  title: 'New Address',
})

async function NewAddressContent() {
  await requireAccountSessionForPath('/account/addresses/new')

  return <AddressForm mode="create" action={createAddressAction} />
}

export default function NewAddressPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <NewAddressContent />
    </Suspense>
  )
}
