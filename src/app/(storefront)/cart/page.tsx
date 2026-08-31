import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Section } from '@/components/ui/section'
import { getCartAction } from '@/lib/cart/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCustomerAccountSession } from '@/lib/shopify/customer-account/session'

import { CartLoadingSkeleton } from './_components/loading-skeleton'
import { CartRecommendations } from './_components/recommendations'
import { CartView } from './_components/view'

export const metadata: Metadata = withNoindexRobots({
  title: 'Your Cart',
})

type CartPageProps = {
  searchParams: Promise<{
    checkout?: string
  }>
}

async function CartPageContent({ searchParams }: CartPageProps) {
  const [params, cart] = await Promise.all([searchParams, getCartAction()])
  const shouldLoadAccountSession =
    Boolean(cart) || params.checkout === 'identity-sync-failed'
  const session = shouldLoadAccountSession
    ? await getCustomerAccountSession()
    : null
  const accountContextState =
    params.checkout === 'identity-sync-failed'
      ? 'sync-failed-blocked'
      : session
        ? 'signed-in'
        : null
  const checkoutError =
    params.checkout === 'note-update-failed' ? 'note-update-failed' : null

  return (
    <>
      <CartView
        cart={cart}
        accountContextState={accountContextState}
        checkoutError={checkoutError}
      />
      {cart && cart.totalQuantity > 0 ? (
        <CartRecommendations cart={cart} />
      ) : null}
    </>
  )
}

export default function CartPage({ searchParams }: CartPageProps) {
  return (
    <Section.Root tone="transparent" spacing="compact">
      <Section.Container>
        <h1 className="type-heading-01 font-display mb-6">Your Cart</h1>
        <Suspense fallback={<CartLoadingSkeleton />}>
          <CartPageContent searchParams={searchParams} />
        </Suspense>
      </Section.Container>
    </Section.Root>
  )
}
