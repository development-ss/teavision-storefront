import type { ProductReviewSummary } from '@/lib/reviews/summary'
import type { Product, ProductVariant } from '@/lib/shopify/types'

import { ORGANIZATION_ID } from './homepage-json-ld'

type ProductJsonLdInput = {
  product: Pick<
    Product,
    'id' | 'title' | 'description' | 'images' | 'options' | 'variants'
  >
  productUrl: string
  reviewSummary: ProductReviewSummary | null
}

// Shopify's placeholder title for a product that has no pack-size options.
const DEFAULT_VARIANT_TITLE = 'Default Title'

// Shopify joins a variant's option values with this separator in its title,
// in the same order as the product's options.
const VARIANT_TITLE_SEPARATOR = ' / '

// Shopify option names mapped to the schema.org properties Google accepts in
// ProductGroup.variesBy. Teavision's pack sizes are weights, so both count as
// size. Options not listed here are left out of variesBy.
const VARIES_BY_PROPERTY: Record<string, 'size' | 'color' | 'material'> = {
  size: 'size',
  'pack size': 'size',
  weight: 'size',
  color: 'color',
  colour: 'color',
  material: 'material',
}

// Mirrors /pages/refund-policy: a 14-day window, returned by mail to
// Teavision's business address in Australia, the customer pays the return
// postage, and an approved claim is settled with store credit, not a refund.
export const PRODUCT_RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'AU',
  returnPolicyCountry: 'AU',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  refundType: 'https://schema.org/StoreCreditRefund',
}

function getNumericShopifyId(gid: string): string | undefined {
  return gid.split('/').at(-1) || undefined
}

// The product page opens on whichever pack size the ?variant= parameter
// names, so each variant links to the exact URL that shows its own price.
function getVariantUrl(productUrl: string, variant: ProductVariant): string {
  const numericId = getNumericShopifyId(variant.id)

  return numericId ? `${productUrl}?variant=${numericId}` : productUrl
}

function buildOffer(url: string, variant: ProductVariant) {
  return {
    '@type': 'Offer',
    url,
    priceCurrency: variant.price.currencyCode,
    price: variant.price.amount,
    availability: variant.availableForSale
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': ORGANIZATION_ID },
    hasMerchantReturnPolicy: PRODUCT_RETURN_POLICY,
  }
}

function getImages(product: ProductJsonLdInput['product']) {
  return product.images.length > 0
    ? { image: product.images.map((image) => image.url) }
    : {}
}

function getAggregateRating(reviewSummary: ProductReviewSummary | null) {
  return reviewSummary
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: reviewSummary.rating,
          reviewCount: reviewSummary.reviewCount,
        },
      }
    : {}
}

// Each variant's value for every option that maps to a variesBy property,
// read from the variant title ("1kg" or "1kg / Loose").
function getVariantAttributes(
  options: ProductJsonLdInput['product']['options'],
  variant: ProductVariant,
): Partial<Record<'size' | 'color' | 'material', string>> {
  const values =
    options.length === 1
      ? [variant.title]
      : variant.title.split(VARIANT_TITLE_SEPARATOR)
  const attributes: Partial<Record<'size' | 'color' | 'material', string>> = {}

  options.forEach((option, index) => {
    const property = VARIES_BY_PROPERTY[option.name.trim().toLowerCase()]
    const value = values[index]?.trim()

    if (property && value && !attributes[property]) {
      attributes[property] = value
    }
  })

  return attributes
}

function getVariesBy(options: ProductJsonLdInput['product']['options']) {
  const properties = new Set<string>()

  for (const option of options) {
    const property = VARIES_BY_PROPERTY[option.name.trim().toLowerCase()]
    if (property) properties.add(`https://schema.org/${property}`)
  }

  return [...properties]
}

// A product with one pack size is a plain Product with one Offer. A product
// with several pack sizes is a ProductGroup (Google's product-variant markup):
// each size is its own Product with its own SKU, price, stock and a URL that
// preselects that size, so the markup always matches what a visitor sees.
export function buildProductJsonLd({
  product,
  productUrl,
  reviewSummary,
}: ProductJsonLdInput) {
  const brand = { '@type': 'Brand', name: 'Teavision' }
  const [onlyVariant] = product.variants

  if (product.variants.length === 1 && onlyVariant) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      ...getImages(product),
      ...(onlyVariant.sku && { sku: onlyVariant.sku }),
      brand,
      offers: buildOffer(productUrl, onlyVariant),
      ...getAggregateRating(reviewSummary),
    }
  }

  const variesBy = getVariesBy(product.options)

  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    name: product.title,
    description: product.description,
    url: productUrl,
    ...getImages(product),
    brand,
    productGroupID: getNumericShopifyId(product.id),
    ...(variesBy.length > 0 && { variesBy }),
    hasVariant: product.variants.map((variant) => {
      const url = getVariantUrl(productUrl, variant)
      const isNamedVariant = variant.title !== DEFAULT_VARIANT_TITLE

      return {
        '@type': 'Product',
        name: isNamedVariant
          ? `${product.title} ${variant.title}`
          : product.title,
        ...(variant.sku && { sku: variant.sku }),
        ...(variant.image && { image: variant.image.url }),
        ...getVariantAttributes(product.options, variant),
        url,
        offers: buildOffer(url, variant),
      }
    }),
    ...getAggregateRating(reviewSummary),
  }
}
