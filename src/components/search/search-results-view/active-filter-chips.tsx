import Link from 'next/link'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { ActiveFilter } from './search-results-helpers'

type ActiveFilterChipsProps = {
  activeFilters: ActiveFilter[]
  clearHref: string
}

export function ActiveFilterChips({
  activeFilters,
  clearHref,
}: ActiveFilterChipsProps) {
  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <Link
          key={filter.id}
          href={filter.href}
          aria-label={`Remove ${filter.facetLabel} filter: ${filter.label}`}
          className="bg-brand-tint text-brand focus-visible:ring-ring hover:text-brand-deep inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-1.75 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <span>{filter.facetLabel}</span>
          <span>{filter.label}</span>
          <X className="size-3.5" aria-hidden="true" />
        </Link>
      ))}
      <Button href={clearHref} variant="ghost" size="sm">
        Clear all
      </Button>
    </div>
  )
}
