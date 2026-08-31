import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CustomerAccountOrder } from '@/lib/shopify/customer-account/types'

import {
  formatAccountMoney,
  formatAccountOrderDate,
  formatFulfillmentStatus,
  formatOrderStatus,
} from '../../_lib/order-formatting'
import { StatusPill } from '../status-pill'

type OrderDetailProps = {
  order: CustomerAccountOrder
}

export function OrderDetail({ order }: OrderDetailProps) {
  const trackingLinks = order.fulfillments.flatMap((fulfillment) =>
    fulfillment.trackingInfo.filter((tracking) => tracking.url),
  )

  return (
    <div className="grid gap-6">
      <Card padding="lg" radius="lg" tone="surface">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div>
            <p className="type-mono-meta text-gold-deep">Order detail</p>
            <h1 className="type-heading-01 text-ink">{order.name}</h1>
            <p className="type-body-sm text-ink-soft mt-2">
              {order.processedAt
                ? formatAccountOrderDate(order.processedAt)
                : 'Order date unavailable'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <StatusPill
              label={formatOrderStatus(order.financialStatus)}
              tone="gold"
            />
            <StatusPill
              label={formatFulfillmentStatus(order.fulfillmentStatus)}
            />
          </div>
        </div>
      </Card>

      <Card padding="lg" radius="lg" tone="surface">
        <h2 className="type-heading-05 text-ink">Line items</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="type-mono-meta text-ink-faint border-hairline border-b">
              <tr>
                <th scope="col" className="py-3 pr-4">
                  Item
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Quantity
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  Unit price
                </th>
                <th scope="col" className="py-3 pl-4 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-hairline divide-y">
              {order.lineItems.map((lineItem) => (
                <tr key={`${lineItem.title}-${lineItem.quantity}`}>
                  <td className="text-ink py-4 pr-4">{lineItem.title}</td>
                  <td className="text-ink-soft px-4 py-4 text-right">
                    {lineItem.quantity}
                  </td>
                  <td className="text-ink-soft px-4 py-4 text-right">
                    {formatAccountMoney(lineItem.unitPrice)}
                  </td>
                  <td className="font-display text-ink py-4 pl-4 text-right">
                    {formatAccountMoney(lineItem.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="font-display text-ink mt-5 text-right text-2xl">
          {formatAccountMoney(order.totalPrice)}
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding="lg" radius="lg" tone="surface">
          <h2 className="type-heading-05 text-ink">Shipping address</h2>
          {order.shippingAddress ? (
            <address className="type-body-sm text-ink-soft mt-3 not-italic">
              {order.shippingAddress.formatted.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : (
            <p className="type-body-sm text-ink-soft mt-3">
              Shipping address is unavailable for this order.
            </p>
          )}
        </Card>

        <Card padding="lg" radius="lg" tone="surface">
          <h2 className="type-heading-05 text-ink">Tracking</h2>
          {trackingLinks.length > 0 ? (
            <ul className="mt-3 grid gap-2">
              {trackingLinks.map((tracking) => (
                <li key={tracking.url}>
                  <a
                    href={tracking.url ?? undefined}
                    className="type-label text-brand hover:text-brand-deep focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    {tracking.number ?? 'Track shipment'}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="type-body-sm text-ink-soft mt-3">
              Tracking will appear here when Shopify provides it.
            </p>
          )}
          {order.statusPageUrl ? (
            <Button
              href={order.statusPageUrl}
              variant="secondary"
              size="sm"
              className="mt-5"
            >
              View Shopify order status
            </Button>
          ) : null}
        </Card>
      </div>

      <Card padding="lg" radius="lg" tone="sunken">
        <p className="type-body-sm text-ink-soft">
          This account shows orders tied to the signed-in Shopify customer.
          Contact us if you need help with a guest order.
        </p>
        <Button
          href="/pages/contact"
          variant="secondary"
          size="sm"
          className="mt-4"
        >
          Contact support
        </Button>
      </Card>
    </div>
  )
}
