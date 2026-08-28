import Link from 'next/link'

import { Button, Card } from '@/components/ui'
import type { CustomerAccountDashboard } from '@/lib/shopify/customer-account'

import {
  formatAccountMoney,
  formatAccountOrderDate,
  formatFulfillmentStatus,
  formatOrderStatus,
} from '../../_lib/order-formatting'
import { StatusPill } from '../status-pill'
import { SupportBlock } from '../support-block'

type DashboardProps = {
  dashboard: CustomerAccountDashboard
}

function getDisplayName(dashboard: CustomerAccountDashboard): string {
  const firstName = dashboard.profile?.firstName
  if (firstName) return firstName

  return 'Your account'
}

export function Dashboard({ dashboard }: DashboardProps) {
  const profile = dashboard.profile
  const defaultAddress = dashboard.defaultAddress
  const hasOrders = dashboard.recentOrders.length > 0

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-10">
      <div className="grid min-w-0 gap-6">
        <div className="grid gap-2">
          <p className="type-mono-meta text-gold-deep">Customer account</p>
          <h1 className="type-heading-01 text-ink">
            {getDisplayName(dashboard)}
          </h1>
        </div>

        <Card padding="lg" radius="lg" tone="surface">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="type-heading-05 text-ink">Recent orders</h2>
            <Button href="/account/orders" variant="secondary" size="sm">
              View order history
            </Button>
          </div>

          {dashboard.sectionErrors.orders ? (
            <p
              className="type-body-sm bg-danger-tint text-danger border-danger mb-4 rounded-md border px-3 py-2"
              role="alert"
            >
              {dashboard.sectionErrors.orders}
            </p>
          ) : null}

          {hasOrders ? (
            <ul className="divide-hairline divide-y">
              {dashboard.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/account/orders/${encodeURIComponent(order.id)}`}
                      className="font-display text-ink hover:text-brand focus-visible:ring-ring rounded text-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      {order.name}
                    </Link>
                    <p className="type-body-sm text-ink-soft mt-1">
                      {order.processedAt
                        ? formatAccountOrderDate(order.processedAt)
                        : 'Date unavailable'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusPill
                        label={formatOrderStatus(order.financialStatus)}
                        tone="gold"
                      />
                      <StatusPill
                        label={formatFulfillmentStatus(order.fulfillmentStatus)}
                      />
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="type-mono-meta text-ink-faint">Total</p>
                    <p className="font-display text-ink text-xl">
                      {formatAccountMoney(order.totalPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-paper-2 rounded-lg p-5">
              <h3 className="type-heading-05 text-ink">
                Your account is ready
              </h3>
              <p className="type-body-sm text-ink-soft mt-2">
                Orders placed while signed in will appear here. Browse teas or
                contact us if you need help finding an order.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button href="/collections/all" variant="brand" size="sm">
                  Browse teas
                </Button>
                <Button href="/pages/contact" variant="secondary" size="sm">
                  Contact support
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <aside className="grid gap-5">
        <Card padding="lg" radius="lg" tone="surface">
          <h2 className="type-heading-05 text-ink">Profile</h2>
          <dl className="mt-4 grid gap-3">
            <div>
              <dt className="type-mono-meta text-ink-faint">Email</dt>
              <dd className="type-body-sm text-ink wrap-break-word">
                {profile?.emailAddress ?? 'Unavailable'}
              </dd>
            </div>
          </dl>
          <Button
            href="/account/profile"
            variant="secondary"
            size="sm"
            className="mt-5"
          >
            Edit profile
          </Button>
        </Card>

        <Card padding="lg" radius="lg" tone="surface">
          <h2 className="type-heading-05 text-ink">Default address</h2>
          {dashboard.sectionErrors.addresses ? (
            <p
              className="type-body-sm bg-danger-tint text-danger border-danger mt-3 rounded-md border px-3 py-2"
              role="alert"
            >
              {dashboard.sectionErrors.addresses}
            </p>
          ) : defaultAddress ? (
            <address className="type-body-sm text-ink-soft mt-3 not-italic">
              {defaultAddress.formatted.map((line, index) => (
                <span key={`${line}-${index}`} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : (
            <p className="type-body-sm text-ink-soft mt-3">
              Add a saved address to speed up checkout.
            </p>
          )}
          <Button
            href="/account/addresses"
            variant="secondary"
            size="sm"
            className="mt-5"
          >
            Manage addresses
          </Button>
        </Card>

        <SupportBlock />

        <form action="/account/logout" method="post">
          <Button type="submit" variant="quiet" size="quiet">
            Log out
          </Button>
        </form>
      </aside>
    </div>
  )
}
