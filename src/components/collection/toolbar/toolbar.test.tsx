/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { FilterType, type CollectionProductFilter } from '@/lib/shopify/types'

import { getCollectionFilterRemovalHref } from '../filter-chips'
import { Toolbar } from './toolbar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/collections/all',
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Toolbar', () => {
  it('renders active filter chips using their display labels', () => {
    const specialtyTeaInput = JSON.stringify({
      tag: 'categories_Specialty Tea',
    })
    const filters: CollectionProductFilter[] = [
      {
        id: 'filter.p.tag.categories',
        label: 'Category',
        type: FilterType.List,
        values: [
          {
            id: 'filter.p.tag.categories-specialty-tea',
            label: 'Specialty Tea',
            count: 1,
            input: specialtyTeaInput,
          },
        ],
      },
    ]

    const html = renderToStaticMarkup(
      <Toolbar
        currentSort="featured"
        productCount={1}
        filters={filters}
        selectedFilters={[specialtyTeaInput]}
      />,
    )

    expect(html).toContain('Specialty Tea')
    expect(html).not.toContain(specialtyTeaInput.replace(/"/g, '&quot;'))
    expect(html).toContain('Remove Specialty Tea filter')
    expect(html).toContain('cursor-pointer')
  })

  it('removes a category chip to the base collection while preserving search and other filters', () => {
    const categoryInput = JSON.stringify({ tag: 'categories_Black Tea' })
    const vendorInput = JSON.stringify({ productVendor: 'Teavision' })

    expect(
      getCollectionFilterRemovalHref({
        collectionPath: '/collections/all',
        input: categoryInput,
        pathname: '/collections/all/categories_black-tea',
        searchParams: new URLSearchParams(
          `q=a&filter=${encodeURIComponent(vendorInput)}`,
        ),
        selectedFilters: [categoryInput, vendorInput],
      }),
    ).toBe(`/collections/all?q=a&filter=${encodeURIComponent(vendorInput)}`)
  })

  it('does not serialize the synthetic category filter when removing another chip', () => {
    const categoryInput = JSON.stringify({ tag: 'categories_Black Tea' })
    const vendorInput = JSON.stringify({ productVendor: 'Teavision' })

    expect(
      getCollectionFilterRemovalHref({
        collectionPath: '/collections/all',
        input: vendorInput,
        pathname: '/collections/all/categories_black-tea',
        searchParams: new URLSearchParams('q=a'),
        selectedFilters: [categoryInput, vendorInput],
      }),
    ).toBe('/collections/all/categories_black-tea?q=a')
  })
})
