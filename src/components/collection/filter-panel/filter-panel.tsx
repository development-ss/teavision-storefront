'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import type { CollectionProductFilter } from '@/lib/shopify/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type FilterPanelProps = {
  filters: CollectionProductFilter[]
  selectedFilters: string[]
  resultCount: number
  clearHref?: string
  className?: string
}

function formatCount(count: number): string {
  return `${count} ${count === 1 ? 'item' : 'items'}`
}

function toSafeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function getCollectionFilterHref({
  pathname,
  searchParams,
  filters,
}: {
  pathname: string
  searchParams: URLSearchParams
  filters: string[]
}): string {
  const params = new URLSearchParams(searchParams.toString())
  params.delete('page')
  params.delete('filter')
  filters.forEach((filter) => params.append('filter', filter))

  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export function FilterPanel({
  filters,
  selectedFilters,
  resultCount,
  clearHref,
  className,
}: FilterPanelProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedFilterSet = new Set(selectedFilters)
  const visibleFilters = filters.filter((filter) => filter.values.length > 0)

  function replaceFilters(nextFilters: string[]) {
    router.replace(
      getCollectionFilterHref({ pathname, searchParams, filters: nextFilters }),
      { scroll: false },
    )
  }

  function toggleFilter(input: string, checked: boolean) {
    if (checked) {
      replaceFilters(selectedFilters.filter((filter) => filter !== input))
      return
    }

    replaceFilters([...selectedFilters, input])
  }

  function clearFilters() {
    replaceFilters([])
  }

  return (
    <div className={cn('grid gap-0', className)}>
      <div className="flex items-start justify-between gap-4 pb-4">
        <div>
          <h2 className="text-ink-faint font-mono text-[11px] tracking-[0.12em] uppercase">
            Filters
          </h2>
          <p className="type-body-sm text-ink-soft mt-1">
            {formatCount(resultCount)} shown
          </p>
        </div>
        {selectedFilters.length > 0 &&
          (clearHref ? (
            <Button href={clearHref} variant="ghost" size="sm">
              Clear
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          ))}
      </div>

      {visibleFilters.length === 0 ? (
        <p className="type-body-sm text-ink-soft">
          No filters are available for this collection.
        </p>
      ) : (
        <div>
          {visibleFilters.map((filter) => (
            <details
              key={filter.id}
              className="border-hairline border-t py-5.5"
              open
            >
              <summary className="text-ink-faint focus-visible:ring-ring flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 rounded font-mono text-[11px] tracking-[0.12em] uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">
                {filter.label}
              </summary>
              <div className="mt-3 grid gap-1.5">
                {filter.values.map((value) => {
                  const checked = selectedFilterSet.has(value.input)
                  const disabled = value.count === 0 && !checked
                  const inputId = `filter-${toSafeId(filter.id)}-${toSafeId(
                    value.id,
                  )}`

                  return (
                    <div key={value.id}>
                      {value.href ? (
                        <Link
                          href={value.href}
                          aria-current={checked ? 'page' : undefined}
                          className={cn(
                            'flex min-h-10 items-center gap-3 rounded px-1 transition-colors',
                            checked
                              ? 'bg-paper-2 text-ink'
                              : 'hover:bg-paper-2 text-ink-soft',
                          )}
                        >
                          <span className="type-body-sm flex-1">
                            {value.label}
                          </span>
                          <span className="text-ink-faint font-mono text-[11px] tabular-nums">
                            {value.count}
                          </span>
                        </Link>
                      ) : (
                        <label
                          htmlFor={inputId}
                          className={cn(
                            'flex min-h-10 cursor-pointer items-center gap-3 rounded px-1',
                            disabled && 'cursor-not-allowed opacity-50',
                          )}
                        >
                          <Checkbox
                            id={inputId}
                            checked={checked}
                            disabled={disabled}
                            onChange={() => toggleFilter(value.input, checked)}
                          />
                          <span className="type-body-sm text-ink flex-1">
                            {value.label}
                          </span>
                          <span className="text-ink-faint font-mono text-[11px] tabular-nums">
                            {value.count}
                          </span>
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
