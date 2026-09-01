'use client'

import { useId, useState, type ReactNode } from 'react'
import { Leaf, ShieldCheck, Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { QuantityStepper } from '@/components/ui/quantity-stepper'
import { ToggleButton } from '@/components/ui/toggle-button'
import type {
  BulkPricingTier,
  ProductOption,
  ProductVariant,
  VolumeDiscountTier,
} from '@/lib/shopify/types'
import {
  alignTiersToQuantityRule,
  clampQuantity,
  getVariantMaximumQuantity,
  getVariantMinimumQuantity,
  getVariantQuantityIncrement,
} from '@/lib/shopify/quantity-rules'
import {
  getVariantDisplayTitle,
  isPlaceholderVariantTitle,
} from '@/lib/shopify/variant-title'
import { cn } from '@/lib/utils'

import { BulkSavings } from '../bulk-savings'
import { type AddToCart, useAddToCart } from '../use-add-to-cart'

type ProductFormProps = {
  variants: ProductVariant[]
  options: ProductOption[]
  volumeDiscountTiers?: readonly VolumeDiscountTier[]
  initialVariantId?: string
  onVariantChange?: (variantId: string) => void
  addToCart?: AddToCart
  onCartChanged?: () => void
  /* Rendered between the bulk-savings block and the availability line so the
     description keeps production's order while availability stays variant-driven */
  descriptionSlot?: ReactNode
  className?: string
}

type PendingAdd = {
  source: 'primary' | 'bulk'
  quantity: number
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
  volumeDiscountTiers = [],
  initialVariantId,
  onVariantChange,
  addToCart,
  onCartChanged,
  descriptionSlot,
  className,
}: ProductFormProps) {
  const quantityErrorId = useId()
  const quantityStatusId = useId()
  const quantityLimitId = useId()
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    getInitialSelectedVariantId(variants, initialVariantId),
  )
  const [quantity, setQuantity] = useState(1)
  const [selectedBulkTierQuantity, setSelectedBulkTierQuantity] = useState<
    number | null
  >(null)
  const [pendingAdd, setPendingAdd] = useState<PendingAdd | null>(null)
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
  // Native B2B price breaks take precedence. Public tiers mirror the active
  // Hulk Shopify Function; the cart still renders only Shopify-confirmed costs.
  const rawSelectedBulkPricingTiers: readonly (
    | BulkPricingTier
    | VolumeDiscountTier
  )[] =
    selectedVariant && selectedVariant.quantityPriceBreaks.length > 0
      ? selectedVariant.quantityPriceBreaks
      : volumeDiscountTiers
  const selectedBulkPricingTiers = alignTiersToQuantityRule(
    rawSelectedBulkPricingTiers,
    { maximumQuantity, minimumQuantity, quantityIncrement },
  )
  const activeBulkTier =
    selectedBulkPricingTiers
      .filter((tier) => effectiveQuantity >= tier.minimumQuantity)
      .sort((a, b) => b.minimumQuantity - a.minimumQuantity)[0] ?? null
  const bulkDealQuantity =
    selectedBulkTierQuantity ?? activeBulkTier?.minimumQuantity ?? null
  const showVariantSelector =
    variants.length > 1 ||
    variants.some((variant) => !isPlaceholderVariantTitle(variant.title))

  function canUseQuantity(nextQuantity: number): boolean {
    if (maximumQuantity !== undefined && nextQuantity > maximumQuantity) {
      reportError('Maximum quantity available reached.')
      return false
    }

    return true
  }

  function addQuantityToCart(
    nextQuantity: number,
    source: PendingAdd['source'],
  ) {
    if (!canAddToCart || !selectedVariant || !canUseSelectedVariantQuantity) {
      return
    }
    if (!canUseQuantity(nextQuantity)) return

    setPendingAdd({ source, quantity: nextQuantity })
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
    onVariantChange?.(nextVariantId)
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

    addQuantityToCart(bulkDealQuantity, 'bulk')
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
              const displayTitle = getVariantDisplayTitle(v.title)

              return (
                <ToggleButton
                  key={v.id}
                  pressed={isSelected}
                  disabled={!v.availableForSale}
                  aria-label={`${displayTitle}${!v.availableForSale ? ', out of stock' : ''}`}
                  className={cn(
                    'border-hairline bg-card text-ink hover:border-ink-faint aria-pressed:border-brand aria-pressed:bg-brand-tint aria-pressed:text-ink min-w-23 flex-col rounded-sm border-[1.5px] px-4.5 py-3.25 text-center transition-colors',
                    isSelected && 'border-brand bg-brand-tint',
                  )}
                  onClick={() => handleSelectVariant(v.id)}
                >
                  <span className="text-sm font-bold">{displayTitle}</span>
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
        {maximumQuantity !== undefined ? (
          <p
            id={quantityLimitId}
            className="type-caption text-ink-soft sm:hidden"
          >
            Maximum available: {maximumQuantity}
          </p>
        ) : null}
        <QuantityStepper
          value={effectiveQuantity}
          onChange={handleQuantityChange}
          onLimitReached={() =>
            reportError('Maximum quantity available reached.')
          }
          min={minimumQuantity}
          max={maximumQuantity}
          step={quantityIncrement}
          disabled={!canAddToCart || isPending}
          describedBy={[
            error ? quantityErrorId : null,
            maximumQuantity !== undefined ? quantityLimitId : null,
          ]
            .filter((value): value is string => Boolean(value))
            .join(' ')}
          shape="rectangle"
        />

        <div className="min-w-0 flex-1">
          <Button
            variant="brand"
            onClick={() => addQuantityToCart(effectiveQuantity, 'primary')}
            isLoading={isPending && pendingAdd?.source === 'primary'}
            disabled={
              !canAddToCart || !canUseSelectedVariantQuantity || isPending
            }
            size="lg"
            className="w-full"
          >
            {isPending && pendingAdd?.source === 'primary'
              ? 'Adding…'
              : canAddToCart
                ? 'Add to Cart'
                : 'Sold Out'}
          </Button>
        </div>
      </div>

      {maximumQuantity !== undefined ? (
        <p
          id={`${quantityLimitId}-desktop`}
          className="type-caption text-ink-soft hidden sm:block"
        >
          Maximum available: {maximumQuantity}
        </p>
      ) : null}

      {error && (
        <p
          id={quantityErrorId}
          role="alert"
          className="type-caption text-danger"
        >
          {error}
        </p>
      )}
      <p
        id={quantityStatusId}
        role="status"
        className={cn('type-caption text-brand', !message && 'sr-only')}
      >
        {isPending
          ? `Adding ${pendingAdd?.quantity ?? effectiveQuantity} to cart`
          : (message ?? '')}
      </p>

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
          maximumQuantity={maximumQuantity}
          canAddToCart={canAddToCart && bulkDealQuantity !== null}
          disabled={isPending}
          isPending={isPending && pendingAdd?.source === 'bulk'}
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
