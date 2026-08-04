import { Suspense } from 'react'
import Link from 'next/link'

import { FilterPanel } from '@/components/collection'
import type {
  CollectionProductFilter,
  CollectionSummary,
} from '@/lib/shopify/types'
import { cn } from '@/lib/utils'

import { getPath } from '../_lib/page-helpers'

type SidebarProps = {
  activeSelectedFilters: string[]
  clearFiltersHref: string
  handle: string
  productsLength: number
  sidebarCollections: CollectionSummary[]
  visibleFilters: CollectionProductFilter[]
}

export function Sidebar({
  activeSelectedFilters,
  clearFiltersHref,
  handle,
  productsLength,
  sidebarCollections,
  visibleFilters,
}: SidebarProps) {
  return (
    <aside className="hidden lg:sticky lg:top-32 lg:grid lg:max-h-[calc(100dvh-9rem)] lg:gap-5 lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
      {/* Filter panel */}
      <Suspense fallback={null}>
        <FilterPanel
          filters={visibleFilters}
          selectedFilters={activeSelectedFilters}
          resultCount={productsLength}
          clearHref={clearFiltersHref}
        />
      </Suspense>

      {/* Related collections */}
      {sidebarCollections.length > 0 && (
        <div className="border-hairline border-t pt-5">
          <details open>
            <summary className="type-mono-meta text-ink-faint focus-visible:ring-ring flex min-h-11 cursor-pointer list-none items-center rounded uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
              You Might Like
            </summary>
            <nav
              aria-label="You might like collections"
              className="mt-3 max-h-96 overflow-y-auto pr-1"
            >
              <ul className="grid gap-1" role="list">
                {sidebarCollections.map((sidebarCollection) => {
                  const isActive = sidebarCollection.handle === handle

                  return (
                    <li key={sidebarCollection.id}>
                      <Link
                        href={getPath(sidebarCollection.handle)}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'type-body-sm focus-visible:ring-ring flex min-h-10 items-center rounded px-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                          isActive
                            ? 'bg-paper-2 text-ink'
                            : 'text-brand hover:bg-paper-2',
                        )}
                      >
                        {sidebarCollection.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </details>
        </div>
      )}
    </aside>
  )
}
