import { getVisibleProductReviewSummary } from '@/lib/reviews/summary'
import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { getProduct } from '@/lib/shopify/operations/product'
import type { Product, ProductQuickViewDetails } from '@/lib/shopify/types'
import type { ProductReviewSummary } from '@/lib/reviews/summary'

type RouteContext = {
  params: Promise<{ handle: string }>
}

function toQuickViewDetails(
  product: Product,
  reviewSummary: ProductReviewSummary | null,
): ProductQuickViewDetails {
  return {
    description: product.description,
    handle: product.handle,
    id: product.id,
    images: product.images,
    options: product.options,
    priceRange: product.priceRange,
    rating: reviewSummary?.rating,
    reviewCount: reviewSummary?.reviewCount,
    title: product.title,
    variants: product.variants,
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { handle } = await params

  try {
    const product = await getProduct(handle)

    if (!product) {
      return Response.json({ message: 'Product not found' }, { status: 404 })
    }

    const trustooRatings = await getTrustooProductRatings([product.handle])
    const visibleReviewSummary = getVisibleProductReviewSummary(
      trustooRatings[product.handle] ?? product,
    )

    return Response.json(toQuickViewDetails(product, visibleReviewSummary))
  } catch {
    return Response.json(
      { message: 'Product quick view is unavailable' },
      { status: 503 },
    )
  }
}
