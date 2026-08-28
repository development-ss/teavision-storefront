/**
 * @vitest-environment jsdom
 */
import { isValidElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProduct, getProductRecommendations } from '@/lib/shopify/operations/product'
import { makeCart } from '@/tests/fixtures/shopify/cart'
import { makeProduct, makeProductSummary } from '@/tests/fixtures/shopify/product'

import { CartRecommendations } from './recommendations'

vi.mock('@/components/product', () => ({
  RelatedProductsCarousel: ({
    ariaLabel,
    heading,
    products,
  }: {
    ariaLabel?: string
    heading?: ReactNode
    products: Array<{ id: string; title: string }>
  }) => (
    <div
      role="region"
      aria-label={ariaLabel}
      data-heading-key={
        isValidElement(heading) ? String(heading.key) : undefined
      }
    >
      {heading}
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.title}</li>
        ))}
      </ul>
    </div>
  ),
  SearchaniseRecommendations: ({ fallback }: { fallback?: ReactNode }) => (
    <div data-searchanise-fallback>{fallback}</div>
  ),
}))

vi.mock('@/lib/shopify/operations/product', () => ({
  getProduct: vi.fn(),
  getProductRecommendations: vi.fn(),
}))

describe('CartRecommendations', () => {
  beforeEach(() => {
    vi.mocked(getProduct).mockResolvedValue(makeProduct())
    vi.mocked(getProductRecommendations).mockResolvedValue([
      makeProductSummary({
        id: 'gid://shopify/Product/recommended-tea',
        handle: 'recommended-tea',
        title: 'Recommended Tea',
      }),
    ])
  })

  it('renders the section title in the native fallback carousel', async () => {
    const html = renderToStaticMarkup(
      await CartRecommendations({ cart: makeCart() }),
    )

    expect(html).toContain('Customers Who Bought This Product Also Bought')
    expect(html).toContain('id="cart-recommendations-title"')
    expect(html).toContain('data-heading-key="cart-recommendations-title"')
    expect(html).toContain('Recommended Tea')
  })
})
