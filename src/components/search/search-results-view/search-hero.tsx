import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { SearchRouteState } from '@/lib/searchanise/types'

import { SearchPageSearchForm } from './search-page-search-form'

export function SearchHero({
  state,
  countLabel,
}: {
  state: SearchRouteState
  countLabel?: string
}) {
  const hasQuery = state.query.length > 0
  const title = hasQuery ? `Results for "${state.query}"` : 'Search Teavision'

  return (
    <Section.Root tone="surface" spacing="compact">
      <Section.Container>
        <div className="max-w-4xl">
          <Eyebrow>Search</Eyebrow>
          <h1 className="font-display text-ink mt-3 text-[clamp(2rem,4vw,3.4rem)] wrap-break-word">
            {title}
          </h1>
          <p className="type-mono-meta text-ink-faint mt-4">
            {hasQuery
              ? (countLabel ?? 'Searching products...')
              : 'Search bulk teas, herbs, and spices.'}
          </p>
          <SearchPageSearchForm
            query={state.query}
            label="Search products"
            placeholder="Search products"
          />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
