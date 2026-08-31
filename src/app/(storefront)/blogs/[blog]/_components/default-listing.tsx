import { FeaturedArticles } from '@/components/blog/featured-articles'
import { DEFAULT_BLOG_HANDLE } from '@/lib/blog/operations'
import type { DefaultBlogListing } from '@/lib/blog/operations'

import { ListingResults } from './listing-results'

type DefaultListingProps = {
  listingData: DefaultBlogListing
}

// Unfiltered default listing. Fully derivable from cached data, so it renders
// server-side in the static shell. Featured articles only appear on page 1.
export function DefaultListing({ listingData }: DefaultListingProps) {
  const showFeatured =
    listingData.paginated.currentPage === 1 &&
    listingData.featuredArticles.length > 0

  return (
    <>
      {showFeatured && (
        <FeaturedArticles
          articles={listingData.featuredArticles}
          blogHandle={DEFAULT_BLOG_HANDLE}
        />
      )}

      <ListingResults
        activeTag={null}
        heading="Latest Articles"
        paginated={listingData.paginated}
        query={null}
        tags={listingData.allTags}
        className={showFeatured ? 'pt-0' : undefined}
      />
    </>
  )
}
