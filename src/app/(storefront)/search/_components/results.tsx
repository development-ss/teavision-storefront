import { SearchHero } from '@/components/search/search-results-view/search-hero'
import { formatResultCount } from '@/components/search/search-results-view/search-results-helpers'
import { SearchResultsView } from '@/components/search/search-results-view/search-results-view'
import type {
  SearchRouteState,
  SearchaniseSearchResult,
} from '@/lib/searchanise/types'

import { SearchAnalytics } from './analytics'

type SearchResultsProps = {
  resultPromise: Promise<SearchaniseSearchResult>
  state: SearchRouteState
}

export async function SearchResults({
  resultPromise,
  state,
}: SearchResultsProps) {
  const result = await resultPromise
  const resultCount =
    result.status === 'success' ? result.pagination.totalItems : 0

  return (
    <>
      <SearchHero
        state={state}
        countLabel={
          result.status === 'success'
            ? formatResultCount(result)
            : result.status === 'idle'
              ? 'Enter a search term'
              : 'Search unavailable'
        }
      />
      {result.status === 'success' ? (
        <SearchAnalytics query={state.query} resultCount={resultCount} />
      ) : null}
      <SearchResultsView result={result} state={state} />
    </>
  )
}
