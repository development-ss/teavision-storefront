import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCustomerAccountDashboard } from '@/lib/shopify/customer-account/operations'
import { updateAddressAction } from '@/lib/shopify/customer-account/actions'

import { AddressForm } from '../../../_components/address-form'
import { AccountLoading } from '../../../_components/loading'
import { requireAccountSessionForPath } from '../../../_lib/protection'

export const metadata: Metadata = withNoindexRobots({
  title: 'Edit Address',
})

type EditAddressPageProps = {
  params: Promise<{ id: string }>
}

async function EditAddressContent({ params }: EditAddressPageProps) {
  const { id } = await params
  const decodedId = decodeURIComponent(id)
  const session = await requireAccountSessionForPath(
    `/account/addresses/${id}/edit`,
  )
  const dashboard = await getCustomerAccountDashboard(session)
  const address = dashboard.profile?.addresses.find(
    (savedAddress) => savedAddress.id === decodedId,
  )

  if (!address) notFound()

  return (
    <AddressForm
      mode="edit"
      action={updateAddressAction}
      address={address}
      isDefaultAddress={dashboard.defaultAddress?.id === address.id}
    />
  )
}

export default function EditAddressPage({ params }: EditAddressPageProps) {
  return (
    <Suspense fallback={<AccountLoading />}>
      <EditAddressContent params={params} />
    </Suspense>
  )
}
