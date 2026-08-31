import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { getVisibleProductReviewSummary } from '@/lib/reviews/summary'
import { getCollectionProducts } from '@/lib/shopify/operations/collection'
import { getProductRecommendations } from '@/lib/shopify/operations/product'
import type { Product, ProductSummary } from '@/lib/shopify/types'
import { RelatedProductsCarousel } from '@/components/product/related-products-carousel'
import { Section } from '@/components/ui/section'

const RELATED_COLLECTION_FETCH_LIMIT = 12
const RELATED_PRODUCTS_TITLE = 'Related Products'

const RELATED_COLLECTION_BY_TAG = new Map<string, string>([
  ['categories_All Herbs', 'dried-herbs'],
])

function getRelatedCollectionHandle(product: Product): string | null {
  for (const tag of product.tags) {
    const handle = RELATED_COLLECTION_BY_TAG.get(tag)
    if (handle) return handle
  }

  return null
}

async function getRelatedProducts(product: Product): Promise<ProductSummary[]> {
  const relatedCollectionHandle = getRelatedCollectionHandle(product)
  let products: ProductSummary[]

  if (relatedCollectionHandle) {
    const collectionProducts = await getCollectionProducts(
      relatedCollectionHandle,
      RELATED_COLLECTION_FETCH_LIMIT,
    )

    products = collectionProducts
      .filter((item) => item.handle !== product.handle)
      .slice(0, RELATED_COLLECTION_FETCH_LIMIT)
  } else {
    products = await getProductRecommendations(product.id, 'RELATED')
  }

  const reviewSummaries = await getTrustooProductRatings(
    products.map((relatedProduct) => relatedProduct.handle),
  )

  return products.map((relatedProduct) => {
    const visibleReviewSummary = getVisibleProductReviewSummary(
      reviewSummaries[relatedProduct.handle] ?? relatedProduct,
    )

    return {
      ...relatedProduct,
      rating: visibleReviewSummary?.rating,
      reviewCount: visibleReviewSummary?.reviewCount,
    }
  })
}

export async function RelatedProducts({ product }: { product: Product }) {
  const products = await getRelatedProducts(product)
  if (products.length === 0) return null

  return (
    <Section.Root
      tone="transparent"
      spacing="none"
      className="border-hairline border-t pt-10"
      aria-labelledby="related-products-title"
    >
      <RelatedProductsCarousel
        products={products}
        heading={
          <h2
            key="related-products-title"
            id="related-products-title"
            className="font-display text-ink text-[1.4rem]"
          >
            {RELATED_PRODUCTS_TITLE}
          </h2>
        }
      />
    </Section.Root>
  )
}
