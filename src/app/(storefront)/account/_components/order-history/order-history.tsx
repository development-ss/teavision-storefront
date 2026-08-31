import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import type {
  CustomerAccountOrder,
  CustomerAccountPageInfo,
} from '@/lib/shopify/customer-account/types'

import {
  formatAccountMoney,
  formatAccountOrderDate,
  formatFulfillmentStatus,
  formatOrderStatus,
} from '../../_lib/order-formatting'
import { StatusPill } from '../status-pill'

type OrderHistoryProps = {
  orders: CustomerAccountOrder[]
  pageInfo: CustomerAccountPageInfo
}

function getOrderHref(orderId: string): string {
  return `/account/orders/${encodeURIComponent(orderId)}`
}

export function OrderHistory({ orders, pageInfo }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <Card padding="lg" radius="lg" tone="surface" className="text-center">
        <h2 className="type-heading-05 text-ink">Your account is ready</h2>
        <p className="type-body-sm text-ink-soft mx-auto mt-2 max-w-lg">
          Orders placed while signed in will appear here. Browse teas or contact
          us if you need help finding an order.
        </p>
      </Card>
    )
  }

  const showPagination = pageInfo.hasNextPage || pageInfo.hasPreviousPage
  const currentPage = pageInfo.hasPreviousPage ? 2 : 1

  return (
    <div className="grid gap-5">
      <Card padding="none" radius="lg" tone="surface" overflow="hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left">
            <thead className="bg-paper-2 text-ink-faint type-mono-meta">
              <tr>
                <th scope="col" className="px-5 py-3">
                  Order
                </th>
                <th scope="col" className="px-5 py-3">
                  Date
                </th>
                <th scope="col" className="px-5 py-3">
                  Payment
                </th>
                <th scope="col" className="px-5 py-3">
                  Fulfillment
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Total
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-hairline divide-y">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-display px-5 py-4 text-lg">
                    {order.name}
                  </td>
                  <td className="text-ink-soft px-5 py-4">
                    {order.processedAt
                      ? formatAccountOrderDate(order.processedAt)
                      : 'Unavailable'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill
                      label={formatOrderStatus(order.financialStatus)}
                      tone="gold"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill
                      label={formatFulfillmentStatus(order.fulfillmentStatus)}
                    />
                  </td>
                  <td className="font-display px-5 py-4 text-right">
                    {formatAccountMoney(order.totalPrice)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={getOrderHref(order.id)}
                      className="type-label text-brand hover:text-brand-deep focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      View order
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-hairline divide-y md:hidden">
          {orders.map((order) => (
            <li key={order.id} className="grid gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="type-mono-meta text-ink-faint">Order</p>
                  <p className="font-display text-ink text-xl">{order.name}</p>
                </div>
                <Link
                  href={getOrderHref(order.id)}
                  className="type-label text-brand hover:text-brand-deep focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  View order
                </Link>
              </div>
              <dl className="grid gap-3">
                <div className="flex justify-between gap-4">
                  <dt className="type-mono-meta text-ink-faint">Date</dt>
                  <dd className="text-ink-soft text-right">
                    {order.processedAt
                      ? formatAccountOrderDate(order.processedAt)
                      : 'Unavailable'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="type-mono-meta text-ink-faint">Payment</dt>
                  <dd>
                    <StatusPill
                      label={formatOrderStatus(order.financialStatus)}
                      tone="gold"
                    />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="type-mono-meta text-ink-faint">Fulfillment</dt>
                  <dd>
                    <StatusPill
                      label={formatFulfillmentStatus(order.fulfillmentStatus)}
                    />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="type-mono-meta text-ink-faint">Total</dt>
                  <dd className="font-display text-ink">
                    {formatAccountMoney(order.totalPrice)}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Card>

      {showPagination ? (
        <Pagination
          currentPage={currentPage}
          totalPages={2}
          aria-label="Order history pagination"
          buildPageHref={(page) =>
            page <= 1
              ? `/account/orders?before=${encodeURIComponent(pageInfo.startCursor ?? '')}`
              : `/account/orders?after=${encodeURIComponent(pageInfo.endCursor ?? '')}`
          }
        />
      ) : null}
    </div>
  )
}
