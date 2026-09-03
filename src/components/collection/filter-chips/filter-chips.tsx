'use client'

import { X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import type { SelectedCollectionFilterLabel } from '@/lib/shopify/filters'

function isCategoryFilterInput(input: string): boolean {
  try {
    const parsed: unknown = JSON.parse(input)
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'tag' in parsed &&
      typeof parsed.tag === 'string' &&
      parsed.tag.startsWith('categories_')
    )
  } catch {
    return false
  }
}

export function getCollectionFilterRemovalHref({
  collectionPath,
  input,
  pathname,
  searchParams,
  selectedFilters,
}: {
  collectionPath?: string
  input: string
  pathname: string
  searchParams: URLSearchParams
  selectedFilters: string[]
}): string {
  const params = new URLSearchParams(searchParams.toString())
  params.delete('page')
  params.delete('filter')

  selectedFilters
    .filter((filter) => filter !== input && !isCategoryFilterInput(filter))
    .forEach((filter) => params.append('filter', filter))

  const targetPath = isCategoryFilterInput(input)
    ? (collectionPath ?? pathname)
    : pathname
  const queryString = params.toString()

  return queryString ? `${targetPath}?${queryString}` : targetPath
}

type FilterChipsProps = {
  selectedFilterLabels: SelectedCollectionFilterLabel[]
  selectedFilters: string[]
  collectionPath?: string
}

export function FilterChips({
  selectedFilterLabels,
  selectedFilters,
  collectionPath,
}: FilterChipsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (selectedFilterLabels.length === 0) return null

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {selectedFilterLabels.map((filter) => (
        <Button
          type="button"
          key={filter.input}
          variant="filterChip"
          size="filterChip"
          aria-label={`Remove ${filter.label} filter`}
          onClick={() =>
            router.replace(
              getCollectionFilterRemovalHref({
                collectionPath,
                input: filter.input,
                pathname,
                searchParams,
                selectedFilters,
              }),
              { scroll: false },
            )
          }
        >
          {filter.label}
          <X className="size-3" aria-hidden="true" />
        </Button>
      ))}
    </div>
  )
}
