import { ArticleResults } from '@/components/blog/article-results'
import { ContactSection } from '@/components/contact/contact-section'
import { DEFAULT_BLOG_HANDLE } from '@/lib/blog/operations'
import type { PaginatedArticles } from '@/lib/blog/operations'
import { submitContactFormAction } from '@/lib/contact/actions'

import { BlogNewsletterBand } from './blog-newsletter-band'

type ListingResultsProps = {
  activeTag: string | null
  heading: string
  paginated: PaginatedArticles
  query?: string | null
  tags: string[]
  className?: string
}

// The article grid + newsletter + contact block shared by the default, tag, and
// search listings. Pure and data-driven, so every caller renders server-side.
export function ListingResults({
  activeTag,
  heading,
  paginated,
  query,
  tags,
  className,
}: ListingResultsProps) {
  return (
    <>
      <ArticleResults
        activeTag={activeTag}
        blogHandle={DEFAULT_BLOG_HANDLE}
        heading={heading}
        paginated={paginated}
        query={query}
        tags={tags}
        className={className}
      />

      <BlogNewsletterBand />
      <ContactSection action={submitContactFormAction} />
    </>
  )
}
