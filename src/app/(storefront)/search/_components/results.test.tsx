import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type {
  SearchRouteState,
  SearchaniseSearchResult,
} from '@/lib/searchanise/types'

import { SearchResults } from './results'

vi.mock('./analytics', () => ({
  SearchAnalytics: () => null,
}))

vi.mock('@/components/search/search-results-view', () => ({
  SearchResultsView: () => <div>Faceted search results</div>,
}))

const state: SearchRouteState = {
  query: 'a',
  page: 1,
  sort: 'relevance',
  filters: [{ attribute: 'collections', value: 'Black Teas' }],
}

const result: SearchaniseSearchResult = {
  status: 'success',
  query: 'a',
  products: [],
  facets: [],
  pagination: {
    currentPage: 1,
    pageSize: 24,
    totalPages: 1,
    totalItems: 12,
    startIndex: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
}

describe('SearchResults', () => {
  it('replaces the loading hero with the resolved count and query form', async () => {
    const html = renderToStaticMarkup(
      await SearchResults({
        resultPromise: Promise.resolve(result),
        state,
      }),
    )

    expect(html).toContain('Results for &quot;a&quot;')
    expect(html).toContain('12 results')
    expect(html).not.toContain('Searching products')
    expect(html).toContain('action="/search"')
    expect(html).toContain('value="a"')
    expect(html).toContain('Faceted search results')
  })
})
