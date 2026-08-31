import type {
  SearchRouteState,
  SearchanisePagination as SearchanisePaginationData,
} from '@/lib/searchanise/types'
import { createPageHref } from '@/lib/searchanise/params'
import { Pagination } from '@/components/ui/pagination'

type SearchPaginationProps = {
  pagination: SearchanisePaginationData
  state: SearchRouteState
  className?: string
}

export function SearchPagination({
  className,
  pagination,
  state,
}: SearchPaginationProps) {
  return (
    <Pagination
      currentPage={pagination.currentPage}
      totalPages={pagination.totalPages}
      buildPageHref={(page) => createPageHref(state, page)}
      aria-label="Search result pages"
      className={className}
    />
  )
}
