import Image from 'next/image'
import Link from 'next/link'
import { Check, Leaf, Truck } from 'lucide-react'

import { Button, Price } from '@/components/ui'
import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'
import {
  getVariantMaximumQuantity,
  getVariantMinimumQuantity,
  getVariantQuantityIncrement,
} from '@/lib/shopify/quantity-rules'
import type { Cart, Money } from '@/lib/shopify/types'

import { CartCheckoutForm } from './checkout-form'
import type { CartAccountContextState } from './account-context'
import { CartLineActions } from './line-actions'
import { CartLineRemove } from './line-remove'
import { TrustSignalList } from './trust-signal-list'

type CartViewProps = {
  accountContextState?: CartAccountContextState
  cart: Cart | null
}

const SAVINGS_EPSILON = 0.005

type CartLine = Cart['lines'][number]
type CartLineDiscountAllocation = CartLine['discountAllocations'][number]

type LineDisplayPricing = {
  unitPrice: Money
  unitCompareAtPrice?: Money
  totalPrice: Money
  totalCompareAtPrice?: Money
}

type CartDisplayPricing = {
  subtotalPrice: Money
  subtotalCompareAtPrice?: Money
  savings: Money | null
}

function parseMoneyAmount(money: Money): number {
  const amount = Number.parseFloat(money.amount)
  return Number.isFinite(amount) ? amount : 0
}

function makeMoney(amount: number, currencyCode: string): Money {
  return {
    amount: Math.max(0, amount).toFixed(2),
    currencyCode,
  }
}

function divideMoney(money: Money, divisor: number): Money {
  if (divisor <= 0) return money

  return makeMoney(parseMoneyAmount(money) / divisor, money.currencyCode)
}

function getSavingsAmount(original: Money, discounted: Money): Money | null {
  if (original.currencyCode !== discounted.currencyCode) return null

  const savings = parseMoneyAmount(original) - parseMoneyAmount(discounted)
  if (savings <= SAVINGS_EPSILON) return null

  return makeMoney(savings, original.currencyCode)
}

function getLineCompareTotal(line: CartLine): Money | undefined {
  return getSavingsAmount(line.cost.subtotalAmount, line.cost.totalAmount)
    ? line.cost.subtotalAmount
    : undefined
}

function getBaseUnitPrice(line: CartLine): Money {
  return (
    line.cost.compareAtAmountPerQuantity ??
    divideMoney(line.cost.subtotalAmount, line.quantity)
  )
}

function getLineDisplayPricing(line: CartLine): LineDisplayPricing {
  const compareAtPrice =
    line.cost.compareAtAmountPerQuantity ?? getBaseUnitPrice(line)
  const lineCompareTotal = getLineCompareTotal(line)
  const totalPrice = line.cost.totalAmount
  const discountedUnitPrice = lineCompareTotal
    ? divideMoney(line.cost.totalAmount, line.quantity)
    : line.cost.amountPerQuantity
  const unitPrice = discountedUnitPrice
  const totalCompareAtPrice = lineCompareTotal
    ? line.cost.subtotalAmount
    : undefined

  return {
    unitPrice,
    unitCompareAtPrice: getSavingsAmount(compareAtPrice, unitPrice)
      ? compareAtPrice
      : undefined,
    totalPrice,
    totalCompareAtPrice,
  }
}

function getNextBulkDiscountPrompt(line: CartLine): {
  quantityNeeded: number
  discountPercent: number
} | null {
  const baseUnitPrice =
    line.cost.compareAtAmountPerQuantity ??
    divideMoney(line.cost.subtotalAmount, line.quantity)
  const baseAmount = parseMoneyAmount(baseUnitPrice)
  if (baseAmount <= 0) return null

  const nextTier = line.merchandise.quantityPriceBreaks
    .filter(
      (tier) =>
        tier.minimumQuantity > line.quantity &&
        tier.price.currencyCode === baseUnitPrice.currencyCode,
    )
    .sort((a, b) => a.minimumQuantity - b.minimumQuantity)
    .find((tier) => parseMoneyAmount(tier.price) < baseAmount - SAVINGS_EPSILON)

  if (!nextTier) return null

  const tierDiscountPercent =
    ((baseAmount - parseMoneyAmount(nextTier.price)) / baseAmount) * 100

  if (tierDiscountPercent <= 0) return null

  return {
    quantityNeeded: nextTier.minimumQuantity - line.quantity,
    discountPercent: tierDiscountPercent,
  }
}

function getCartDisplayPricing(cart: Cart): CartDisplayPricing {
  const subtotalPrice = cart.cost.totalAmount
  const subtotalCompareAtPrice = getSavingsAmount(
    cart.cost.subtotalAmount,
    subtotalPrice,
  )
    ? cart.cost.subtotalAmount
    : undefined

  return {
    subtotalPrice,
    subtotalCompareAtPrice,
    savings: subtotalCompareAtPrice
      ? getSavingsAmount(subtotalCompareAtPrice, subtotalPrice)
      : null,
  }
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-AU', {
    maximumFractionDigits: 1,
  }).format(value)
}

function isBulkDiscountAllocation(
  discount: CartLineDiscountAllocation,
): boolean {
  const title = discount.title?.toLowerCase() ?? ''

  return title.includes('bulk') || title.includes('quantity')
}

export function CartView({ accountContextState = null, cart }: CartViewProps) {
  if (!cart || cart.totalQuantity === 0) {
    return (
      <div className="py-16 text-center sm:py-24">
        <div className="bg-paper-2 mx-auto mb-8 flex size-20 items-center justify-center rounded-2xl">
          <Leaf
            className="text-ink-faint size-10"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
        <h2 className="type-heading-02 text-ink">Your cart is empty</h2>
        <p className="type-body text-ink-soft mx-auto mt-3 max-w-lg">
          Browse our range of 1,000+ teas, herbs, and spices available for
          direct wholesale ordering.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/collections/all" variant="ghost" size="cta">
            Browse teas
          </Button>
        </div>
        <TrustSignalList layout="inline" />
      </div>
    )
  }

  const itemCountLabel =
    cart.totalQuantity === 1 ? '1 item' : `${cart.totalQuantity} items`
  const cartDisplayPricing = getCartDisplayPricing(cart)

  return (
    <>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start xl:gap-10">
        <div className="min-w-0">
          {/* Desktop table header */}
          <div className="text-ink-faint border-hairline hidden border-b pb-3 xl:grid xl:grid-cols-[6rem_minmax(0,1fr)_7rem_10rem_7rem] xl:items-center xl:gap-x-6">
            <span className="type-mono-meta">Photo</span>
            <span className="type-mono-meta">Name</span>
            <span className="type-mono-meta">Price/kg</span>
            <span className="type-mono-meta text-center">Quantity/kg</span>
            <span className="type-mono-meta text-right">Total</span>
          </div>

          <ul
            className="divide-hairline space-y-0 divide-y"
            role="list"
            aria-label="Cart items"
          >
            {cart.lines.map((line) => {
              const product = line.merchandise.product
              const productImage = product.featuredImage
              const productHref = `/products/${product.handle}`
              const variantTitle =
                line.merchandise.title === 'Default Title'
                  ? null
                  : line.merchandise.title
              const hasDiscounts = line.discountAllocations.length > 0
              const lineDisplayPricing = getLineDisplayPricing(line)
              const showDiscountAllocations =
                hasDiscounts &&
                (!lineDisplayPricing.totalCompareAtPrice ||
                  !line.discountAllocations.every(isBulkDiscountAllocation))
              const nextBulkDiscountPrompt = getNextBulkDiscountPrompt(line)

              return (
                <li
                  key={line.id}
                  className="border-hairline flex gap-3.5 border-b py-5 last:border-b-0 xl:grid xl:grid-cols-[6rem_minmax(0,1fr)_7rem_10rem_7rem] xl:items-start xl:gap-x-6"
                >
                  {/* Col 1: Product image */}
                  <Link
                    href={productHref}
                    className="bg-paper-2 focus-visible:ring-ring relative size-19 shrink-0 overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none xl:size-24"
                    aria-label={`View ${product.title}`}
                  >
                    {productImage ? (
                      <Image
                        src={getSizedShopifyImageUrl(productImage.url, 200)}
                        alt=""
                        width={productImage.width ?? 200}
                        height={productImage.height ?? 200}
                        sizes="(min-width: 1280px) 96px, 76px"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span className="block size-full" aria-hidden="true" />
                    )}
                  </Link>

                  {/* Col 2: Name, variant, bulk prompt, discount labels */}
                  <div className="min-w-0 flex-1 xl:flex-none">
                    <h3 className="font-display w-full text-[1.05rem] leading-snug wrap-break-word">
                      <Link
                        href={productHref}
                        className="focus-visible:ring-ring hover:text-brand inline-block max-w-full rounded transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      >
                        {product.title}
                      </Link>
                    </h3>
                    {variantTitle ? (
                      <p className="type-mono-meta text-ink-faint mt-1 wrap-break-word">
                        {variantTitle}
                      </p>
                    ) : null}
                    {/* Unit price: visible on mobile below the name; hidden at xl where it appears in col 3 */}
                    <div className="mt-1 xl:hidden">
                      <Price
                        price={lineDisplayPricing.unitPrice}
                        compareAtPrice={lineDisplayPricing.unitCompareAtPrice}
                        size="sm"
                      />
                    </div>
                    {nextBulkDiscountPrompt ? (
                      <p className="type-body-sm text-gold-deep mt-2 wrap-break-word">
                        Buy {nextBulkDiscountPrompt.quantityNeeded} more and get{' '}
                        {formatPercent(nextBulkDiscountPrompt.discountPercent)}%
                        on each product
                      </p>
                    ) : null}
                    {showDiscountAllocations ? (
                      <div className="mt-1.5 flex flex-col gap-1">
                        {line.discountAllocations.map((discount, index) => (
                          <p
                            key={`${discount.title ?? 'discount'}-${index}-name`}
                            className="type-mono-meta text-brand flex min-w-0 items-center gap-1"
                          >
                            <Check
                              className="size-3 shrink-0"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 wrap-break-word">
                              {discount.title ?? 'Discount'}
                            </span>
                            <span className="inline-flex gap-0.5">
                              <span aria-hidden="true">-</span>
                              <Price
                                price={discount.discountedAmount}
                                size="sm"
                              />
                            </span>
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {/* Mobile: stepper + total inline */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 xl:hidden">
                      <CartLineActions
                        lineId={line.id}
                        maximumQuantity={getVariantMaximumQuantity(
                          line.merchandise,
                        )}
                        minimumQuantity={getVariantMinimumQuantity(
                          line.merchandise,
                        )}
                        productTitle={product.title}
                        quantity={line.quantity}
                        quantityIncrement={getVariantQuantityIncrement(
                          line.merchandise,
                        )}
                      />
                      <Price
                        price={lineDisplayPricing.totalPrice}
                        compareAtPrice={lineDisplayPricing.totalCompareAtPrice}
                        layout="stacked"
                        size="sm"
                        className="shrink-0 items-end"
                      />
                    </div>
                    {/* Remove: quiet text link under the line info per design .cart__remove */}
                    <CartLineRemove
                      lineId={line.id}
                      productTitle={product.title}
                    />
                  </div>

                  {/* Col 3: Unit price (desktop only) */}
                  <div className="hidden xl:block xl:pt-1">
                    <Price
                      price={lineDisplayPricing.unitPrice}
                      compareAtPrice={lineDisplayPricing.unitCompareAtPrice}
                      layout="stacked"
                      size="sm"
                    />
                  </div>

                  {/* Col 4: Quantity stepper (desktop only) */}
                  <div className="hidden xl:flex xl:justify-center xl:pt-0.5">
                    <CartLineActions
                      lineId={line.id}
                      maximumQuantity={getVariantMaximumQuantity(
                        line.merchandise,
                      )}
                      minimumQuantity={getVariantMinimumQuantity(
                        line.merchandise,
                      )}
                      productTitle={product.title}
                      quantity={line.quantity}
                      quantityIncrement={getVariantQuantityIncrement(
                        line.merchandise,
                      )}
                    />
                  </div>

                  {/* Col 5: Line total (desktop only) */}
                  <div className="hidden xl:block xl:pt-1 xl:text-right">
                    <Price
                      price={lineDisplayPricing.totalPrice}
                      compareAtPrice={lineDisplayPricing.totalCompareAtPrice}
                      layout="stacked"
                      size="sm"
                      className="items-end font-bold"
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Packaging note */}
          <p className="type-caption text-ink-soft bg-brand-tint mt-6 rounded-md px-3 py-2.5 leading-snug">
            <span className="font-semibold">Note:</span> When ordering in sizes
            over 1kg, your package may not be packed in individual 1kg bags and
            will instead come in bulk packed bags (2kg 5kg 10kg etc)
          </p>

          {cartDisplayPricing.savings ? (
            <p
              className="type-body bg-ink text-paper mt-4 rounded-md px-4 py-3 text-center font-medium"
              role="status"
            >
              Congratulations! You saved{' '}
              <Price
                price={cartDisplayPricing.savings}
                size="md"
                className="text-paper"
              />{' '}
              by buying in bulk!
            </p>
          ) : null}

          {/* Order notes, terms, and checkout actions */}
          <CartCheckoutForm
            accountContextState={accountContextState}
            cartIdPresent={Boolean(cart.id)}
          />
        </div>

        {/* Order summary sidebar */}
        <aside
          aria-label="Order summary"
          className="bg-card border-hairline rounded-lg border-t p-6 xl:sticky xl:top-24"
        >
          <h2 className="font-display text-ink text-2xl">Order summary</h2>
          <div className="border-hairline mt-5 space-y-3 border-t pt-5">
            <div className="type-body-sm flex justify-between gap-4">
              <span className="text-ink-soft">Items</span>
              <span
                className="text-ink max-w-full flex-wrap justify-end font-medium"
                role="status"
                aria-live="polite"
              >
                {itemCountLabel}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="font-display text-ink text-xl">Grand total</span>
              <Price
                price={cartDisplayPricing.subtotalPrice}
                compareAtPrice={cartDisplayPricing.subtotalCompareAtPrice}
                size="lg"
              />
            </div>
          </div>

          <div className="type-mono-meta text-ink-faint mt-3 flex items-center gap-3">
            <Truck className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Free freight on wholesale orders over $300 · insured &amp; tracked
            </span>
          </div>

          <TrustSignalList layout="stacked" />
        </aside>
      </div>
    </>
  )
}
