import { Section } from '@/components/ui/section'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { PaginatedArticles } from '@/lib/blog/operations'

import { ArticleList } from '../article-list'
import { EmptyState } from '../empty-state'
import { Pagination } from '../pagination'
import { TagFilterNav } from '../tag-filter-nav'

type ArticleResultsProps = {
  activeTag: string | null
  blogHandle: string
  heading: string
  paginated: PaginatedArticles
  query?: string | null
  tags: string[]
  className?: string
}

export function ArticleResults({
  activeTag,
  blogHandle,
  heading,
  paginated,
  query,
  tags,
  className,
}: ArticleResultsProps) {
  const normalizedQuery = query?.trim() ?? ''

  return (
    <Section.Root tone="sunken" className={className}>
      <Section.Container>
        <div className="max-w-prose">
          <Eyebrow className="mb-4">Tea Journal</Eyebrow>
          <h2
            id="articles"
            tabIndex={-1}
            className="type-heading-01 focus-visible:ring-ring scroll-mt-34 rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:scroll-mt-46"
          >
            {heading}
          </h2>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {normalizedQuery && (
              <p className="type-body-sm text-ink-soft mt-3">
                Showing matches for{' '}
                <span className="type-label text-ink">{normalizedQuery}</span>
              </p>
            )}
          </div>
          <p className="type-mono-meta text-ink-faint">
            {paginated.totalArticles}{' '}
            {paginated.totalArticles === 1 ? 'article' : 'articles'}
          </p>
        </div>

        <TagFilterNav
          activeTag={activeTag}
          blogHandle={blogHandle}
          tags={tags}
        />

        <Pagination
          activeTag={activeTag}
          blogHandle={blogHandle}
          currentPage={paginated.currentPage}
          totalPages={paginated.totalPages}
          variant="compact"
        />

        {paginated.totalArticles === 0 ? (
          <EmptyState />
        ) : (
          <ArticleList articles={paginated.articles} blogHandle={blogHandle} />
        )}

        <Pagination
          activeTag={activeTag}
          blogHandle={blogHandle}
          currentPage={paginated.currentPage}
          totalPages={paginated.totalPages}
        />
      </Section.Container>
    </Section.Root>
  )
}
