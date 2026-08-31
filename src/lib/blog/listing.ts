import {
  getBlogPath,
  getCanonicalBlogListingPath,
  getTagPath,
} from '@/lib/blog/operations'

export const DEFAULT_LISTING_DESCRIPTION =
  'Expert insights on bulk tea purchasing, supplier guides, and cost-effective solutions for Australian businesses.'

export function parseListingPage(page?: string): number {
  return Math.max(1, parseInt(page ?? '1', 10) || 1)
}

export function getTagListingHeading(tag: string): string {
  return `${tag.charAt(0).toUpperCase()}${tag.slice(1)} Articles`
}

// Crawlable, path-based listing URLs. Page 1 is the bare listing path; deeper
// pages use /page/N so every listing URL is a static, indexable route with no
// query string.
export function getListingHref({
  activeTag,
  blogHandle,
  page,
}: {
  activeTag: string | null
  blogHandle: string
  page?: number
}) {
  if (!activeTag && (!page || page <= 1)) {
    return getCanonicalBlogListingPath(blogHandle)
  }

  const path = activeTag
    ? getTagPath(blogHandle, activeTag)
    : getBlogPath(blogHandle)

  return page && page > 1 ? `${path}/page/${page}` : path
}
