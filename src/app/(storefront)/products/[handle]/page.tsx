import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { ChevronRight } from 'lucide-react'

import {
  getAllProducts,
  getProduct,
  PRODUCT_DETAIL_CACHE_VERSION,
} from '@/lib/shopify/operations/product'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { serializeInlineJson } from '@/lib/seo/serialize-inline-json'
import { SITE_URL } from '@/lib/seo/site-url'
import { getVisibleProductReviewSummary } from '@/lib/reviews/summary'
import {
  loadProductReviews,
  submitProductReviewAction,
} from '@/lib/reviews/actions'
import {
  getTrustooProductRatings,
  getTrustooProductReviews,
} from '@/lib/reviews/trustoo'
import { ProductDetails } from '@/components/product/product-details'
import { Reviews } from '@/components/product/reviews'
import { DynamicPurchaseForm } from '@/components/product/product-details/dynamic-purchase-form'

import { RelatedProducts } from './_components/related-products'
import {
  getNumericShopifyId,
  getShopifyAnalyticsMeta,
  getShopifyAnalyticsScript,
  getShopifyStorefrontContext,
} from './_lib/shopify-analytics'
import { ProductViewAnalytics } from './_components/view-analytics'

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
  const [productReviewSummaries, productReviews] = await Promise.all([
    getTrustooProductRatings([product.handle]),
    getTrustooProductReviews(product.handle),
  ])
  const productReviewSummary = productReviewSummaries[product.handle] ?? {
    rating: product.rating,
    reviewCount: product.reviewCount,
  }
  const visibleProductReviewSummary =
    getVisibleProductReviewSummary(productReviewSummary)
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

      <ProductDetails
        product={product}
        mode="live"
        reviewSummary={productReviewSummary}
        livePurchaseForm={({ descriptionSlot, className }) => (
          <DynamicPurchaseForm
            product={product}
            descriptionSlot={descriptionSlot}
            className={className}
          />
        )}
      />

      <Reviews
        key={product.handle}
        handle={product.handle}
        productTitle={product.title}
        initialPage={productReviews}
        loadPageAction={loadProductReviews}
        submitReviewAction={submitProductReviewAction.bind(
          null,
          product.handle,
          product.id,
        )}
      />

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
