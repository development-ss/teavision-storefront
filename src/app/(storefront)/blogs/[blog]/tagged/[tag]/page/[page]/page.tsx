import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { getTagListingHeading, parseListingPage } from '@/lib/blog/listing'
import {
  DEFAULT_BLOG_HANDLE,
  getBlog,
  getTagListing,
  getTagPath,
  getUniqueArticleTags,
  slugifyTag,
} from '@/lib/blog/operations'

import { HeroSlot } from '../../../../_components/hero-slot'
import { ListingResults } from '../../../../_components/listing-results'
import { generateListingMetadata } from '../../../../_lib/metadata'

type Props = {
  params: Promise<{ blog: string; tag: string; page: string }>
}

// Statically generate (tag, page) pairs for tags that actually paginate. With a
// small journal most tags fit on one page, so this list is usually empty.
export async function generateStaticParams() {
  const blogData = await getBlog(DEFAULT_BLOG_HANDLE)
  const tags = getUniqueArticleTags(blogData?.articles ?? [])

  const params: { blog: string; tag: string; page: string }[] = []
  for (const tag of tags) {
    const listing = await getTagListing(DEFAULT_BLOG_HANDLE, slugifyTag(tag), 1)
    const totalPages = listing?.paginated.totalPages ?? 1
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({
        blog: DEFAULT_BLOG_HANDLE,
        tag: slugifyTag(tag),
        page: String(page),
      })
    }
  }

  return params
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag, page } = await params
  return generateListingMetadata({ tag, page: parseListingPage(page) })
}

export default async function TaggedBlogPaginationPage({ params }: Props) {
  const { blog, tag, page } = await params
  const pageNumber = parseListingPage(page)
  if (pageNumber <= 1) redirect(getTagPath(blog, tag))

  const listing = await getTagListing(blog, tag, pageNumber)
  if (!listing || pageNumber > listing.paginated.totalPages) notFound()

  return (
    <>
      <HeroSlot />
      <ListingResults
        activeTag={listing.activeTag}
        heading={getTagListingHeading(listing.activeTag)}
        paginated={listing.paginated}
        query={null}
        tags={listing.tags}
      />
    </>
  )
}
