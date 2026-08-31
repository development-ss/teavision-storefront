import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import {
  DEFAULT_BLOG_HANDLE,
  getBlog,
  getTagListing,
  getUniqueArticleTags,
  slugifyTag,
} from '@/lib/blog/operations'
import { getTagListingHeading } from '@/lib/blog/listing'

import { HeroSlot } from '../../_components/hero-slot'
import { ListingResults } from '../../_components/listing-results'
import { generateListingMetadata } from '../../_lib/metadata'

type Props = {
  params: Promise<{ blog: string; tag: string }>
}

export async function generateStaticParams() {
  const blogData = await getBlog(DEFAULT_BLOG_HANDLE)
  const tags = getUniqueArticleTags(blogData?.articles ?? [])

  return tags.map((tag) => ({
    blog: DEFAULT_BLOG_HANDLE,
    tag: slugifyTag(tag),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return generateListingMetadata({ tag, page: 1 })
}

export default async function TaggedBlogPage({ params }: Props) {
  const { blog, tag } = await params
  const listing = await getTagListing(blog, tag, 1)
  if (!listing) notFound()

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
