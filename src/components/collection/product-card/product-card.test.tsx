/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type {
  CollectionProductSummary,
  ProductVariant,
} from '@/lib/shopify/types'

import { ProductCard } from './product-card'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

function getImagePreloads(html: string): string[] {
  return (
    html.match(/<link(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/g) ?? []
  )
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/cart/actions', () => ({
  addToCartAction: vi.fn(),
}))

const singleVariant: ProductVariant = {
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
}

const multiVariants: ProductVariant[] = [
  singleVariant,
  {
    id: 'gid://shopify/ProductVariant/masters-sencha-1kg',
    title: '1kg',
    availableForSale: true,
    quantityAvailable: 4,
    quantityRule: {
      minimum: 1,
      maximum: 4,
      increment: 1,
    },
    price: { amount: '88.00', currencyCode: 'AUD' },
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
  tags: ['Organic', 'ACO Certified', 'Wholesale'],
  featuredImage: {
    url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/tea-1.jpg?v=1',
    altText: 'Loose leaf green tea',
    width: 900,
    height: 900,
  },
  priceRange: {
    minVariantPrice: { amount: '12.00', currencyCode: 'AUD' },
  },
  rating: 4.8,
  reviewCount: 37,
  variants: [singleVariant],
}

describe('ProductCard', () => {
  it('renders the approved vertical card layout (.pcard)', () => {
    const html = renderToStaticMarkup(<ProductCard product={product} />)

    // Media is square so Shopify product-photo canvases do not feel stretched.
    expect(html).toContain('aspect-square')
    expect(html).not.toContain('aspect-[1/1.12]')
    // Product photos sit on a full media plate rather than floating on the page.
    expect(html).toContain('bg-white')
    expect(html).not.toContain('mix-blend-multiply')
    expect(html).not.toMatch(/<article class="[^"]*\bbg-card\b/)
    expect(html).not.toContain('bg-paper-2')
    // Title uses display font (lockstep with UI-SPEC §5.5)
    expect(html).toContain(
      '<h3 class="font-display my-1.5 wrap-break-word text-[1.2rem] leading-[1.1]">',
    )
    // Product imagery is contained so pack shots are not cropped/zoomed in.
    expect(html).toContain('object-contain')
    expect(html).toContain('group-hover:scale-[1.02]')
    expect(html).not.toContain('object-cover')
    expect(html).not.toContain('group-hover:scale-[1.06]')
    expect(html).not.toContain('class="p-3')
    expect(html).not.toContain('sm:p-4')
    // Price rendered
    expect(html).toContain('$12.00')
    // Type-mono-meta eyebrow for productType (CARD-02)
    expect(html).toContain('type-mono-meta')
    expect(html).toContain('Green tea')
    // motion-reduce trio on scale animation
    expect(html).toContain('motion-reduce:group-hover:scale-100')
    // Known variants purchase directly from the listing; no Quick View needed.
    expect(html).not.toContain('Quick View')
    // Star rating row renders when rating data is available
    expect(html).toContain('out of 5 stars')
    expect(html).toContain('<svg width="16" height="16"')
    expect(html).toContain('text-rating')
  })

  it('always shows size, quantity, and add-to-cart controls for single-variant products', () => {
    const html = renderToStaticMarkup(<ProductCard product={product} />)
    expect(html).toContain('Select pack size for Tea Masters Sencha Green Tea')
    expect(html).toContain('Add to cart')
    expect(html).toContain('Quantity for Tea Masters Sencha Green Tea')
  })

  it('renders a responsive horizontal layout when used by collection PLPs', () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{ ...product, variants: multiVariants }}
        layout="list"
      />,
    )

    expect(html).toContain('grid-cols-[7.5rem_minmax(0,1fr)]')
    expect(html).toContain('sm:grid-cols-[12rem_minmax(0,1fr)]')
    expect(html).toContain('lg:grid-cols-[14rem_minmax(0,1fr)]')
    expect(html).toContain(
      'sizes="(min-width: 1024px) 224px, (min-width: 640px) 192px, 120px"',
    )
    expect(html).toContain('Select pack size for Tea Masters Sencha Green Tea')
    expect(html).toContain('Quantity for Tea Masters Sencha Green Tea')
    expect(html).toContain('Add to cart')
  })

  it('preloads priority product imagery for above-the-fold LCP candidates', () => {
    const html = renderToStaticMarkup(
      <ProductCard product={product} priority />,
    )

    expect(getImagePreloads(html)).toHaveLength(1)
    expect(html).toContain(
      'sizes="(min-width: 1480px) 336px, (min-width: 1024px) calc(30vw - 6.833rem), (min-width: 640px) calc(45vw - 0.5625rem), calc(50vw - 1.625rem)"',
    )
    expect(html).not.toContain('loading="eager"')
    expect(html).not.toContain('fetchPriority="high"')
  })

  it('keeps non-priority product imagery lazy', () => {
    const html = renderToStaticMarkup(<ProductCard product={product} />)

    expect(getImagePreloads(html)).toHaveLength(0)
    expect(html).toContain('loading="lazy"')
    expect(html).not.toContain('loading="eager"')
    expect(html).not.toContain('fetchPriority="auto"')
  })

  it('shows size, quantity, and add-to-cart controls for multi-variant products', () => {
    const multiVariantProduct: CollectionProductSummary = {
      ...product,
      variants: multiVariants,
    }
    const html = renderToStaticMarkup(
      <ProductCard product={multiVariantProduct} />,
    )
    expect(html).not.toContain('Quick View')
    expect(html).toContain('Select pack size for Tea Masters Sencha Green Tea')
    expect(html).toContain('Quantity for Tea Masters Sencha Green Tea')
    expect(html).toContain('Add to cart')
  })

  it('shows organic certification badge from tags (CARD-03)', () => {
    const html = renderToStaticMarkup(<ProductCard product={product} />)
    // organic badge text
    expect(html).toContain('Organic')
  })

  it('omits productType eyebrow when productType is empty (CARD-02)', () => {
    const noTypeProduct: CollectionProductSummary = {
      ...product,
      productType: '',
    }
    const html = renderToStaticMarkup(<ProductCard product={noTypeProduct} />)
    expect(html).not.toContain('type-mono-meta text-ink-faint mb-1')
  })

  it('renders from a bare ProductSummary (recommendation carousels)', () => {
    const summaryOnlyProduct = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      featuredImage: product.featuredImage,
      priceRange: product.priceRange,
    }
    const html = renderToStaticMarkup(
      <ProductCard product={summaryOnlyProduct} />,
    )

    // Same approved layout
    expect(html).toContain('aspect-square')
    expect(html).toContain('$12.00')
    // Unknown variants → Quick View trigger instead of quick-add
    expect(html).toContain('Quick View')
    expect(html).not.toContain('Add to cart')
    // No tags → no badges; unknown availability → not sold out
    expect(html).not.toContain('Organic')
    expect(html).not.toContain('Out of stock')
  })

  it('shows the normal purchase details on sold-out cards with every control disabled', () => {
    const soldOutProduct: CollectionProductSummary = {
      ...product,
      availableForSale: false,
      variants: [{ ...singleVariant, availableForSale: false }],
    }
    const html = renderToStaticMarkup(<ProductCard product={soldOutProduct} />)

    expect(html).toContain('Sold out')
    expect(html).toContain('Select pack size for Tea Masters Sencha Green Tea')
    expect(html).toContain('Quantity for Tea Masters Sencha Green Tea')
    expect(html).toContain('name="quantity"')
    expect(html.match(/disabled=""/g)).toHaveLength(5)
  })
})
