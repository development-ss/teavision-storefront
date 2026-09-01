import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Section } from '@/components/ui/section'
import { getCartAction } from '@/lib/cart/actions'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { getCustomerAccountIdentity } from '@/lib/shopify/customer-account/operations'
import { getCustomerAccountSession } from '@/lib/shopify/customer-account/session'
import {
  getProduct,
  PRODUCT_DETAIL_CACHE_VERSION,
} from '@/lib/shopify/operations/product'
import { getHulkVolumeDiscountTiers } from '@/lib/shopify/operations/hulk-volume-discounts'
import type { Cart, VolumeDiscountTier } from '@/lib/shopify/types'

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

async function getCartVolumeDiscountTiers(
  cart: Cart | null,
): Promise<Record<string, readonly VolumeDiscountTier[]>> {
  if (!cart) return {}

  const handles = [
    ...new Set(cart.lines.map((line) => line.merchandise.product.handle)),
  ]
  const products = await Promise.all(
    handles.map((handle) => getProduct(handle, PRODUCT_DETAIL_CACHE_VERSION)),
  )
  const tiers = await Promise.all(
    products.map((product) =>
      product
        ? getHulkVolumeDiscountTiers({
            productId: product.id,
            variantIds: product.variants.map((variant) => variant.id),
            collectionIds: product.collectionIds ?? [],
            tags: product.tags,
          })
        : [],
    ),
  )

  return Object.fromEntries(
    handles.map((handle, index) => [handle, tiers[index] ?? []]),
  )
}

async function CartPageContent({ searchParams }: CartPageProps) {
  const [params, cart] = await Promise.all([searchParams, getCartAction()])
  const shouldLoadAccountSession =
    Boolean(cart) || params.checkout === 'identity-sync-failed'
  const [session, volumeDiscountTiersByHandle] = await Promise.all([
    shouldLoadAccountSession ? getCustomerAccountSession() : null,
    getCartVolumeDiscountTiers(cart),
  ])
  const accountIdentity = session
    ? await getCustomerAccountIdentity(session).catch(() => null)
    : null
  const accountEmail =
    session && accountIdentity?.customerId === session.customerId
      ? accountIdentity.email
      : null
  const accountContextState =
    params.checkout === 'identity-sync-failed'
      ? 'sync-failed-blocked'
      : session
        ? 'signed-in'
        : cart
          ? 'guest'
          : null
  const checkoutError =
    params.checkout === 'note-update-failed' ? 'note-update-failed' : null

  return (
    <>
      <CartView
        cart={cart}
        accountContextState={accountContextState}
        accountEmail={accountEmail}
        checkoutError={checkoutError}
        volumeDiscountTiersByHandle={volumeDiscountTiersByHandle}
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
