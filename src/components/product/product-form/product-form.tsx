'use client'

import { useId, useState, type ReactNode } from 'react'
import { Leaf, ShieldCheck, Truck } from 'lucide-react'

import { Button, Price, QuantityStepper, ToggleButton } from '@/components/ui'
import type {
  BulkPricingTier,
  ProductOption,
  ProductVariant,
} from '@/lib/shopify/types'
import {
  clampQuantity,
  getVariantMaximumQuantity,
  getVariantMinimumQuantity,
  getVariantQuantityIncrement,
} from '@/lib/shopify/quantity-rules'
import { cn } from '@/lib/utils'

import { BulkSavings } from '../bulk-savings'
import { type AddToCart, useAddToCart } from '../use-add-to-cart'

type ProductFormProps = {
  variants: ProductVariant[]
  options: ProductOption[]
  bulkPricingTiers?: BulkPricingTier[]
  initialVariantId?: string
  addToCart?: AddToCart
  onCartChanged?: () => void
  /* Rendered between the bulk-savings block and the availability line so the
     description keeps production's order while availability stays variant-driven */
  descriptionSlot?: ReactNode
  className?: string
}

function getAddToCartErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    error.message.includes('Maximum quantity available reached.')
  ) {
    return 'Maximum quantity available reached.'
  }

  return 'Unable to add to cart. Please try again.'
}

function getNumericVariantId(variantId: string): string {
  return variantId.replace('gid://shopify/ProductVariant/', '')
}

function getInitialSelectedVariantId(
  variants: ProductVariant[],
  initialVariantId?: string,
): string {
  const normalizedInitialVariantId = initialVariantId?.trim()
  const initialVariant = normalizedInitialVariantId
    ? variants.find(
        (variant) =>
          variant.id === normalizedInitialVariantId ||
          getNumericVariantId(variant.id) === normalizedInitialVariantId,
      )
    : undefined

  return (
    initialVariant?.id ??
    variants.find((variant) => variant.availableForSale)?.id ??
    variants[0]?.id ??
    ''
  )
}

export function ProductForm({
  variants,
  options,
  bulkPricingTiers = [],
  initialVariantId,
  addToCart,
  onCartChanged,
  descriptionSlot,
  className,
}: ProductFormProps) {
  const quantityErrorId = useId()
  const quantityStatusId = useId()
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    getInitialSelectedVariantId(variants, initialVariantId),
  )
  const [quantity, setQuantity] = useState(1)
  const [selectedBulkTierQuantity, setSelectedBulkTierQuantity] = useState<
    number | null
  >(null)
  const { addItem, error, isPending, message, reportError, resetFeedback } =
    useAddToCart({
      addToCart,
      getErrorMessage: getAddToCartErrorMessage,
      onCartChanged,
    })

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const canAddToCart = selectedVariant?.availableForSale === true
  const minimumQuantity = getVariantMinimumQuantity(selectedVariant)
  const maximumQuantity = getVariantMaximumQuantity(selectedVariant)
  const quantityIncrement = getVariantQuantityIncrement(selectedVariant)
  const effectiveQuantity = clampQuantity({
    maximumQuantity,
    minimumQuantity,
    quantityIncrement,
    value: quantity,
  })
  const canUseSelectedVariantQuantity =
    maximumQuantity === undefined || maximumQuantity >= minimumQuantity
  const selectedBulkPricingTiers =
    selectedVariant && selectedVariant.quantityPriceBreaks.length > 0
      ? selectedVariant.quantityPriceBreaks
      : bulkPricingTiers
  const activeBulkTier =
    selectedBulkPricingTiers
      .filter((tier) => effectiveQuantity >= tier.minimumQuantity)
      .sort((a, b) => b.minimumQuantity - a.minimumQuantity)[0] ?? null
  const bulkDealQuantity =
    selectedBulkTierQuantity ?? activeBulkTier?.minimumQuantity ?? null
  const showVariantSelector =
    variants.length > 1 ||
    variants.some((variant) => variant.title !== 'Default Title')

  function canUseQuantity(nextQuantity: number): boolean {
    if (maximumQuantity !== undefined && nextQuantity > maximumQuantity) {
      reportError('Maximum quantity available reached.')
      return false
    }

    return true
  }

  function addQuantityToCart(
    nextQuantity: number,
    { enforceMaximumQuantity = true } = {},
  ) {
    if (!canAddToCart || !selectedVariant || !canUseSelectedVariantQuantity) {
      return
    }
    if (enforceMaximumQuantity && !canUseQuantity(nextQuantity)) return

    addItem(selectedVariant.id, nextQuantity)
  }

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(
      clampQuantity({
        maximumQuantity,
        minimumQuantity,
        quantityIncrement,
        value: nextQuantity,
      }),
    )
    setSelectedBulkTierQuantity(null)
    resetFeedback()
  }

  function handleSelectVariant(nextVariantId: string) {
    const nextVariant = variants.find((variant) => variant.id === nextVariantId)

    setSelectedVariantId(nextVariantId)
    setQuantity(getVariantMinimumQuantity(nextVariant))
    setSelectedBulkTierQuantity(null)
    resetFeedback()
  }

  function handleSelectBulkTier(nextQuantity: number) {
    setSelectedBulkTierQuantity(nextQuantity)
    resetFeedback()
  }

  function handleGrabDeal() {
    if (bulkDealQuantity === null) return

    addQuantityToCart(bulkDealQuantity, { enforceMaximumQuantity: false })
  }

  if (variants.length === 0) {
    return (
      <div
        className={cn(
          'border-hairline text-ink-faint rounded-sm border border-dashed p-4 text-sm',
          className,
        )}
      >
        No variants available
      </div>
    )
  }

  return (
    <div className={cn('flex min-w-0 flex-col gap-6', className)}>
      {showVariantSelector && (
        <fieldset className="min-w-0">
          <legend className="type-mono-meta text-ink-faint mb-3">
            {options[0]?.name ?? 'Option'}
          </legend>
          <div className="flex min-w-0 flex-wrap gap-2.5">
            {variants.map((v) => {
              const isSelected = selectedVariantId === v.id

              return (
                <ToggleButton
                  key={v.id}
                  pressed={isSelected}
                  disabled={!v.availableForSale}
                  aria-label={`${v.title}${!v.availableForSale ? ', out of stock' : ''}`}
                  className={cn(
                    'border-hairline bg-card text-ink hover:border-ink-faint aria-pressed:border-brand aria-pressed:bg-brand-tint aria-pressed:text-ink min-w-23 flex-col rounded-sm border-[1.5px] px-4.5 py-3.25 text-center transition-colors',
                    isSelected && 'border-brand bg-brand-tint',
                  )}
                  onClick={() => handleSelectVariant(v.id)}
                >
                  <span className="text-sm font-bold">{v.title}</span>
                  <Price
                    price={v.price}
                    size="sm"
                    className={cn(
                      'text-ink-faint mt-1 font-mono text-[11px]',
                      isSelected && 'text-brand',
                    )}
                  />
                </ToggleButton>
              )
            })}
          </div>
        </fieldset>
      )}

      <div className="flex min-w-0 flex-col gap-3">
        {selectedVariant && (
          <>
            <div className="flex flex-wrap items-baseline gap-2">
              <Price
                price={selectedVariant.price}
                size="lg"
                priceClassName="text-[1.6rem] font-normal"
              />
              <span className="text-ink-faint font-mono text-[11px] tracking-[0.06em] uppercase">
                selected pack
              </span>
            </div>
          </>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
        <QuantityStepper
          value={effectiveQuantity}
          onChange={handleQuantityChange}
          min={minimumQuantity}
          max={maximumQuantity}
          step={quantityIncrement}
          disabled={!canAddToCart || isPending}
          describedBy={error ? quantityErrorId : undefined}
          shape="rectangle"
        />

        <div className="min-w-0 flex-1">
          <Button
            variant="brand"
            onClick={() => addQuantityToCart(effectiveQuantity)}
            isLoading={isPending}
            disabled={
              !canAddToCart || !canUseSelectedVariantQuantity || isPending
            }
            size="lg"
            className="w-full"
          >
            {canAddToCart ? 'Add to Cart' : 'Sold Out'}
          </Button>
        </div>
      </div>

      {error && (
        <p
          id={quantityErrorId}
          role="alert"
          className="type-caption text-danger"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          id={quantityStatusId}
          role="status"
          className="type-caption text-brand"
        >
          {message}
        </p>
      )}

      {/* Assurance row — design specifies 18px gap above (vs form gap-6=24px), so -6px offset */}
      <div className="border-hairline -mt-1.5 flex flex-wrap gap-x-6.5 gap-y-3.5 border-y py-5">
        {[
          { icon: Truck, label: 'Freight-insured and tracked' },
          { icon: Leaf, label: 'Air-tight, resealable packing' },
          { icon: ShieldCheck, label: 'HACCP food-safety program' },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="text-ink-soft flex items-center gap-2.25 text-[0.86rem]"
          >
            <Icon aria-hidden="true" className="text-brand size-4" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {selectedVariant && (
        <BulkSavings
          tiers={selectedBulkPricingTiers}
          basePrice={selectedVariant.price}
          selectedQuantity={effectiveQuantity}
          selectedTierQuantity={selectedBulkTierQuantity}
          canAddToCart={canAddToCart && bulkDealQuantity !== null}
          isPending={isPending}
          onGrabDeal={handleGrabDeal}
          onSelectTier={handleSelectBulkTier}
          className="mt-0.5"
        />
      )}

      {descriptionSlot}

      {selectedVariant && (
        <p
          className={cn(
            'type-caption',
            canAddToCart ? 'text-brand' : 'text-danger',
          )}
        >
          {canAddToCart
            ? 'In stock! Usually ships within 24 hours.'
            : 'Sorry! This product is currently out of stock.'}
        </p>
      )}
    </div>
  )
}
