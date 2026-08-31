import { RelatedProductsCarousel } from '@/components/product/related-products-carousel'
import { SearchaniseRecommendations } from '@/components/product/searchanise-recommendations'
import {
  getProduct,
  getProductRecommendations,
} from '@/lib/shopify/operations/product'
import type { Cart, Product, ProductSummary } from '@/lib/shopify/types'
import { searchanisePublicConfig } from '@/lib/env/public'

const CART_RECOMMENDATIONS_TITLE =
  'Customers Who Bought This Product Also Bought'
const CART_RECOMMENDATIONS_LIMIT = 12
const CART_RECOMMENDATION_SEED_LIMIT = 3

function getUniqueCartProductHandles(cart: Cart): string[] {
  const handles = new Set<string>()

  cart.lines.forEach((line) => {
    handles.add(line.merchandise.product.handle)
  })

  return Array.from(handles)
}

async function getCartRecommendationProducts(
  cart: Cart,
): Promise<ProductSummary[]> {
  const cartProductHandles = getUniqueCartProductHandles(cart)
  const cartProductHandleSet = new Set(cartProductHandles)
  const seedProducts = (
    await Promise.all(
      cartProductHandles
        .slice(0, CART_RECOMMENDATION_SEED_LIMIT)
        .map((handle) => getProduct(handle)),
    )
  ).filter((product): product is Product => product !== null)

  const recommendations = await Promise.all(
    seedProducts.map((product) => getProductRecommendations(product.id)),
  )
  const seenProductHandles = new Set<string>()
  const products: ProductSummary[] = []

  recommendations.flat().forEach((product) => {
    if (
      cartProductHandleSet.has(product.handle) ||
      seenProductHandles.has(product.handle) ||
      products.length >= CART_RECOMMENDATIONS_LIMIT
    ) {
      return
    }

    seenProductHandles.add(product.handle)
    products.push(product)
  })

  return products
}

export async function CartRecommendations({ cart }: { cart: Cart }) {
  const fallbackProducts = await getCartRecommendationProducts(cart)

  if (fallbackProducts.length === 0) return null

  return (
    <SearchaniseRecommendations
      fallback={
        <RelatedProductsCarousel
          products={fallbackProducts}
          ariaLabel="Recommended products for your order"
          heading={
            <h2
              key="cart-recommendations-title"
              id="cart-recommendations-title"
              className="type-heading-03 text-ink"
            >
              {CART_RECOMMENDATIONS_TITLE}
            </h2>
          }
        />
      }
      title={CART_RECOMMENDATIONS_TITLE}
      titleId="cart-recommendations-title"
      sectionClassName="border-hairline mt-12 border-t pt-10"
      headingClassName="type-heading-03 text-ink"
      {...(!searchanisePublicConfig.enabled || !searchanisePublicConfig.apiKey
        ? { fallbackDelayMs: 0 }
        : undefined)}
    />
  )
}
