import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type {
  SearchRouteState,
  SearchaniseSearchResult,
} from '@/lib/searchanise/types'

import { SearchResultsView } from './search-results-view'

const product = {
  id: 'searchanise-product-1',
  handle: 'organic-masala-chai',
  title: 'Organic Masala Chai',
  description:
    'A warming spice blend with black tea, cinnamon, cardamom, and clove.',
  availableForSale: true,
  productType: 'Tea & Tea Products',
  tags: ['chai', 'black tea'],
  featuredImage: {
    url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/organic-masala-chai.jpg?v=1700000000',
    altText: 'Organic Masala Chai',
    width: 640,
    height: 640,
  },
  priceRange: {
    minVariantPrice: { amount: '12.40', currencyCode: 'AUD' },
  },
  variants: [
    {
      id: 'gid://shopify/ProductVariant/organic-masala-chai-250g',
      title: '250g',
      availableForSale: true,
      quantityAvailable: 12,
      quantityRule: {
        minimum: 1,
        maximum: 12,
        increment: 1,
      },
      price: { amount: '12.40', currencyCode: 'AUD' },
      quantityPriceBreaks: [],
      image: null,
    },
    {
      id: 'gid://shopify/ProductVariant/organic-masala-chai-1kg',
      title: '1kg',
      availableForSale: true,
      quantityAvailable: 6,
      quantityRule: {
        minimum: 1,
        maximum: 6,
        increment: 1,
      },
      price: { amount: '42.00', currencyCode: 'AUD' },
      quantityPriceBreaks: [],
      image: null,
    },
  ],
}

const baseState: SearchRouteState = {
  query: 'chai',
  page: 1,
  sort: 'relevance',
  filters: [],
}

const baseResult: SearchaniseSearchResult = {
  status: 'success',
  query: 'chai',
  products: [
    product,
    {
      ...product,
      id: 'searchanise-product-2',
      handle: 'instant-chai-powder',
      title: 'Instant Chai Powder',
      priceRange: {
        minVariantPrice: { amount: '9.90', currencyCode: 'AUD' },
      },
    },
    {
      ...product,
      id: 'searchanise-product-3',
      handle: 'cinnamon-chips',
      title: 'Organic Ceylon Cinnamon Chips',
      priceRange: {
        minVariantPrice: { amount: '10.83', currencyCode: 'AUD' },
      },
    },
  ],
  facets: [
    {
      attribute: 'collections',
      label: 'Collections',
      type: 'select',
      values: [
        {
          id: 'collections:chai',
          label: 'Chai Tea, Loose leaf & Instant',
          value: 'Chai Tea, Loose leaf & Instant',
          count: 9,
          selected: false,
        },
        {
          id: 'collections:black-teas',
          label: 'Black Teas',
          value: 'Black Teas',
          count: 4,
          selected: false,
        },
      ],
    },
    {
      attribute: 'price',
      label: 'Price',
      type: 'range',
      values: [
        {
          id: 'price:0,20',
          label: '$0 - $20',
          value: '0,20',
          count: 12,
          selected: false,
        },
      ],
    },
  ],
  pagination: {
    currentPage: 1,
    pageSize: 24,
    totalPages: 3,
    totalItems: 52,
    startIndex: 0,
    hasNextPage: true,
    hasPreviousPage: false,
  },
}

const meta: Meta<typeof SearchResultsView> = {
  title: 'Search/SearchResultsView',
  component: SearchResultsView,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta

type Story = StoryObj<typeof SearchResultsView>

const activeFilterResult: SearchaniseSearchResult = {
  ...baseResult,
  facets: [
    {
      ...baseResult.facets[0],
      values: baseResult.facets[0].values.map((value) => ({
        ...value,
        selected: value.value === 'Chai Tea, Loose leaf & Instant',
      })),
    },
    baseResult.facets[1],
  ],
  pagination: {
    ...baseResult.pagination,
    totalItems: 9,
    totalPages: 1,
    hasNextPage: false,
  },
}

const activeFilterState: SearchRouteState = {
  ...baseState,
  filters: [
    {
      attribute: 'collections',
      value: 'Chai Tea, Loose leaf & Instant',
    },
  ],
}

function expectStoryText(canvasElement: HTMLElement, text: string) {
  if (!canvasElement.textContent?.includes(text)) {
    throw new Error(`Expected story text not found: ${text}`)
  }
}

export const Default: Story = {
  args: {
    result: baseResult,
    state: baseState,
  },
}

export const WithActiveFilter: Story = {
  args: {
    result: activeFilterResult,
    state: activeFilterState,
  },
  play: ({ canvasElement }) => {
    expectStoryText(canvasElement, 'Chai Tea, Loose leaf & Instant')
    expectStoryText(canvasElement, 'Clear all')
  },
}

export const MobileFiltered: Story = {
  args: {
    result: activeFilterResult,
    state: activeFilterState,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const LongQueryMobile: Story = {
  args: {
    result: {
      ...baseResult,
      query: 'wholesaleteaprocurementcompliancesourcingintelligence',
    },
    state: {
      ...baseState,
      query: 'wholesaleteaprocurementcompliancesourcingintelligence',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: ({ canvasElement }) => {
    if (canvasElement.scrollWidth > canvasElement.clientWidth) {
      throw new Error('Long search query overflows the mobile canvas')
    }
  },
}

export const Empty: Story = {
  args: {
    result: {
      ...baseResult,
      products: [],
      pagination: {
        ...baseResult.pagination,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
      },
    },
    state: {
      ...baseState,
      query: 'dragonwell chai',
    },
  },
  play: ({ canvasElement }) => {
    expectStoryText(canvasElement, 'No matches')

    if (canvasElement.textContent?.includes('Search again')) {
      throw new Error('Empty search repeats the search action')
    }
  },
}

export const NoQuery: Story = {
  args: {
    result: {
      ...baseResult,
      status: 'idle',
      query: '',
      products: [],
      facets: [],
      pagination: {
        currentPage: 1,
        pageSize: 24,
        totalPages: 1,
        totalItems: 0,
        startIndex: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    state: {
      ...baseState,
      query: '',
    },
  },
}

export const Unavailable: Story = {
  args: {
    result: {
      ...baseResult,
      status: 'unavailable',
      message: 'Search is unavailable while Searchanise is not configured.',
      products: [],
      facets: [],
      pagination: {
        ...baseResult.pagination,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
      },
    },
    state: baseState,
  },
}

export const ErrorState: Story = {
  args: {
    result: {
      ...baseResult,
      status: 'error',
      message: 'Search request failed. Please try again.',
      products: [],
      facets: [],
      pagination: {
        ...baseResult.pagination,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
      },
    },
    state: baseState,
  },
  play: ({ canvasElement }) => {
    expectStoryText(canvasElement, 'Search request failed. Please try again.')
  },
}

export const MultiPage: Story = {
  args: {
    result: {
      ...baseResult,
      pagination: {
        currentPage: 6,
        pageSize: 24,
        totalPages: 16,
        totalItems: 377,
        startIndex: 120,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    },
    state: {
      ...baseState,
      page: 6,
      sort: 'price-desc',
    },
  },
}
