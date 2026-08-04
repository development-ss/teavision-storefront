import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ChevronDown, ChevronRight, Globe2 } from 'lucide-react'

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
import {
  extractProductDescriptionDetails,
  sanitizeShopifyCompactHtml,
} from '@/lib/shopify/html-content'
import { RichText } from '@/components/ui/rich-text'
import { Badge, Eyebrow, Section, StarRating } from '@/components/ui'
import { ProductForm, ProductGallery } from '@/components/product'

import { CustomersAlsoBought } from './_components/customers-also-bought'
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

function getBadgeVariant(tag: string): 'gold' | 'organic' | 'certification' {
  if (/award|gold/i.test(tag)) return 'gold'
  if (/organic/i.test(tag)) return 'organic'
  return 'certification'
}

function getMetaSegments(tags: string[], optionName?: string): string[] {
  const visibleTags = tags
    .map(formatTag)
    .filter((tag): tag is string => tag !== null)
    .filter((tag) => !/award|organic|certified/i.test(tag))

  return [visibleTags[0], optionName, visibleTags[1]]
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

type SpecDisclosure =
  | {
      kind: 'table'
      title: string
      rows: [string, string][]
    }
  | {
      kind: 'text'
      title: string
      content: string
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
  const descriptionDetails = extractProductDescriptionDetails(
    product.descriptionHtml,
  )
  const productReviewSummaries = await getTrustooProductRatings([
    product.handle,
  ])
  const productReviewSummary = productReviewSummaries[product.handle] ?? {
    rating: product.rating,
    reviewCount: product.reviewCount,
  }
  const visibleProductReviewSummary =
    getVisibleProductReviewSummary(productReviewSummary)
  const visibleTags = product.tags
    .map(formatTag)
    .filter((tag): tag is string => tag !== null)
  const certificationTags = visibleTags.filter((tag) =>
    /aco|certif|haccp|halal|kosher|organic|usda/i.test(tag),
  )
  const metaSegments = getMetaSegments(product.tags, product.options[0]?.name)
  const ingredientRows: [string, string][] = []
  const packingRows: [string, string][] = []

  if (descriptionDetails.origin) {
    ingredientRows.push(['Origin', descriptionDetails.origin])
  }
  if (descriptionDetails.ingredients) {
    ingredientRows.push(['Ingredients', descriptionDetails.ingredients])
  }
  if (certificationTags.length > 0) {
    ingredientRows.push(['Certifications', certificationTags.join(' · ')])
  }
  if (ingredientRows.length === 0) {
    ingredientRows.push([
      'Product details',
      'Ingredient and certification details have not yet been supplied for this product.',
    ])
  }

  if (descriptionDetails.packaging) {
    packingRows.push(['Packaging', descriptionDetails.packaging])
  }
  if (descriptionDetails.storage) {
    packingRows.push(['Storage', descriptionDetails.storage])
  }
  if (descriptionDetails.qualityControl) {
    packingRows.push(['Quality control', descriptionDetails.qualityControl])
  }
  if (descriptionDetails.warning) {
    packingRows.push(['Warning', descriptionDetails.warning])
  }
  if (packingRows.length === 0) {
    packingRows.push([
      'Product details',
      'Packing and storage guidance has not yet been supplied for this product.',
    ])
  }

  const specDisclosures: SpecDisclosure[] = [
    {
      kind: 'table',
      title: 'Tasting & brewing',
      rows: [
        ...(descriptionDetails.aroma
          ? ([['Aroma', descriptionDetails.aroma]] satisfies [string, string][])
          : []),
        [
          'Brewing method',
          descriptionDetails.servingSuggestion ??
            'Brewing guidance is being prepared for this product.',
        ],
      ],
    },
    {
      kind: 'table',
      title: 'Ingredients & certification',
      rows: ingredientRows,
    },
    {
      kind: 'table',
      title: 'Packing, shipping & storage',
      rows: packingRows,
    },
  ]

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

  const numericProductId = product.id.replace('gid://shopify/Product/', '')
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
            {visibleProductReviewSummary ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <StarRating
                  rating={visibleProductReviewSummary.rating}
                  size="md"
                />
                <span className="type-mono-meta text-ink-faint">
                  {visibleProductReviewSummary.rating.toFixed(1)} ·{' '}
                  {visibleProductReviewSummary.reviewCount.toLocaleString()}{' '}
                  {visibleProductReviewSummary.reviewCount === 1
                    ? 'review'
                    : 'reviews'}
                </span>
              </div>
            ) : null}
          </div>

          {/* Leading SEO description — keep this crawlable copy near the title */}
          {descriptionHtml ? (
            <RichText
              html={descriptionHtml}
              variant="compact"
              className="text-ink-soft mt-5.5 max-w-prose text-[1.02rem]"
            />
          ) : null}

          {/* Buy controls: size, quantity, add-to-cart, and bulk savings */}
          <Suspense
            fallback={
              <ProductForm
                variants={product.variants}
                options={product.options}
                bulkPricingTiers={product.bulkPricingTiers}
                className="mt-6.5"
              />
            }
          >
            <PurchaseForm
              variants={product.variants}
              options={product.options}
              bulkPricingTiers={product.bulkPricingTiers}
              className="mt-6.5"
            />
          </Suspense>

          {/* Disclosures: 32px below ProductForm (design .specs mt-32px = verified match) */}
          <div className="mt-8">
            {specDisclosures.map((item, index) => (
              <details
                key={item.title}
                className="group border-hairline border-t last:border-b"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 marker:hidden">
                  <h2 className="font-display text-ink min-w-0 text-[1.15rem] leading-tight wrap-break-word">
                    {item.title}
                  </h2>
                  <ChevronDown
                    aria-hidden="true"
                    className="text-brand size-4 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                {item.kind === 'table' ? (
                  <table className="mb-5.5 w-full text-left">
                    <tbody>
                      {item.rows.map(([label, value]) => (
                        <tr
                          key={label}
                          className="border-hairline-2 border-b last:border-b-0"
                        >
                          <th
                            scope="row"
                            className="type-mono-meta text-ink-faint w-2/5 py-3 pr-4"
                          >
                            {label}
                          </th>
                          <td className="text-ink-soft py-3 text-sm">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-ink-soft max-w-prose pb-5.5 text-sm leading-6">
                    {item.content}
                  </p>
                )}
              </details>
            ))}
          </div>

          {/* Tag pills at the foot of the info column (owner directive) */}
          {visibleTags.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {visibleTags.slice(0, 6).map((label) => (
                <Badge
                  key={label}
                  variant={getBadgeVariant(label)}
                  label={label}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Reviews */}
      <Section.Root
        tone="transparent"
        spacing="none"
        className="border-hairline mt-[clamp(50px,7vw,90px)] border-t pt-10"
        aria-label="Customer reviews"
      >
        <div className="mb-6 flex flex-wrap items-baseline gap-3">
          <h2 className="font-display text-ink text-[1.4rem]">Reviews</h2>
        </div>
        <div id="shopify-product-reviews" data-id={numericProductId} />
      </Section.Root>

      {/* Product recommendations — mb keeps the last carousel clear of the footer */}
      <div className="my-[clamp(50px,7vw,90px)] flex flex-col gap-10">
        <Suspense fallback={null}>
          <RelatedProducts product={product} />
          <CustomersAlsoBought product={product} />
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
