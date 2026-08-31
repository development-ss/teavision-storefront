import Image from 'next/image'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

import type {
  CollectionProductSummary,
  ProductSummary,
} from '@/lib/shopify/types'
import { Badge } from '@/components/ui/badge'
import { Price } from '@/components/ui/price'
import { StarRating } from '@/components/ui/star-rating'
import { getVisibleProductReviewSummary } from '@/lib/reviews/summary'
import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'
import { ProductQuickView } from '@/components/product/product-quick-view'
import { cn } from '@/lib/utils'

import { ProductPurchaseForm } from './product-purchase-form'

// Tag heuristics for certification badges (CARD-03)
function getCertBadges(tags: string[]): { organic: boolean; gold: boolean } {
  const organic = tags.some((t) =>
    /\b(organic|aco|usda|certified organic|acoCertified)\b/i.test(t),
  )
  const gold = tags.some((t) => /\b(award|gold award|award-winning)\b/i.test(t))
  return { organic, gold }
}

// Recommendation feeds (Shopify recommendations, Searchanise) only supply a
// ProductSummary — collection extras degrade gracefully when absent.
type ProductCardProduct = ProductSummary &
  Partial<Pick<CollectionProductSummary, 'productType' | 'tags' | 'variants'>>

type ProductCardProps = {
  product: ProductCardProduct
  priority?: boolean
  layout?: 'grid' | 'list'
  className?: string
}

export function ProductCard({
  product,
  priority = false,
  layout = 'grid',
  className,
}: ProductCardProps) {
  const productUrl = `/products/${product.handle}`
  const isSoldOut = product.availableForSale === false
  const isListLayout = layout === 'list'
  const variants = product.variants ?? []
  const hasKnownVariants = variants.length > 0

  const { organic, gold } = getCertBadges(product.tags ?? [])
  const featuredImage = product.featuredImage
  const visibleReviewSummary = getVisibleProductReviewSummary(product)
  const purchaseContent = hasKnownVariants ? (
    <ProductPurchaseForm
      variants={variants}
      productTitle={product.title}
      disabled={isSoldOut}
      layout={isListLayout ? 'inline' : 'card'}
      className={cn(!isListLayout && 'mt-auto pt-3')}
    />
  ) : (
    <div
      className={cn(
        'flex items-baseline gap-2',
        !isListLayout && 'mt-auto pt-1.5',
      )}
    >
      <Price
        price={product.priceRange.minVariantPrice}
        size="sm"
        className="font-sans font-bold"
      />
    </div>
  )

  return (
    <article
      className={cn(
        'group relative min-w-0',
        isListLayout
          ? 'border-hairline bg-card grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-lg border p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-6 sm:p-5 lg:grid-cols-[14rem_minmax(0,1fr)]'
          : 'flex h-full flex-col',
        className,
      )}
    >
      {/* Media block */}
      <div
        className={cn(
          'relative aspect-square overflow-hidden bg-white',
          isListLayout ? 'rounded-md sm:row-span-2' : 'rounded-lg',
        )}
      >
        <Link
          href={productUrl}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block size-full"
        >
          {featuredImage && featuredImage.width && featuredImage.height ? (
            <Image
              src={getSizedShopifyImageUrl(featuredImage.url, 640)}
              alt={featuredImage.altText ?? product.title}
              fill
              preload={priority}
              quality={68}
              sizes={
                isListLayout
                  ? '(min-width: 1024px) 224px, (min-width: 640px) 192px, 120px'
                  : '(min-width: 1480px) 336px, (min-width: 1024px) calc(30vw - 6.833rem), (min-width: 640px) calc(45vw - 0.5625rem), calc(50vw - 1.625rem)'
              }
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              aria-hidden="true"
            >
              <Leaf className="text-ink-faint/40 size-8" />
            </div>
          )}
        </Link>

        {/* Badges top-left (CARD-03) */}
        {(organic || gold || isSoldOut) && (
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {isSoldOut && <Badge variant="outOfStock" />}
            {organic && !isSoldOut && (
              <Badge variant="organic" label="Organic" />
            )}
            {gold && !isSoldOut && (
              <Badge variant="gold" label="Award winning" />
            )}
          </div>
        )}

        {/* Recommendation feeds without variant data retain Quick View. */}
        {!isSoldOut && !hasKnownVariants && (
          <div
            className={cn(
              'absolute right-0 bottom-0 left-0 p-2.5',
              'opacity-0 transition-opacity duration-200',
              'group-hover:opacity-100 focus-within:opacity-100 max-lg:opacity-100',
            )}
          >
            <ProductQuickView
              product={product}
              buttonVariant="primary"
              buttonFullWidth
            />
          </div>
        )}
      </div>

      {/* Body: identity + price (CARD-05) */}
      <div
        className={cn('flex min-w-0 flex-col', !isListLayout && 'flex-1 pt-4')}
      >
        {/* Origin/type eyebrow (CARD-02) */}
        {product.productType && (
          <p className="type-mono-meta text-ink-faint mb-1">
            {product.productType}
          </p>
        )}

        {/* Title as sole PDP link (CARD-04) */}
        <h3
          className={cn(
            'font-display my-1.5 wrap-break-word',
            isListLayout
              ? 'text-[1.3rem] leading-[1.15] sm:text-[1.55rem]'
              : 'text-[1.2rem] leading-[1.1]',
          )}
        >
          <Link
            href={productUrl}
            className="focus-visible:ring-ring hover:text-brand transition-colors focus-visible:rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {product.title}
          </Link>
        </h3>

        {/* Star rating row — shown only for a complete, non-zero summary */}
        {visibleReviewSummary && (
          <StarRating
            rating={visibleReviewSummary.rating}
            count={visibleReviewSummary.reviewCount}
            size="md"
            className={cn(isListLayout ? 'mt-2' : 'mt-1')}
          />
        )}

        {!isListLayout ? purchaseContent : null}
      </div>

      {isListLayout ? (
        <div className="col-span-2 min-w-0 sm:col-span-1 sm:col-start-2">
          {purchaseContent}
        </div>
      ) : null}
    </article>
  )
}
