import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { getPaginationHref, getPaginationItems } from './helpers'

type PaginationProps = {
  activeTag: string | null
  blogHandle: string
  currentPage: number
  totalPages: number
  variant?: 'full' | 'compact'
}

export function Pagination({
  activeTag,
  blogHandle,
  currentPage,
  totalPages,
  variant = 'full',
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label={
        variant === 'compact' ? 'Article page navigation' : 'Blog pagination'
      }
      className={cn(
        'flex flex-wrap items-center gap-1',
        variant === 'compact'
          ? 'mb-6 justify-end'
          : 'border-hairline mt-12 justify-center border-t pt-8',
      )}
    >
      {variant === 'compact' && (
        <p className="type-body-sm text-ink-soft mr-auto">
          Page {currentPage} of {totalPages}
        </p>
      )}
      {currentPage > 1 && (
        <Link
          href={getPaginationHref({
            activeTag,
            blogHandle,
            page: currentPage - 1,
          })}
          rel="prev"
          aria-label="Previous page"
          className="type-label border-hairline bg-card text-ink hover:bg-brand-tint hover:text-brand focus-visible:ring-ring flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full border px-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      )}
      {variant === 'full' &&
        getPaginationItems(currentPage, totalPages).map((item) =>
          typeof item === 'number' ? (
            <Link
              key={item}
              href={getPaginationHref({
                activeTag,
                blogHandle,
                page: item,
              })}
              aria-current={item === currentPage ? 'page' : undefined}
              aria-label={`Page ${item}`}
              className={cn(
                'type-label focus-visible:ring-ring flex min-h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                item === currentPage
                  ? 'bg-brand text-paper'
                  : 'border-hairline bg-card text-ink hover:bg-brand-tint hover:text-brand border',
              )}
            >
              {item}
            </Link>
          ) : (
            <span
              key={item}
              className="type-label text-ink-faint flex min-h-11 w-11 items-center justify-center"
              aria-hidden="true"
            >
              …
            </span>
          ),
        )}
      {currentPage < totalPages && (
        <Link
          href={getPaginationHref({
            activeTag,
            blogHandle,
            page: currentPage + 1,
          })}
          rel="next"
          aria-label="Next page"
          className="type-label border-hairline bg-card text-ink hover:bg-brand-tint hover:text-brand focus-visible:ring-ring flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full border px-4 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}
