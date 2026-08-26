import type { FilterType as ShopifyFilterType } from './generated/graphql'

export type Money = {
  amount: string
  currencyCode: string
}

export type BulkPricingTier = {
  minimumQuantity: number
  price?: Money
  discountPercent?: number
  label?: string
}

export type ShopifyImage = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  currentlyNotInStock?: boolean
  quantityAvailable?: number | null
  quantityRule?: {
    minimum: number
    maximum: number | null
    increment: number
  }
  price: Money
  quantityPriceBreaks: BulkPricingTier[]
  image?: ShopifyImage | null
}

export type ShopifyQuantityRule = NonNullable<ProductVariant['quantityRule']>

export type ProductOption = {
  name: string
  values: string[]
}

export type Product = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  tags: string[]
  images: ShopifyImage[]
  priceRange: { minVariantPrice: Money }
  variants: ProductVariant[]
  options: ProductOption[]
  rating?: number
  reviewCount?: number
}

export type ProductQuickViewDetails = Pick<
  Product,
  | 'description'
  | 'handle'
  | 'id'
  | 'images'
  | 'options'
  | 'priceRange'
  | 'rating'
  | 'reviewCount'
  | 'title'
  | 'variants'
>

export type ProductSummary = {
  id: string
  handle: string
  title: string
  updatedAt?: string
  description?: string
  availableForSale?: boolean
  featuredImage: ShopifyImage | null
  priceRange: { minVariantPrice: Money }
  rating?: number
  reviewCount?: number
}

export type CollectionProductSummary = ProductSummary & {
  availableForSale: boolean
  productType: string
  tags: string[]
  variants: ProductVariant[]
}

export type CollectionFilterValue = {
  id: string
  label: string
  count: number
  input: string
  href?: string
}

export type CollectionProductFilter = {
  id: string
  label: string
  type: ShopifyFilterType
  values: CollectionFilterValue[]
}

export type CollectionProductsResult = {
  products: CollectionProductSummary[]
  filters: CollectionProductFilter[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  }
}

export type CollectionPageIndex = {
  /** Total number of products in this collection/filter combination */
  totalCount: number
  /** True total pages, based on cursor index */
  totalPages: number
  /** The resolved `after` cursor for the requested page (null = start from beginning) */
  afterCursor: string | null
  /**
   * Raw cursor-index page backing each 1-based display page when a tag match
   * constrains the view (Shopify ignores tag filters unless the store enables
   * tag facets, so matching is client-side). Null when display pages equal
   * raw pages.
   */
  displayPageToRawPage: number[] | null
}

export type Collection = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  featuredImage: ShopifyImage | null
  updatedAt: string
  seo: {
    title: string | null
    description: string | null
  }
}

export type CollectionSummary = Omit<Collection, 'descriptionHtml'>

export type CartLine = {
  id: string
  quantity: number
  cost: {
    amountPerQuantity: Money
    compareAtAmountPerQuantity?: Money | null
    subtotalAmount: Money
    totalAmount: Money
  }
  discountAllocations: CartLineDiscountAllocation[]
  merchandise: {
    id: string
    title: string
    currentlyNotInStock?: boolean
    price: Money
    quantityAvailable?: number | null
    quantityRule?: ShopifyQuantityRule
    quantityPriceBreaks: BulkPricingTier[]
    product: {
      handle: string
      title: string
      featuredImage: ShopifyImage | null
    }
  }
}

export type CartLineDiscountAllocation = {
  title: string | null
  discountedAmount: Money
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    totalAmount: Money
    subtotalAmount: Money
  }
  lines: CartLine[]
}

export {
  CartBuyerIdentityUpdateDocument,
  CartCreateDocument,
  CartLinesAddDocument,
  CartLinesRemoveDocument,
  CartLinesUpdateDocument,
  FilterType,
  GetArticleDocument,
  GetBlogDocument,
  GetCartDocument,
  GetCollectionCursorIndexDocument,
  GetCollectionDocument,
  GetCollectionMenuDocument,
  GetCollectionProductsDocument,
  GetCollectionSummariesDocument,
  GetCollectionsDocument,
  GetPageDocument,
  GetPagesDocument,
  GetProductDocument,
  GetProductRecommendationsDocument,
  GetProductsDocument,
  GetProductVariantsDocument,
  ProductCollectionSortKeys,
  ProductRecommendationIntent,
} from './generated/graphql'

export type {
  CartBuyerIdentityInput,
  CartBuyerIdentityUpdateMutation,
  CartCreateMutation,
  CartLinesAddMutation,
  CartLinesRemoveMutation,
  CartLinesUpdateMutation,
  GetArticleQuery,
  GetBlogQuery,
  GetCartQuery,
  GetCollectionCursorIndexQuery,
  GetCollectionCursorIndexQueryVariables,
  GetCollectionMenuQuery,
  GetCollectionProductsQuery,
  GetCollectionQuery,
  GetCollectionSummariesQuery,
  GetCollectionsQuery,
  GetPageQuery,
  GetPagesQuery,
  GetProductQuery,
  GetProductRecommendationsQuery,
  GetProductsQuery,
  GetProductVariantsQuery,
  ProductFilter,
} from './generated/graphql'
