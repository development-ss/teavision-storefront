import type { Collection, CollectionProductSummary } from '@/lib/shopify/types'
import { serializeInlineJson } from '@/lib/seo/serialize-inline-json'
import { getCollectionHero } from '@/lib/shopify/collection-content'

type JsonLdProps = {
  baseUrl: string
  collection: Collection
  collectionUrl: string
  products: CollectionProductSummary[]
  category?: string
  categoryUrl?: string
  startPosition?: number
}

export function JsonLd({
  baseUrl,
  collection,
  collectionUrl,
  products,
  category,
  categoryUrl,
  startPosition = 0,
}: JsonLdProps) {
  const hero = getCollectionHero(collection)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${baseUrl}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Collections',
            item: `${baseUrl}/collections`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: collection.title,
            item: `${baseUrl}/collections/${collection.handle}`,
          },
          ...(category && categoryUrl
            ? [
                {
                  '@type': 'ListItem',
                  position: 4,
                  name: category,
                  item: categoryUrl,
                },
              ]
            : []),
        ],
      },
      {
        '@type': 'CollectionPage',
        name: category ? `${hero.title}: ${category}` : hero.title,
        description: hero.intro,
        url: collectionUrl,
        dateModified: collection.updatedAt,
      },
      {
        '@type': 'ItemList',
        name: `${collection.title} products`,
        itemListElement: products.slice(0, 24).map((product, index) => ({
          '@type': 'ListItem',
          position: startPosition + index + 1,
          url: `${baseUrl}/products/${product.handle}`,
          item: {
            '@type': 'Product',
            name: product.title,
            image: product.featuredImage?.url,
            offers: {
              '@type': 'Offer',
              price: product.priceRange.minVariantPrice.amount,
              priceCurrency: product.priceRange.minVariantPrice.currencyCode,
            },
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeInlineJson(structuredData) }}
    />
  )
}
