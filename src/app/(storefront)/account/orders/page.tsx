import type { Metadata } from 'next'
import { Suspense } from 'react'

import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCustomerAccountOrders } from '@/lib/shopify/customer-account/operations'

import { AccountLoading } from '../_components/loading'
import { OrderHistory } from '../_components/order-history'
import { requireAccountSessionForPath } from '../_lib/protection'

export const metadata: Metadata = withNoindexRobots({
  title: 'Order History',
})

type OrdersPageProps = {
  searchParams: Promise<{
    after?: string
    before?: string
  }>
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const session = await requireAccountSessionForPath('/account/orders')
  const orders = await getCustomerAccountOrders(
    session,
    params.before
      ? { last: 10, before: params.before }
      : { first: 10, after: params.after },
  )

  return (
    <div className="grid gap-6">
      <div>
        <p className="type-mono-meta text-gold-deep">Orders</p>
        <h1 className="type-heading-01 text-ink">Order history</h1>
      </div>
      <OrderHistory orders={orders.items} pageInfo={orders.pageInfo} />
    </div>
  )
}

export default function AccountOrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <Suspense fallback={<AccountLoading />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  )
}
