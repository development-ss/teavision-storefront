import { Suspense } from 'react'
import type { Metadata } from 'next'

import { SearchHero } from '@/components/search/search-results-view/search-hero'
import {
  parseSearchParams,
  type SearchParamsInput,
} from '@/lib/searchanise/params'
import { getSearchaniseSearchResults } from '@/lib/searchanise/search'
import type { SearchRouteState } from '@/lib/searchanise/types'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { SearchResults } from './_components/results'

type Props = {
  searchParams: Promise<SearchParamsInput>
}

const SEARCH_FALLBACK_STATE = {
  query: '',
  page: 1,
  sort: 'relevance',
  filters: [],
} satisfies SearchRouteState

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const state = parseSearchParams(await searchParams)
  const title = state.query ? `Search: "${state.query}"` : 'Search'

  return withNoindexRobots({
    title,
    description: state.query
      ? `Search results for "${state.query}" on Teavision, Australia's bulk tea and herb supplier.`
      : 'Search Teavision for bulk tea, herbs, and spices.',
    robots: { index: false },
  })
}

export default function SearchPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<SearchHero state={SEARCH_FALLBACK_STATE} />}>
      {searchParams.then((resolvedSearchParams) => {
        const state = parseSearchParams(resolvedSearchParams)
        const resultPromise = getSearchaniseSearchResults(state)

        return (
          <Suspense fallback={<SearchHero state={state} />}>
            <SearchResults resultPromise={resultPromise} state={state} />
          </Suspense>
        )
      })}
    </Suspense>
  )
}
