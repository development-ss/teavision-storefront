import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type {
  CollectionProductSummary,
  ProductVariant,
} from '@/lib/shopify/types'

import { ProductList } from './product-list'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/cart/actions', () => ({
  addToCartAction: vi.fn(),
}))

const variants: ProductVariant[] = [
  {
    id: 'gid://shopify/ProductVariant/masters-sencha-50g',
    title: '50g Sample',
    availableForSale: true,
    quantityAvailable: 10,
    quantityRule: {
      minimum: 1,
      maximum: 10,
      increment: 1,
    },
    price: { amount: '12.00', currencyCode: 'AUD' },
    quantityPriceBreaks: [],
    image: null,
  },
]

const product: CollectionProductSummary = {
  id: 'gid://shopify/Product/masters-sencha',
  handle: 'tea-masters-sencha',
  title: 'Tea Masters Sencha Green Tea',
  availableForSale: true,
  productType: 'Green tea',
  tags: [],
  featuredImage: null,
  priceRange: {
    minVariantPrice: { amount: '12.00', currencyCode: 'AUD' },
  },
  rating: 4.8,
  reviewCount: 37,
  variants,
}

function getImagePreloads(html: string): string[] {
  return (
    html.match(/<link(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/g) ?? []
  )
}

describe('ProductList', () => {
  it('uses a single-column list of horizontal product cards', () => {
    const html = renderToStaticMarkup(
      <ProductList
        products={[
          product,
          {
            ...product,
            id: 'gid://shopify/Product/organic-rose',
            handle: 'organic-rose-petals',
            title: 'Organic Rose Petals',
          },
        ]}
      />,
    )

    expect(html).toContain('grid scroll-mt-24 gap-4 sm:gap-5')
    expect(html).not.toContain('grid-cols-2')
    expect(html).not.toContain('lg:grid-cols-3')
    expect(html).toContain('grid-cols-[7.5rem_minmax(0,1fr)]')
    expect(html).toContain('sm:grid-cols-[12rem_minmax(0,1fr)]')
    expect(html).toContain('lg:grid-cols-[14rem_minmax(0,1fr)]')
  })

  it('preloads only the first product image so other cards do not compete with the LCP request', () => {
    const products = Array.from({ length: 4 }, (_, index) => ({
      ...product,
      id: `gid://shopify/Product/product-${index}`,
      handle: `product-${index}`,
      title: `Product ${index}`,
      featuredImage: {
        url: `https://cdn.shopify.com/s/files/1/0000/0001/products/product-${index}.jpg?v=1`,
        altText: `Product ${index}`,
        width: 900,
        height: 900,
      },
    }))

    const html = renderToStaticMarkup(<ProductList products={products} />)

    expect(getImagePreloads(html)).toHaveLength(1)
    expect(html.match(/<img[^>]*loading="eager"/g) ?? []).toHaveLength(0)
    expect(html.match(/<img[^>]*fetchPriority="high"/g) ?? []).toHaveLength(0)
    expect(html.match(/<img[^>]*loading="lazy"/g)).toHaveLength(3)
  })

  it('does not preload a product image when the collection hero owns LCP', () => {
    const products = Array.from({ length: 2 }, (_, index) => ({
      ...product,
      id: `gid://shopify/Product/product-${index}`,
      handle: `product-${index}`,
      title: `Product ${index}`,
      featuredImage: {
        url: `https://cdn.shopify.com/s/files/1/0000/0001/products/product-${index}.jpg?v=1`,
        altText: `Product ${index}`,
        width: 900,
        height: 900,
      },
    }))

    const html = renderToStaticMarkup(
      <ProductList products={products} preloadFirstImage={false} />,
    )

    expect(getImagePreloads(html)).toHaveLength(0)
    expect(html.match(/<img[^>]*loading="lazy"/g)).toHaveLength(2)
  })

  it('renders numbered pagination with aria-label when totalPages > 1', () => {
    const html = renderToStaticMarkup(
      <ProductList
        products={[product]}
        currentPage={2}
        totalPages={5}
        buildPageHref={(page) => `/collections/all?page=${page}`}
      />,
    )

    // Should NOT contain "Next products" button anymore
    expect(html).not.toContain('Next products')
    // Should contain aria-label for pagination nav
    expect(html).toContain('Collection pagination')
    // Current page should be aria-current="page"
    expect(html).toContain('aria-current="page"')
    // Should have a link to the last page (true last page visible)
    expect(html).toContain('Page 5')
  })

  it('does not render pagination when totalPages is 1', () => {
    const html = renderToStaticMarkup(
      <ProductList
        products={[product]}
        currentPage={1}
        totalPages={1}
        buildPageHref={(page) => `/collections/all?page=${page}`}
      />,
    )

    expect(html).not.toContain('Collection pagination')
    expect(html).not.toContain('Next products')
  })

  it('pager links include the product-grid anchor and target offset for scroll-to-grid (D-26)', () => {
    const html = renderToStaticMarkup(
      <ProductList
        products={[product]}
        currentPage={2}
        totalPages={5}
        buildPageHref={(page) => `/collections/all?page=${page}`}
      />,
    )

    expect(html).toContain('#product-grid')
    expect(html).toContain('id="product-grid"')
    expect(html).toContain('scroll-mt-24')
    expect(html).toContain('lg:scroll-mt-32')
  })
})
