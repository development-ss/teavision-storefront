import 'server-only'

import { shopifyAdminFetch } from '@/lib/shopify/admin-client'
import type { Product, ProductVariant } from '@/lib/shopify/types'

import { parseProductRating, reshapeImage, reshapeMoney } from './mappers'

const PRODUCT_PREVIEW_QUERY = `#graphql
  query ProductPreview($id: ID!) {
    shop {
      currencyCode
    }
    product(id: $id) {
      id
      handle
      title
      description
      descriptionHtml
      status
      tags
      collections(first: 250) {
        nodes {
          id
        }
      }
      media(first: 250) {
        nodes {
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
      options {
        name
        values
      }
      variants(first: 250) {
        nodes {
          id
          title
          availableForSale
          inventoryQuantity
          price
          media(first: 1) {
            nodes {
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
      priceRangeV2 {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      ratingMetafield: metafield(namespace: "reviews", key: "rating") {
        value
      }
      ratingCountMetafield: metafield(namespace: "reviews", key: "rating_count") {
        value
      }
    }
  }
`

type AdminImage = {
  url: string | null
  altText: string | null
  width: number | null
  height: number | null
}

type AdminMediaNode = {
  image: AdminImage | null
}

type AdminMediaConnection = {
  nodes: AdminMediaNode[]
}

type AdminProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  inventoryQuantity: number | null
  price: string
  media: AdminMediaConnection
}

type AdminProductPreview = {
  id: string
  handle: string
  title: string
  description: string | null
  descriptionHtml: string | null
  status: string
  tags: string[]
  collections: { nodes: Array<{ id: string }> }
  media: AdminMediaConnection
  options: Array<{ name: string; values: string[] }>
  variants: { nodes: AdminProductVariant[] }
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string }
  } | null
  ratingMetafield?: { value: string } | null
  ratingCountMetafield?: { value: string } | null
}

type AdminProductPreviewResponse = {
  shop: { currencyCode: string }
  product: AdminProductPreview | null
}

function toImage(image: AdminImage | null | undefined) {
  return image?.url ? reshapeImage(image) : null
}

function toVariant(
  variant: AdminProductVariant,
  currencyCode: string,
): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    currentlyNotInStock: false,
    quantityAvailable: variant.inventoryQuantity,
    quantityRule: {
      minimum: 1,
      maximum: null,
      increment: 1,
    },
    price: reshapeMoney({ amount: variant.price, currencyCode }),
    quantityPriceBreaks: [],
    image: toImage(variant.media.nodes[0]?.image),
  }
}

function toProduct(
  product: AdminProductPreview,
  shopCurrencyCode: string,
): Product {
  const firstVariantCurrency =
    product.priceRangeV2?.minVariantPrice.currencyCode
  const currencyCode = firstVariantCurrency || shopCurrencyCode
  const minVariantPrice = product.priceRangeV2?.minVariantPrice ?? {
    amount: product.variants.nodes[0]?.price ?? '0',
    currencyCode,
  }
  const rating = parseProductRating(product)

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description ?? '',
    descriptionHtml: product.descriptionHtml ?? '',
    tags: product.tags,
    collectionIds: product.collections.nodes.map((collection) => collection.id),
    images: product.media.nodes.flatMap((node) => {
      const image = toImage(node.image)
      return image ? [image] : []
    }),
    priceRange: { minVariantPrice: reshapeMoney(minVariantPrice) },
    variants: product.variants.nodes.map((variant) =>
      toVariant(variant, currencyCode),
    ),
    options: product.options,
    ...rating,
  }
}

export type ProductPreview = {
  product: Product
  status: string
}

export async function getProductPreview(
  numericProductId: string,
): Promise<ProductPreview | null> {
  if (!/^\d+$/.test(numericProductId)) return null

  const response = await shopifyAdminFetch<
    AdminProductPreviewResponse,
    { id: string }
  >({
    query: PRODUCT_PREVIEW_QUERY,
    variables: { id: `gid://shopify/Product/${numericProductId}` },
  })

  if (!response.product) return null

  return {
    product: toProduct(response.product, response.shop.currencyCode),
    status: response.product.status,
  }
}
