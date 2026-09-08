import type { Metadata } from 'next'

import {
  getCollectionHeading,
  getCollectionPageNumber,
  getCollectionHero,
  getCollectionIntro,
  isPublicCollection,
  truncateMetaDescription,
} from '@/lib/shopify/collection-content'
import type { Collection } from '@/lib/shopify/types'

import { withNoindexRobots } from './noindex'

export type CollectionSearchParams = {
  page?: string | string[]
  sort?: string | string[]
  filter?: string | string[]
  q?: string | string[]
}

// Imported snippets copied from another collection. Match the old text exactly
// so a future Shopify SEO edit takes precedence without a code change.
const copiedDescriptions: Record<string, string> = {
  'ginkgo-biloba-tea':
    'Looking for Ginger Tea Bags? Wholesale prices on our Organic, Natural Bulk Ginger Tea Bags. Visit our site to buy tea in Australia!',
  'organic-hibiscus':
    'Looking for Hibiscus? Wholesale prices on our Organic, Natural Bulk Hibiscus Tea. Visit our site to buy tea in Australia!',
  'wholesale-white-tea':
    'Looking for White Tea? Wholesale prices on our Organic, Natural & Healthy White Tea. Visit our site to buy tea in Australia!',
}

export function getCollectionCanonicalPath(handle: string, page = 1): string {
  const base = `/collections/${handle}`
  return page > 1 ? `${base}?page=${page}` : base
}

export function getCollectionMetadata(
  collection: Collection,
  search: CollectionSearchParams = {},
  category?: string,
): Metadata {
  const heading = getCollectionHeading(collection)
  let title = collection.seo.title?.trim() || `${heading} | Teavision`
  // Preserve the wholesale intent when an imported title repeats the retail page.
  if (/^wholesale\b/i.test(heading) && !/\b(?:wholesale|bulk)\b/i.test(title))
    title = `${heading} | Teavision`
  const authoredDescription = collection.seo.description?.trim()
  const hasCopiedDescription =
    Object.hasOwn(copiedDescriptions, collection.handle) &&
    authoredDescription === copiedDescriptions[collection.handle]
  const description = truncateMetaDescription(
    (!hasCopiedDescription &&
      [authoredDescription, getCollectionIntro(collection)].find(
        (text) =>
          text && text.length >= 40 && !/^read (?:more|less)/i.test(text),
      )) ||
      `Browse ${heading} from Teavision, Australia's bulk tea and herb supplier. Explore the range and contact our team for wholesale sourcing.`,
  )
  const hasFilter = [search.q, search.filter].some((value) =>
    (Array.isArray(value) ? value : [value]).some((item) => item?.trim()),
  )
  const sort = Array.isArray(search.sort) ? search.sort[0] : search.sort
  const isFiltered = Boolean(
    category || hasFilter || (sort && sort !== 'featured'),
  )
  const canonicalPath = getCollectionCanonicalPath(
    collection.handle,
    isFiltered ? 1 : getCollectionPageNumber(search.page),
  )
  const image = getCollectionHero(collection).image

  return withNoindexRobots({
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalPath },
    ...(isFiltered || !isPublicCollection(collection.handle)
      ? { robots: { index: false, follow: true } }
      : {}),
    openGraph: {
      title,
      description,
      url: canonicalPath,
      images: image
        ? [{ url: image.url, alt: image.altText || heading }]
        : undefined,
    },
  })
}
