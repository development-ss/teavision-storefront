'use client'

import { useEffect, useMemo, useState, type SubmitEvent } from 'react'

import type { ProductVariant } from '@/lib/shopify/types'
import { Button, Price, QuantityStepper, Select } from '@/components/ui'
import {
  type AddToCart,
  useAddToCart,
} from '@/components/product/use-add-to-cart'
import {
  clampQuantity,
  getVariantMaximumQuantity,
  getVariantMinimumQuantity,
  getVariantQuantityIncrement,
} from '@/lib/shopify/quantity-rules'
import { cn } from '@/lib/utils'

type ProductPurchaseFormProps = {
  variants: ProductVariant[]
  productTitle: string
  addToCart?: AddToCart
  onCartChanged?: () => void
  layout?: 'stacked' | 'inline' | 'card'
  showPrice?: boolean
  hideSubmit?: boolean
  /** When false, omits the quantity stepper and submits quantity 1 (CARD-06). Default: true */
  showQuantity?: boolean
  disabled?: boolean
  className?: string
}

function getInitialVariant(
  variants: ProductVariant[],
): ProductVariant | undefined {
  return variants.find((variant) => variant.availableForSale) ?? variants[0]
}

export function ProductPurchaseForm({
  variants,
  productTitle,
  addToCart,
  onCartChanged,
  layout = 'stacked',
  showPrice,
  hideSubmit,
  showQuantity = true,
  disabled = false,
  className,
}: ProductPurchaseFormProps) {
  const initialVariant = getInitialVariant(variants)
  const [selectedVariantId, setSelectedVariantId] = useState(
    () => initialVariant?.id ?? '',
  )
  const [quantity, setQuantity] = useState(() =>
    getVariantMinimumQuantity(initialVariant),
  )
  const { addItem, error, isPending, message, resetFeedback } = useAddToCart({
    addToCart,
    onCartChanged,
  })
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(resetFeedback, 2500)
    return () => clearTimeout(timer)
  }, [message, resetFeedback])

  const justAdded = !!message && !isPending

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.id === selectedVariantId) ??
      variants[0],
    [selectedVariantId, variants],
  )
  const minimumQuantity = getVariantMinimumQuantity(selectedVariant)
  const maximumQuantity = getVariantMaximumQuantity(selectedVariant)
  const quantityIncrement = getVariantQuantityIncrement(selectedVariant)
  const hasAvailableVariant = variants.some(
    (variant) => variant.availableForSale,
  )
  const effectiveQuantity = clampQuantity({
    maximumQuantity,
    minimumQuantity,
    quantityIncrement,
    value: quantity,
  })
  const canAddToCart =
    !disabled &&
    selectedVariant?.availableForSale === true &&
    (maximumQuantity === undefined || maximumQuantity >= minimumQuantity)
  const isVariantSelectDisabled = isPending || disabled || !hasAvailableVariant

  const isInlineLayout = layout === 'inline'
  const isCardLayout = layout === 'card'
  const isCompactLayout = isInlineLayout || isCardLayout

  function handleSelectVariant(nextVariantId: string) {
    const nextVariant =
      variants.find((variant) => variant.id === nextVariantId) ?? variants[0]

    setSelectedVariantId(nextVariantId)
    setQuantity(getVariantMinimumQuantity(nextVariant))
    resetFeedback()
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedVariant || !canAddToCart) return

    addItem(selectedVariant.id, effectiveQuantity)
  }

  if (variants.length === 0) {
    return (
      <div className="border-hairline bg-paper-2 text-ink-soft rounded-sm border border-dashed p-4 text-sm">
        No purchasable variants are currently available.
      </div>
    )
  }

  const variantOptions = variants.map((variant) => (
    <option key={variant.id} value={variant.id}>
      {variant.title}
    </option>
  ))

  return (
    <form
      className={cn(
        'grid min-w-0',
        isCompactLayout ? 'gap-2' : 'gap-3',
        className,
      )}
      onSubmit={handleSubmit}
    >
      {showPrice !== false && (
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          {selectedVariant && (
            <Price
              price={selectedVariant.price}
              size={isCompactLayout ? 'sm' : 'lg'}
              className={cn(isCompactLayout && 'text-ink font-semibold')}
            />
          )}
        </div>
      )}

      {/* PDP and card layouts keep a persistent label above the select. */}
      {!isInlineLayout && (
        <label className={cn('grid', isCardLayout ? 'gap-1' : 'gap-2')}>
          <span
            className={cn(
              'type-caption text-ink-soft',
              isCardLayout && 'font-semibold uppercase',
            )}
          >
            {isCardLayout ? 'Size' : 'Pack size'}
          </span>
          <Select
            name="variantId"
            value={selectedVariantId}
            onChange={(event) => handleSelectVariant(event.currentTarget.value)}
            disabled={isVariantSelectDisabled}
            aria-label={`Select pack size for ${productTitle}`}
            className={cn(isCardLayout && 'min-h-11 px-3 py-2.5 pr-8')}
          >
            {variantOptions}
          </Select>
        </label>
      )}

      <div
        className={cn(
          isInlineLayout
            ? 'grid grid-cols-[7.5rem_minmax(0,1fr)] items-end gap-2 sm:grid-cols-[8rem_7.5rem_7rem] sm:gap-3'
            : isCardLayout
              ? 'grid grid-cols-1 items-end gap-2 sm:grid-cols-[7.5rem_minmax(0,1fr)]'
              : 'flex flex-wrap items-center gap-2',
        )}
      >
        {/* Inline layout: controls align to the bottom of the product image. */}
        {isInlineLayout && (
          <label className="col-span-2 grid min-w-0 gap-1 sm:col-span-1">
            <span className="type-caption text-ink-soft font-semibold uppercase">
              Size
            </span>
            <Select
              name="variantId"
              value={selectedVariantId}
              onChange={(event) =>
                handleSelectVariant(event.currentTarget.value)
              }
              disabled={isVariantSelectDisabled}
              aria-label={`Select pack size for ${productTitle}`}
              className="min-h-10 px-3 pr-8"
            >
              {variantOptions}
            </Select>
          </label>
        )}
        {!hideSubmit && showQuantity && (
          <div
            className={cn(
              'grid gap-1',
              isInlineLayout && 'w-30',
              isCardLayout && 'w-full min-w-0',
            )}
          >
            {isCompactLayout && (
              <span className="type-caption text-ink-soft font-semibold uppercase">
                Product Qty
              </span>
            )}
            <QuantityStepper
              name="quantity"
              value={effectiveQuantity}
              onChange={(nextQuantity) => {
                setQuantity(nextQuantity)
                resetFeedback()
              }}
              min={minimumQuantity}
              max={maximumQuantity}
              step={quantityIncrement}
              disabled={isPending || !canAddToCart}
              label={`Quantity for ${productTitle}`}
            />
          </div>
        )}
        {!hideSubmit && (
          <div
            className={cn(
              isInlineLayout ? 'min-w-0' : 'min-w-36 flex-1 sm:flex-none',
              isCardLayout && 'min-w-0',
            )}
          >
            <Button
              type="submit"
              isLoading={isPending}
              disabled={!canAddToCart || isPending || justAdded}
              variant={justAdded ? 'brand' : 'primary'}
              size={isCompactLayout ? 'sm' : 'md'}
              className="w-full min-w-0"
            >
              {justAdded ? 'Added' : canAddToCart ? 'Add to cart' : 'Sold out'}
            </Button>
          </div>
        )}
      </div>

      <p role="status" className="sr-only">
        {justAdded ? message : ''}
      </p>
      {error && (
        <p role="alert" className="type-body-sm text-danger">
          {error}
        </p>
      )}
    </form>
  )
}
