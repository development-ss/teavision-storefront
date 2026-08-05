import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { SearchPageSearchForm } from '@/components/search/search-results-view/search-page-search-form'
import { FilterType, type CollectionProductFilter } from '@/lib/shopify/types'

import { Toolbar } from './toolbar'

const filters: CollectionProductFilter[] = [
  {
    id: 'filter.p.product_type',
    label: 'Product type',
    type: FilterType.List,
    values: [
      {
        id: 'filter.p.product_type.green-tea',
        label: 'Green tea',
        count: 12,
        input: JSON.stringify({ productType: 'Green tea' }),
      },
      {
        id: 'filter.p.product_type.black-tea',
        label: 'Black tea',
        count: 8,
        input: JSON.stringify({ productType: 'Black tea' }),
      },
    ],
  },
]

const meta: Meta<typeof Toolbar> = {
  title: 'Collection/Toolbar',
  component: Toolbar,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta

type Story = StoryObj<typeof Toolbar>

export const Default: Story = {
  args: {
    currentSort: 'featured',
    productCount: 20,
    filters,
    selectedFilters: [],
  },
}

export const WithActiveFilter: Story = {
  args: {
    currentSort: 'best-selling',
    productCount: 8,
    filters,
    selectedFilters: [filters[0].values[1].input],
  },
}

export const WithCollectionSearch: Story = {
  args: {
    currentSort: 'featured',
    productCount: 20,
    filters,
    selectedFilters: [],
    search: (
      <SearchPageSearchForm
        className="mt-0 max-w-none"
        filter={{ attribute: 'collections', value: 'Wholesale Bulk Tea' }}
        inputId="collection-search-query"
        label="Search Wholesale Bulk Tea"
        labelClassName="type-label text-ink block sm:col-span-2"
        placeholder="Search this collection…"
      />
    ),
  },
}
