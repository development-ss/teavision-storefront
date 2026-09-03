import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { SlidersHorizontal } from 'lucide-react'

import type { CollectionProductFilter } from '@/lib/shopify/types'
import { getSelectedCollectionFilterLabels } from '@/lib/shopify/filters'
import { cn } from '@/lib/utils'

import { FilterPanel } from '../filter-panel'
import { FilterChips } from '../filter-chips'
import { SortSelect } from '../sort-select'

type ToolbarProps = {
  currentSort: string
  productCount: number
  filters: CollectionProductFilter[]
  selectedFilters: string[]
  collectionPath?: string
  clearHref?: string
  className?: string
  search?: ReactNode
}

export function Toolbar({
  currentSort,
  productCount,
  filters,
  selectedFilters,
  collectionPath,
  clearHref,
  className,
  search,
}: ToolbarProps) {
  const selectedFilterLabels = getSelectedCollectionFilterLabels(
    filters,
    selectedFilters,
  )

  return (
    <div className={cn('border-hairline border-y py-5 md:py-6', className)}>
      <div
        className={cn(
          'flex flex-col gap-4',
          search && 'lg:flex-row lg:items-center lg:gap-6',
        )}
      >
        {search ? <div className="min-w-0 flex-1">{search}</div> : null}

        <div
          className={cn(
            'flex items-center justify-between gap-4',
            search &&
              'border-hairline border-t pt-4 lg:shrink-0 lg:border-t-0 lg:pt-0',
          )}
        >
          <span className="type-mono-meta text-ink-faint whitespace-nowrap">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </span>
          <Suspense fallback={null}>
            <SortSelect currentSort={currentSort} />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={null}>
        <FilterChips
          collectionPath={collectionPath}
          selectedFilterLabels={selectedFilterLabels}
          selectedFilters={selectedFilters}
        />
      </Suspense>

      <details className="bg-paper border-hairline mt-4 rounded-lg border lg:hidden">
        <summary className="type-label text-ink focus-visible:ring-ring flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filter products
          </span>
          {selectedFilters.length > 0 && (
            <span className="type-mono-meta text-ink-faint">
              {selectedFilters.length} active
            </span>
          )}
        </summary>
        <div className="p-4">
          <Suspense fallback={null}>
            <FilterPanel
              filters={filters}
              selectedFilters={selectedFilters}
              resultCount={productCount}
              clearHref={clearHref}
            />
          </Suspense>
        </div>
      </details>
    </div>
  )
}
