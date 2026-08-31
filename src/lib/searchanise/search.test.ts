import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { getSearchaniseSearchResults } from './search'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/env/public', () => ({
  searchanisePublicConfig: {
    apiKey: 'test-api-key',
    enabled: true,
  },
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

const fetchMock = vi.fn() as Mock<typeof fetch>

describe('getSearchaniseSearchResults', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('returns decoded plain text after stripping provider markup', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        items: [
          {
            product_id: 'licorice-mint',
            link: '/products/organic-licorice-mint-tea',
            title: 'Organic Licorice &amp; Mint Tea',
            description:
              '<strong>Caffeine-free.</strong> Calming &amp; uplifting &lt;blend&gt;.',
            price: '42.88',
          },
        ],
        itemsPerPage: 10,
        startIndex: 0,
        totalItems: 1,
      }),
    )

    const result = await getSearchaniseSearchResults({
      query: 'licorice mint',
      page: 1,
      sort: 'relevance',
      filters: [],
      pageSize: 10,
    })

    expect(result.status).toBe('success')
    expect(result.products[0]).toMatchObject({
      title: 'Organic Licorice & Mint Tea',
      description: 'Caffeine-free. Calming & uplifting <blend>.',
    })
  })
})
