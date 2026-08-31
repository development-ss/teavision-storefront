import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import { updateProfileAction } from '@/lib/shopify/customer-account/actions'
import { getCustomerAccountDashboard } from '@/lib/shopify/customer-account/operations'

import { ProfileForm } from '../_components/profile-form'
import { ProfileLoading } from '../_components/profile-loading'
import { requireAccountSessionForPath } from '../_lib/protection'

export const metadata: Metadata = withNoindexRobots({
  title: 'Edit Profile',
})

async function ProfileContent() {
  const session = await requireAccountSessionForPath('/account/profile')
  const dashboard = await getCustomerAccountDashboard(session)

  if (!dashboard.profile) notFound()

  return (
    <ProfileForm profile={dashboard.profile} action={updateProfileAction} />
  )
}

export default function AccountProfilePage() {
  return (
    <Suspense fallback={<ProfileLoading />}>
      <ProfileContent />
    </Suspense>
  )
}
