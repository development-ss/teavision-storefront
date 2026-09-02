import { Suspense } from 'react'
import { SlidersHorizontal } from 'lucide-react'

import { Section } from '@/components/ui/section'
import {
  createClearFiltersHref,
  createSearchHref,
} from '@/lib/searchanise/params'
import type {
  SearchRouteState,
  SearchaniseSearchResult,
} from '@/lib/searchanise/types'

import { ActiveFilterChips } from './active-filter-chips'
import { ProductResults } from './product-results'
import { SearchAlert } from './search-alert'
import {
  createActiveFilters,
  createPanelFacets,
  formatResultCount,
} from './search-results-helpers'
import { SearchFilterPanel } from '../search-filter-panel'
import { SearchPagination } from '../search-pagination'
import { SearchSortSelect } from '../search-sort-select'

type SearchResultsViewProps = {
  result: SearchaniseSearchResult
  state: SearchRouteState
}

export function SearchResultsView({ result, state }: SearchResultsViewProps) {
  const clearHref = createClearFiltersHref(state)
  const retryHref = createSearchHref(state)
  const panelFacets = createPanelFacets(result.facets, state)
  const activeFilters = createActiveFilters(result.facets, state)
  const selectedFilterCount = state.filters.length
  const hasStandaloneStatus =
    result.status === 'idle' ||
    result.status === 'unavailable' ||
    result.status === 'error' ||
    (result.products.length === 0 && selectedFilterCount === 0)

  return (
    <Section.Root
      tone="surface"
      spacing={hasStandaloneStatus ? 'none' : 'compact'}
    >
      <Section.Container>
        {result.status === 'idle' ? (
          <div className="max-w-2xl pb-8 md:pb-12">
            <SearchAlert
              tone="empty"
              message="Enter a search term to find matching products."
            />
          </div>
        ) : result.status === 'unavailable' || result.status === 'error' ? (
          <div className="max-w-2xl pb-8 md:pb-12">
            <SearchAlert
              actionHref={retryHref}
              actionLabel="Retry search"
              tone="error"
              message={
                result.message ?? 'Search results are unavailable right now.'
              }
            />
          </div>
        ) : result.products.length === 0 && selectedFilterCount === 0 ? (
          <div className="max-w-2xl pb-8 md:pb-12">
            <SearchAlert
              tone="empty"
              message="No products matched this search. Try a different term."
            />
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[252px_minmax(0,1fr)] lg:gap-10">
            <aside className="hidden self-start lg:sticky lg:top-32 lg:block">
              <SearchFilterPanel
                clearHref={clearHref}
                facets={panelFacets}
                resultCount={result.pagination.totalItems}
                selectedFilterCount={selectedFilterCount}
              />
            </aside>

            <div className="grid gap-6 self-start">
              <div className="border-hairline grid gap-5 border-b pb-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="type-mono-meta text-ink-faint">
                      {formatResultCount(result)}
                    </p>
                  </div>
                  <Suspense fallback={null}>
                    <SearchSortSelect currentSort={state.sort} />
                  </Suspense>
                </div>

                <ActiveFilterChips
                  activeFilters={activeFilters}
                  clearHref={clearHref}
                />

                <details className="bg-paper border-hairline rounded-lg border lg:hidden">
                  <summary className="type-label text-ink focus-visible:ring-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
                    <span className="inline-flex items-center gap-2">
                      <SlidersHorizontal
                        className="size-4"
                        aria-hidden="true"
                      />
                      Filter results
                    </span>
                    {selectedFilterCount > 0 && (
                      <span className="type-mono-meta text-ink-faint">
                        {selectedFilterCount} active
                      </span>
                    )}
                  </summary>
                  <div className="border-hairline border-t p-4">
                    <SearchFilterPanel
                      clearHref={clearHref}
                      facets={panelFacets}
                      resultCount={result.pagination.totalItems}
                      selectedFilterCount={selectedFilterCount}
                    />
                  </div>
                </details>
              </div>

              <ProductResults clearHref={clearHref} result={result} />

              <SearchPagination pagination={result.pagination} state={state} />
            </div>
          </div>
        )}
      </Section.Container>
    </Section.Root>
  )
}
