import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { getProduct } from '@/lib/shopify/operations/product'
import type { Product } from '@/lib/shopify/types'
import { makeProduct } from '@/tests/fixtures/shopify/product'

import { ProductContent } from './page'
import { PurchaseForm } from './_components/purchase-form'

vi.mock('server-only', () => ({}))

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('notFound')
  },
  useSearchParams: () => new URLSearchParams('variant=41503540936791'),
}))

vi.mock('next/script', () => ({
  default: ({
    dangerouslySetInnerHTML,
    id,
  }: {
    dangerouslySetInnerHTML?: { __html: string }
    id?: string
  }) => (
    <script
      data-next-script={id}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    />
  ),
}))

vi.mock('@/components/product', () => ({
  ProductForm: ({ initialVariantId }: { initialVariantId?: string }) => (
    <div data-testid="product-form" data-initial-variant={initialVariantId}>
      Buy controls
    </div>
  ),
  ProductGallery: ({ title }: { title: string }) => (
    <div data-testid="product-gallery">{title} gallery</div>
  ),
}))

vi.mock('@/lib/reviews/trustoo', () => ({
  getTrustooProductRatings: vi.fn(),
}))

vi.mock('@/lib/shopify/operations/product', () => ({
  PRODUCT_DETAIL_CACHE_VERSION: 'test-cache-version',
  getProduct: vi.fn(),
}))

vi.mock('./_components/customers-also-bought', () => ({
  CustomersAlsoBought: () => null,
}))

vi.mock('./_components/related-products', () => ({
  RelatedProducts: () => null,
}))

vi.mock('./_components/view-analytics', () => ({
  ProductViewAnalytics: () => null,
}))

type JsonLdNode = Record<string, unknown>

function collectJsonLdNodes(value: unknown): JsonLdNode[] {
  if (Array.isArray(value)) return value.flatMap(collectJsonLdNodes)
  if (typeof value !== 'object' || value === null) return []

  const node = value as JsonLdNode
  const graph = collectJsonLdNodes(node['@graph'])

  return [node, ...graph]
}

function readJsonLdNodes(html: string): JsonLdNode[] {
  return [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g,
    ),
  ].flatMap((match) => collectJsonLdNodes(JSON.parse(match[1] ?? 'null')))
}

function findJsonLdNode(html: string, schemaType: string) {
  return readJsonLdNodes(html).find((node) => node['@type'] === schemaType)
}

async function renderProductContent(product: Product) {
  vi.mocked(getProduct).mockResolvedValue(product)

  const element = await ProductContent({
    params: Promise.resolve({ handle: product.handle }),
  })

  return renderToStaticMarkup(element as ReactNode)
}

describe('ProductContent heading hierarchy', () => {
  beforeEach(() => {
    vi.mocked(getTrustooProductRatings).mockResolvedValue({})
    vi.mocked(getProduct).mockResolvedValue(
      makeProduct({
        handle: 'only-product-title',
        title: 'Only Product Title',
        description: 'A product with imported rich description headings.',
        descriptionHtml:
          '<h1>Imported product title</h1><h2>Imported section</h2><p>Body copy</p>',
      }),
    )
  })

  it('keeps the product title as the only H1, preserves native disclosures, and demotes imported description headings', async () => {
    const element = await ProductContent({
      params: Promise.resolve({ handle: 'only-product-title' }),
    })
    const html = renderToStaticMarkup(element as ReactNode)

    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).toContain('Only Product Title')
    expect(html).toContain(
      '<h3 class="type-heading-05 text-ink mt-5">Imported product title</h3>',
    )
    expect(html).toContain(
      '<h3 class="type-heading-05 text-ink mt-5">Imported section</h3>',
    )
    expect(html).not.toContain('<h1>Imported product title</h1>')
    expect(html).not.toContain('<h2>Imported section</h2>')
    expect(html.indexOf('Body copy')).toBeLessThan(
      html.indexOf('data-testid="product-form"'),
    )

    const detailTags = html.match(/<details\b[^>]*>/g) ?? []
    const disclosureTitles = [
      ...html.matchAll(
        /<details\b[^>]*><summary\b[^>]*><h2\b[^>]*>([^<]+)<\/h2>/g,
      ),
    ].map((match) => match[1])

    expect(detailTags).toHaveLength(3)
    expect(detailTags[0]).toContain('open=""')
    expect(disclosureTitles).toEqual([
      'Tasting &amp; brewing',
      'Ingredients &amp; certification',
      'Packing, shipping &amp; storage',
    ])
    expect(html).not.toContain('aria-expanded')
    expect(html).not.toContain('role="button"')
  })

  it('renders critical product content independently of runtime search parameters', async () => {
    const element = await ProductContent({
      params: Promise.resolve({ handle: 'only-product-title' }),
    })
    const html = renderToStaticMarkup(element as ReactNode)

    expect(html).toContain('data-testid="product-gallery"')
    expect(html).toContain('<h1')
    expect(html).toContain('Only Product Title')
  })

  it('uses real Shopify serving guidance in the tasting disclosure', async () => {
    const html = await renderProductContent(
      makeProduct({
        handle: 'wild-berry',
        descriptionHtml:
          '<p><strong>Aroma:</strong> Fruity and sweet.</p><p><strong>Serving suggestion:</strong> Add 1-2 teaspoons to hot water for 3-5 minutes.</p>',
      }),
    )

    expect(html).toContain('Fruity and sweet.')
    expect(html).toContain('Add 1-2 teaspoons to hot water for 3-5 minutes.')
    expect(html).not.toContain('Pack options')
    expect(html).not.toContain('Available variants')
  })

  it('places real ingredients, storage, and quality details in their matching disclosures', async () => {
    const html = await renderProductContent(
      makeProduct({
        handle: 'structured-wild-berry',
        tags: ['filter_categories_Herbal Tea', 'Premium', 'Organic'],
        descriptionHtml:
          '<p><strong>Origin:</strong> Multiple.</p><p><strong>Ingredients:</strong> Hibiscus, apple pieces, rosehip shells.</p><p><strong>Packaging:</strong> Sealed, air-tight pouches.</p><p><strong>Storage:</strong> Store below 18ºC in a dry place.</p><p><strong>Quality Control:</strong> HACCP and ACO accredited facilities.</p><p><strong>WARNING:</strong> Consult a healthcare professional before use.</p>',
      }),
    )

    expect(html).toMatch(
      /Ingredients &amp; certification[\s\S]*Ingredients[\s\S]*Hibiscus, apple pieces, rosehip shells\.[\s\S]*Certifications[\s\S]*Organic/,
    )
    expect(html).toMatch(
      /Packing, shipping &amp; storage[\s\S]*Packaging[\s\S]*Sealed, air-tight pouches\.[\s\S]*Storage[\s\S]*Store below 18ºC in a dry place\.[\s\S]*Quality control[\s\S]*HACCP and ACO accredited facilities\.[\s\S]*Warning[\s\S]*Consult a healthcare professional before use\./,
    )
    expect(html).not.toContain(
      'Packed for bulk tea service and shipped through the existing Teavision checkout flow.',
    )
    expect(html).not.toContain('categories: Herbal Tea · Premium · Organic')
  })

  it('keeps deep-linked variant selection in the route-local client leaf', () => {
    const html = renderToStaticMarkup(
      <PurchaseForm variants={[]} options={[]} bulkPricingTiers={[]} />,
    )

    expect(html).toContain('data-initial-variant="41503540936791"')
  })
})

describe('ProductContent aggregateRating JSON-LD', () => {
  beforeEach(() => {
    vi.mocked(getTrustooProductRatings).mockResolvedValue({})
  })

  it('emits aggregateRating when the same rating and review count are visible', async () => {
    vi.mocked(getTrustooProductRatings).mockResolvedValue({
      'reviewed-tea': { rating: 4.7, reviewCount: 12 },
    })

    const html = await renderProductContent(
      makeProduct({
        handle: 'reviewed-tea',
        title: 'Reviewed Tea',
        rating: undefined,
        reviewCount: undefined,
      }),
    )
    const productJsonLd = findJsonLdNode(html, 'Product')

    expect(html).toContain('4.7')
    expect(html).toContain('12 reviews')
    expect(productJsonLd).toMatchObject({
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.7,
        reviewCount: 12,
      },
    })
  })

  it('omits aggregateRating when reviewCount is missing', async () => {
    const html = await renderProductContent(
      makeProduct({
        handle: 'missing-review-count',
        title: 'Missing Review Count',
        rating: undefined,
        reviewCount: undefined,
      }),
    )
    const productJsonLd = findJsonLdNode(html, 'Product')

    expect(html).not.toMatch(/\d+(?:\.\d+)? · \d[\d,]* reviews?/)
    expect(productJsonLd).not.toHaveProperty('aggregateRating')
  })

  it('omits aggregateRating when reviewCount is zero', async () => {
    vi.mocked(getTrustooProductRatings).mockResolvedValue({
      'zero-review-count': { rating: 4.2, reviewCount: 0 },
    })

    const html = await renderProductContent(
      makeProduct({
        handle: 'zero-review-count',
        title: 'Zero Review Count',
        rating: undefined,
        reviewCount: undefined,
      }),
    )
    const productJsonLd = findJsonLdNode(html, 'Product')

    expect(html).not.toContain('0 reviews')
    expect(productJsonLd).not.toHaveProperty('aggregateRating')
  })

  it('omits aggregateRating when review values are outside supported ranges', async () => {
    vi.mocked(getTrustooProductRatings).mockResolvedValue({
      'invalid-review-values': { rating: 6, reviewCount: 12.5 },
    })

    const html = await renderProductContent(
      makeProduct({
        handle: 'invalid-review-values',
        title: 'Invalid Review Values',
        rating: undefined,
        reviewCount: undefined,
      }),
    )
    const productJsonLd = findJsonLdNode(html, 'Product')

    expect(html).not.toContain('6.0')
    expect(html).not.toContain('12.5 reviews')
    expect(productJsonLd).not.toHaveProperty('aggregateRating')
  })
})
