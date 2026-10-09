import type { Metadata } from 'next'

import { DEFAULT_LISTING_DESCRIPTION, getListingHref } from '@/lib/blog/listing'
import {
  CANONICAL_BLOG_LISTING_PATH,
  DEFAULT_BLOG_HANDLE,
  findTagBySlug,
  getBlog,
  getUniqueArticleTags,
} from '@/lib/blog/operations'
import { DEFAULT_OG_IMAGE } from '@/lib/seo/default-og-image'
import { withNoindexRobots } from '@/lib/seo/noindex'

type ListingMetadataInput = {
  tag?: string
  page?: number
}

export async function generateListingMetadata({
  tag,
  page = 1,
}: ListingMetadataInput): Promise<Metadata> {
  const blogData = await getBlog(DEFAULT_BLOG_HANDLE)
  if (!blogData) return { title: 'Tea Journal' }

  const tags = getUniqueArticleTags(blogData.articles)
  const activeTag = tag ? findTagBySlug(tags, tag) : null
  const currentPage = Math.max(1, page)

  const titleParts = [
    activeTag ? `${blogData.title}: ${activeTag}` : blogData.seo.title,
    currentPage > 1 ? `Page ${currentPage}` : null,
  ].filter((part): part is string => Boolean(part))
  const title = titleParts.join(' | ') || blogData.title
  const description = blogData.seo.description ?? DEFAULT_LISTING_DESCRIPTION

  const canonical =
    !activeTag && currentPage === 1
      ? CANONICAL_BLOG_LISTING_PATH
      : getListingHref({
          blogHandle: DEFAULT_BLOG_HANDLE,
          activeTag,
          page: currentPage,
        })

  // Tag pages are thin filtered views — keep them out of the index but let
  // crawlers follow through to the canonical articles.
  const noIndex = blogData.seo.noIndex || Boolean(activeTag)

  return withNoindexRobots({
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      images: blogData.seo.ogImage
        ? [
            {
              url: blogData.seo.ogImage.url,
              alt: blogData.seo.ogImage.altText ?? title,
            },
          ]
        : [DEFAULT_OG_IMAGE],
    },
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: !blogData.seo.noIndex }
      : undefined,
  })
}

export async function generateSearchMetadata(
  query: string | undefined,
): Promise<Metadata> {
  const blogData = await getBlog(DEFAULT_BLOG_HANDLE)
  const blogTitle = blogData?.title ?? 'Tea Journal'
  const trimmed = query?.trim()
  const title = trimmed
    ? `Search: "${trimmed}" | ${blogTitle}`
    : `Search | ${blogTitle}`

  return withNoindexRobots({
    title,
    description: DEFAULT_LISTING_DESCRIPTION,
    robots: { index: false },
  })
}
