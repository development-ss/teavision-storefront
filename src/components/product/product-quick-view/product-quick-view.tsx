'use client'

import { useMemo, useState } from 'react'
import { Eye, ShoppingCart } from 'lucide-react'

import type {
  Money,
  ProductQuickViewDetails,
  ProductSummary,
  ShopifyImage,
  ProductVariant,
} from '@/lib/shopify/types'
import {
  clampQuantity,
  getVariantMaximumQuantity,
  getVariantMinimumQuantity,
  getVariantQuantityIncrement,
} from '@/lib/shopify/quantity-rules'
import {
  getVariantDisplayTitle,
  isPlaceholderVariantTitle,
} from '@/lib/shopify/variant-title'
import {
  Button,
  type ButtonProps,
  Dialog,
  Eyebrow,
  Price,
  QuantityStepper,
  Skeleton,
  StarRating,
  ToggleButton,
} from '@/components/ui'
import { cn } from '@/lib/utils'

import { ProductQuickViewImage } from './product-quick-view-image'
import { type AddToCart, useAddToCart } from '../use-add-to-cart'

type ProductQuickViewProps = {
  product: ProductSummary
  addToCart?: AddToCart
  buttonFullWidth?: boolean
  buttonIcon?: 'cart' | 'eye'
  buttonLabel?: string
  buttonVariant?: NonNullable<ButtonProps['variant']>
  initialProduct?: ProductQuickViewDetails
}

function getInitialVariant(
  variants: ProductVariant[],
): ProductVariant | undefined {
  return variants.find((variant) => variant.availableForSale) ?? variants[0]
}

function getInitialVariantId(variants: ProductVariant[]): string {
  return getInitialVariant(variants)?.id ?? ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMoney(value: unknown): value is Money {
  return (
    isRecord(value) &&
    typeof value.amount === 'string' &&
    typeof value.currencyCode === 'string'
  )
}

function isShopifyImage(value: unknown): value is ShopifyImage {
  return (
    isRecord(value) &&
    typeof value.url === 'string' &&
    (typeof value.altText === 'string' || value.altText === null) &&
    (typeof value.width === 'number' || value.width === null) &&
    (typeof value.height === 'number' || value.height === null)
  )
}

function isProductVariant(value: unknown): value is ProductVariant {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.availableForSale === 'boolean' &&
    isMoney(value.price) &&
    Array.isArray(value.quantityPriceBreaks) &&
    (value.image === undefined ||
      value.image === null ||
      isShopifyImage(value.image))
  )
}

function isProductOption(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    Array.isArray(value.values) &&
    value.values.every((optionValue) => typeof optionValue === 'string')
  )
}

function isQuickViewDetails(value: unknown): value is ProductQuickViewDetails {
  return (
    isRecord(value) &&
    typeof value.description === 'string' &&
    typeof value.handle === 'string' &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    isRecord(value.priceRange) &&
    isMoney(value.priceRange.minVariantPrice) &&
    Array.isArray(value.images) &&
    value.images.every(isShopifyImage) &&
    Array.isArray(value.options) &&
    value.options.every(isProductOption) &&
    Array.isArray(value.variants) &&
    value.variants.every(isProductVariant)
  )
}

export function ProductQuickView({
  addToCart,
  buttonFullWidth = false,
  buttonIcon = 'eye',
  buttonLabel = 'Quick View',
  buttonVariant = 'inverse',
  product,
  initialProduct,
}: ProductQuickViewProps) {
  const [open, setOpen] = useState(false)
  const [productData, setProductData] =
    useState<ProductQuickViewDetails | null>(initialProduct ?? null)
  const [selectedVariantId, setSelectedVariantId] = useState(() =>
    initialProduct ? getInitialVariantId(initialProduct.variants) : '',
  )
  const [quantity, setQuantity] = useState(() =>
    initialProduct
      ? getVariantMinimumQuantity(getInitialVariant(initialProduct.variants))
      : 1,
  )
  const [isLoading, setIsLoading] = useState(false)
  const { addItem, error, isPending, message, reportError, resetFeedback } =
    useAddToCart({
      addToCart,
      getSuccessMessage: () => 'Added to cart',
    })

  const selectedVariant = useMemo(() => {
    if (!productData) return null
    return (
      productData.variants.find(
        (variant) => variant.id === selectedVariantId,
      ) ??
      productData.variants[0] ??
      null
    )
  }, [productData, selectedVariantId])

  const selectedImage =
    selectedVariant?.image ??
    productData?.images[0] ??
    product.featuredImage ??
    null
  const canAddToCart = selectedVariant?.availableForSale === true
  const minimumQuantity = getVariantMinimumQuantity(
    selectedVariant ?? undefined,
  )
  const maximumQuantity = getVariantMaximumQuantity(
    selectedVariant ?? undefined,
  )
  const quantityIncrement = getVariantQuantityIncrement(
    selectedVariant ?? undefined,
  )
  const effectiveQuantity = clampQuantity({
    maximumQuantity,
    minimumQuantity,
    quantityIncrement,
    value: quantity,
  })
  const canUseSelectedVariantQuantity =
    maximumQuantity === undefined || maximumQuantity >= minimumQuantity
  const showVariantSelector =
    productData !== null &&
    (productData.variants.length > 1 ||
      productData.variants.some(
        (variant) => !isPlaceholderVariantTitle(variant.title),
      ))
  const TriggerIcon = buttonIcon === 'cart' ? ShoppingCart : Eye

  async function loadProduct() {
    if (productData || isLoading) return

    setIsLoading(true)
    resetFeedback()

    try {
      const response = await fetch(
        `/api/products/${encodeURIComponent(product.handle)}/quick-view`,
      )

      if (!response.ok) {
        throw new Error('Unable to load product')
      }

      const nextProduct: unknown = await response.json()
      if (!isQuickViewDetails(nextProduct)) {
        throw new Error('Invalid quick-view product')
      }

      setProductData(nextProduct)
      setSelectedVariantId(getInitialVariantId(nextProduct.variants))
      setQuantity(
        getVariantMinimumQuantity(getInitialVariant(nextProduct.variants)),
      )
    } catch {
      reportError('Unable to load product details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleOpen() {
    setOpen(true)
    void loadProduct()
  }

  function handleAddToCart() {
    if (!selectedVariant || !canAddToCart || !canUseSelectedVariantQuantity) {
      return
    }

    addItem(selectedVariant.id, effectiveQuantity)
  }

  function handleSelectVariant(nextVariantId: string) {
    const nextVariant =
      productData?.variants.find((variant) => variant.id === nextVariantId) ??
      productData?.variants[0]

    setSelectedVariantId(nextVariantId)
    setQuantity(getVariantMinimumQuantity(nextVariant))
    resetFeedback()
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
    resetFeedback()
  }

  return (
    <>
      <Button
        type="button"
        variant={buttonVariant}
        size="sm"
        className={cn(buttonFullWidth && 'w-full')}
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <TriggerIcon className="size-4" aria-hidden="true" />
        {buttonLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Quick View"
        description={product.title}
        className="sm:max-h-[88vh]"
      >
        {isLoading && !productData ? (
          <div
            className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
            role="status"
            aria-live="polite"
            aria-label="Loading product details"
          >
            <span className="sr-only">Loading product details…</span>
            <Skeleton className="aspect-square rounded-lg" />
            <div className="grid content-start gap-4">
              <Skeleton className="h-3 w-48 rounded-full" />
              <Skeleton className="h-10 w-4/5" />
              <Skeleton className="h-28 rounded-lg" />
            </div>
          </div>
        ) : productData ? (
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:gap-7">
            <div className="bg-paper-2 relative mx-auto aspect-[1/1.05] w-full max-w-xl overflow-hidden rounded-lg">
              <ProductQuickViewImage
                image={selectedImage}
                title={productData.title}
              />
            </div>

            <div className="text-ink grid content-start gap-5">
              <div className="grid gap-3">
                <Eyebrow rule={false}>Quick view</Eyebrow>
                <h3 className="font-display text-[clamp(1.75rem,3vw,2.35rem)] leading-[1.04] font-medium">
                  {productData.title}
                </h3>
                {productData.rating !== undefined && (
                  <StarRating
                    rating={productData.rating}
                    count={productData.reviewCount}
                    size="sm"
                  />
                )}
                <div>
                  {selectedVariant ? (
                    <Price
                      price={selectedVariant.price}
                      size="lg"
                      priceClassName="text-[1.8rem] font-normal"
                    />
                  ) : (
                    <Price
                      price={productData.priceRange.minVariantPrice}
                      size="lg"
                      priceClassName="text-[1.8rem] font-normal"
                    />
                  )}
                </div>
              </div>

              {productData.description && (
                <p className="text-ink-soft line-clamp-5 text-[1.02rem] leading-6">
                  {productData.description}
                </p>
              )}

              {showVariantSelector && (
                <fieldset className="grid gap-3">
                  <legend className="type-mono-meta text-ink-faint">
                    Pack size
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {productData.variants.map((variant) => {
                      const displayTitle = getVariantDisplayTitle(variant.title)

                      return (
                        <ToggleButton
                          key={variant.id}
                          pressed={selectedVariantId === variant.id}
                          disabled={isPending}
                          aria-label={`${displayTitle}${!variant.availableForSale ? ', sold out' : ''}`}
                          className={cn(
                            'border-hairline bg-card text-ink hover:border-ink-faint aria-pressed:border-brand aria-pressed:bg-brand-tint aria-pressed:text-ink min-w-23 flex-col rounded-sm border-[1.5px] px-4.5 py-3 text-center transition-colors',
                            selectedVariantId === variant.id &&
                              'border-brand bg-brand-tint',
                          )}
                          onClick={() => handleSelectVariant(variant.id)}
                        >
                          <span className="text-sm font-bold">
                            {displayTitle}
                          </span>
                          <Price
                            price={variant.price}
                            size="sm"
                            className={cn(
                              'text-ink-faint mt-1 font-mono text-[11px]',
                              selectedVariantId === variant.id && 'text-brand',
                            )}
                          />
                        </ToggleButton>
                      )
                    })}
                  </div>
                </fieldset>
              )}

              <div className="grid gap-2">
                <span className="type-mono-meta text-ink-faint">Quantity</span>
                <QuantityStepper
                  value={effectiveQuantity}
                  onChange={handleQuantityChange}
                  min={minimumQuantity}
                  max={maximumQuantity}
                  step={quantityIncrement}
                  disabled={isPending || !canAddToCart}
                  label={`Quantity for ${productData.title}`}
                  className="justify-self-start"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="brand"
                  size="lg"
                  isLoading={isPending}
                  disabled={
                    !canAddToCart || !canUseSelectedVariantQuantity || isPending
                  }
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  {canAddToCart ? 'Add to Cart' : 'Sold Out'}
                </Button>
                <Button
                  href={`/products/${productData.handle}`}
                  variant="secondary"
                  size="lg"
                >
                  More Info
                </Button>
              </div>

              {message && (
                <p role="status" className="type-caption text-brand">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="type-caption text-danger">
                  {error}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-5">
            <p role="alert" className="type-body-sm text-danger">
              {error ?? 'Product details are unavailable.'}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void loadProduct()}
            >
              Try again
            </Button>
          </div>
        )}
      </Dialog>
    </>
  )
}
