import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ChevronRight, Globe2, Tags } from 'lucide-react'

import {
  getAllProducts,
  getProduct,
  PRODUCT_DETAIL_CACHE_VERSION,
} from '@/lib/shopify/operations/product'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { serializeInlineJson } from '@/lib/seo/serialize-inline-json'
import { SITE_URL } from '@/lib/seo/site-url'
import { getVisibleProductReviewSummary } from '@/lib/reviews/summary'
import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { sanitizeShopifyCompactHtml } from '@/lib/shopify/html-content'
import { RichText } from '@/components/ui/rich-text'
import { Badge } from '@/components/ui/badge'
import { Eyebrow } from '@/components/ui/eyebrow'
import { StarRating } from '@/components/ui/star-rating'
import { ProductForm } from '@/components/product/product-form'
import { ProductGallery } from '@/components/product/product-gallery'

import { PurchaseForm } from './_components/purchase-form'
import { RelatedProducts } from './_components/related-products'
import {
  getNumericShopifyId,
  getShopifyAnalyticsMeta,
  getShopifyAnalyticsScript,
  getShopifyStorefrontContext,
} from './_lib/shopify-analytics'
import { ProductViewAnalytics } from './_components/view-analytics'

// Mirrors the Liquid tag display logic from the Teavision theme:
// - Package_ tags are internal only, never shown
// - Underscored tags: strip "filter_" prefix, replace first _ with ": "
// - Plain strings: display as-is
function formatTag(tag: string): string | null {
  if (tag.includes('Package_')) return null
  if (tag.includes('_')) return tag.replace('filter_', '').replace('_', ': ')
  return tag
}

function getCategoryLabel(tag: string): string | null {
  const formattedTag = formatTag(tag)
  if (!formattedTag) return null

  const categoryMatch = /^categories:\s*(.+)$/i.exec(formattedTag)
  return categoryMatch?.[1]?.trim() || null
}

// Mirrors toCategoryPathSegment in the collections route (_lib/page-helpers)
// so tag links resolve through /collections/all/[category], which matches URL
// segments against the full collection tag index — not Shopify handleize,
// which would collapse underscores and break tags like "Certified_ACO".
function toTagPathSegment(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getMetaSegments(tags: string[], optionName?: string): string[] {
  const categoryLabels = tags
    .map(getCategoryLabel)
    .filter((tag): tag is string => tag !== null)
  const fallbackLabels = tags
    .map(formatTag)
    .filter((tag): tag is string => tag !== null)
    .filter((tag) => !/^categories:\s*/i.test(tag))
    .filter((tag) => !/award|organic|certified/i.test(tag))
  const groupLabels =
    categoryLabels.length > 0 ? categoryLabels : fallbackLabels

  return [groupLabels[0], optionName, groupLabels[1]]
    .filter((segment): segment is string => Boolean(segment))
    .slice(0, 3)
}

type Props = {
  params: Promise<{ handle: string }>
}

export async function generateStaticParams(): Promise<
  Array<{ handle: string }>
> {
  const products = await getAllProducts()

  return products.map((product) => ({ handle: product.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle, PRODUCT_DETAIL_CACHE_VERSION)
  if (!product) return withNoindexRobots({ title: 'Product not found' })
  const description = product.description
    ? product.description.slice(0, 160)
    : `Buy ${product.title} from Teavision, Australia's bulk tea and herb supplier.`
  const imageUrl = product.images[0]?.url
  return withNoindexRobots({
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      url: `/products/${handle}`,
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
    alternates: { canonical: `/products/${handle}` },
  })
}

export async function ProductContent({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle, PRODUCT_DETAIL_CACHE_VERSION)
  if (!product) notFound()

  const productUrl = `${SITE_URL}/products/${product.handle}`
  const hasAvailableVariant = product.variants.some((v) => v.availableForSale)
  const descriptionHtml = sanitizeShopifyCompactHtml(product.descriptionHtml)
  const productReviewSummaries = await getTrustooProductRatings([
    product.handle,
  ])
  const productReviewSummary = productReviewSummaries[product.handle] ?? {
    rating: product.rating,
    reviewCount: product.reviewCount,
  }
  const visibleProductReviewSummary =
    getVisibleProductReviewSummary(productReviewSummary)
  // PDP-local display values: the visible review line always renders, while
  // JSON-LD aggregateRating stays gated on the strict shared summary above.
  const displayRating =
    typeof productReviewSummary.rating === 'number' &&
    Number.isFinite(productReviewSummary.rating) &&
    productReviewSummary.rating > 0 &&
    productReviewSummary.rating <= 5
      ? productReviewSummary.rating
      : 0
  const displayReviewCount =
    typeof productReviewSummary.reviewCount === 'number' &&
    Number.isInteger(productReviewSummary.reviewCount) &&
    productReviewSummary.reviewCount > 0
      ? productReviewSummary.reviewCount
      : 0
  const visibleTags = product.tags.flatMap((tag) => {
    const label = formatTag(tag)
    return label ? [{ tag, label }] : []
  })
  const metaSegments = getMetaSegments(product.tags, product.options[0]?.name)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    ...(product.images[0] && { image: product.images[0].url }),
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: product.priceRange.minVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: hasAvailableVariant
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(visibleProductReviewSummary && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: visibleProductReviewSummary.rating,
        reviewCount: visibleProductReviewSummary.reviewCount,
      },
    }),
  }

  const descriptionSlotNode = descriptionHtml ? (
    <RichText
      html={descriptionHtml}
      variant="compact"
      className="text-ink-soft max-w-prose text-[1.02rem]"
    />
  ) : null

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Products',
        item: `${SITE_URL}/collections/all`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  }

  const numericProductIdNumber = getNumericShopifyId(product.id)
  const shopifyAnalyticsMeta = numericProductIdNumber
    ? getShopifyAnalyticsMeta(product, numericProductIdNumber)
    : null
  const shopifyStorefrontContext =
    shopifyAnalyticsMeta && numericProductIdNumber
      ? getShopifyStorefrontContext(
          productUrl,
          numericProductIdNumber,
          shopifyAnalyticsMeta.page.requestId,
        )
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeInlineJson(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeInlineJson(breadcrumbJsonLd),
        }}
      />
      {shopifyAnalyticsMeta && shopifyStorefrontContext ? (
        <>
          <Script
            id={`shopify-analytics-meta-${numericProductIdNumber}`}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: getShopifyAnalyticsScript(
                product.priceRange.minVariantPrice.currencyCode,
                shopifyAnalyticsMeta,
              ),
            }}
          />
          <Script
            id={`shopify-storefront-context-${numericProductIdNumber}`}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `var __st=${serializeInlineJson(shopifyStorefrontContext)};`,
            }}
          />
        </>
      ) : null}
      <ProductViewAnalytics
        id={product.id}
        handle={product.handle}
        title={product.title}
      />

      <nav
        aria-label="Breadcrumb"
        className="type-mono-meta text-ink-faint flex flex-wrap items-center gap-2 py-5.5"
      >
        <Link
          href="/"
          className="hover:text-brand focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          Home
        </Link>
        <ChevronRight aria-hidden="true" className="size-3" />
        <Link
          href="/collections/all"
          className="hover:text-brand focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
        >
          Products
        </Link>
        <ChevronRight aria-hidden="true" className="size-3" />
        <span aria-current="page" className="text-ink">
          {product.title}
        </span>
      </nav>

      {/* Main product layout — pt-2 adds the design's 8px grid top offset (delta #1) */}
      <div className="grid min-w-0 items-start gap-[clamp(28px,4vw,64px)] pt-2 lg:grid-cols-[1.05fr_1fr]">
        <div className="min-w-0">
          <ProductGallery images={product.images} title={product.title} />
        </div>

        {/* Info column: varied rhythm per design — gap-6 removed in favour of per-element mt-* */}
        <div className="flex min-w-0 flex-col">
          {/* Title block: eyebrow → h1 → rating, gap-3.5 = 14px (deltas #2, #3) */}
          <div className="flex flex-col gap-3.5">
            {metaSegments.length > 0 ? (
              <Eyebrow className="items-center">
                <Globe2 aria-hidden="true" className="size-3.5" />
                {metaSegments.join(' · ')}
              </Eyebrow>
            ) : null}
            <h1 className="font-display text-ink text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.04] font-medium">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5">
              <StarRating rating={displayRating} size="lg" />
              <span className="type-mono-meta text-ink-faint">
                {displayReviewCount === 0
                  ? '0 Reviews'
                  : `${displayRating.toFixed(1)} · ${displayReviewCount.toLocaleString()} ${
                      displayReviewCount === 1 ? 'review' : 'reviews'
                    }`}
              </span>
            </div>
          </div>

          {/* Production element order: buy controls → description → availability → tags.
              The description renders inside the form's slot so the variant-driven
              availability line can follow it, matching production's DOM order. */}
          <Suspense
            fallback={
              <ProductForm
                variants={product.variants}
                options={product.options}
                descriptionSlot={descriptionSlotNode}
                className="mt-6.5"
              />
            }
          >
            <PurchaseForm
              variants={product.variants}
              options={product.options}
              descriptionSlot={descriptionSlotNode}
              className="mt-6.5"
            />
          </Suspense>

          {/* Tag pills at the foot of the info column (owner directive) — mt-8 keeps the 32px rhythm below the buy panel */}
          {visibleTags.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-ink inline-flex items-center gap-1.5 text-sm font-semibold">
                <Tags className="size-4" aria-hidden />
                Tags :
              </span>
              {visibleTags.map(({ tag, label }) => (
                <Link
                  key={tag}
                  href={`/collections/all/${toTagPathSegment(tag)}`}
                >
                  <Badge
                    variant="certification"
                    label={label}
                    className="hover:border-ink-soft/40 hover:text-ink transition-colors"
                  />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Product recommendations — mb keeps the last carousel clear of the footer */}
      <div className="my-[clamp(50px,7vw,90px)] flex flex-col gap-10">
        <Suspense fallback={null}>
          <RelatedProducts product={product} />
        </Suspense>
      </div>
    </>
  )
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="max-w-wide px-gutter mx-auto w-full">
      <ProductContent params={params} />
    </div>
  )
}
