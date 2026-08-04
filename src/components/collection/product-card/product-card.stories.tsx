import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import type {
  CollectionProductSummary,
  ProductVariant,
} from '@/lib/shopify/types'

import { ProductCard } from './product-card'

const singleVariant: ProductVariant = {
  id: 'gid://shopify/ProductVariant/masters-sencha-50g',
  title: '50g Sample',
  availableForSale: true,
  quantityAvailable: 10,
  quantityRule: {
    minimum: 1,
    maximum: 10,
    increment: 1,
  },
  price: { amount: '12.00', currencyCode: 'AUD' },
  quantityPriceBreaks: [],
  image: null,
}

const multiVariants: ProductVariant[] = [
  singleVariant,
  {
    id: 'gid://shopify/ProductVariant/masters-sencha-1kg',
    title: '1kg',
    availableForSale: true,
    quantityAvailable: 4,
    quantityRule: {
      minimum: 1,
      maximum: 4,
      increment: 1,
    },
    price: { amount: '88.00', currencyCode: 'AUD' },
    quantityPriceBreaks: [],
    image: null,
  },
]

const firstPageVariantLimit = Array.from({ length: 8 }, (_, index) => ({
  ...singleVariant,
  id: `gid://shopify/ProductVariant/masters-sencha-pack-${index + 1}`,
  title: `Pack ${index + 1}`,
}))

const stubProduct: CollectionProductSummary = {
  id: 'gid://shopify/Product/masters-sencha',
  handle: 'tea-masters-sencha',
  title: 'Tea Masters Sencha Green Tea',
  availableForSale: true,
  productType: 'Green tea',
  tags: ['Wholesale', 'Loose leaf'],
  featuredImage: {
    url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/tea-1.jpg?v=1',
    altText: 'Loose leaf green tea',
    width: 900,
    height: 900,
  },
  priceRange: {
    minVariantPrice: { amount: '12.00', currencyCode: 'AUD' },
  },
  rating: 4.8,
  reviewCount: 37,
  variants: [singleVariant],
}

const meta: Meta<typeof ProductCard> = {
  title: 'Collection/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ProductCard>

/** Default single-variant card: eyebrow, title, quantity, and add-to-cart */
export const Default: Story = {
  args: {
    product: stubProduct,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Product type eyebrow renders (CARD-02)
    await expect(canvas.getByText('Green tea')).toBeVisible()

    // Title is the sole PDP link (CARD-04) — no supplemental info link
    await expect(
      canvas.getByRole('link', { name: 'Tea Masters Sencha Green Tea' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /more info/i }),
    ).not.toBeInTheDocument()

    // Tile-level purchase controls are present for single-variant products.
    await expect(
      canvas.getByRole('spinbutton', {
        name: 'Quantity for Tea Masters Sencha Green Tea',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Add to cart' }),
    ).toBeVisible()

    // Price renders
    await expect(canvas.getByText('$12.00')).toBeVisible()
  },
}

/** No product image: fallback leaf icon renders */
export const NoImage: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/masters-oolong',
      handle: 'tea-masters-oolong',
      title: 'Tea Masters High Mountain Oolong',
      featuredImage: null,
    },
  },
}

/** Multi-variant card: size, quantity, and add-to-cart stay on the listing */
export const MultiVariantPurchase: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/masters-breakfast',
      handle: 'tea-masters-breakfast',
      title: 'Tea Masters Breakfast Blend',
      variants: multiVariants,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('combobox', {
        name: 'Select pack size for Tea Masters Breakfast Blend',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('spinbutton', {
        name: 'Quantity for Tea Masters Breakfast Blend',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Add to cart' }),
    ).toBeVisible()
  },
}

/** Sold-out card: badges shown, no quick-add */
export const SoldOut: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/masters-rwanda',
      handle: 'premium-rwandan-black-tea',
      title: 'Premium Rwandan Black Tea CTC BP',
      availableForSale: false,
      variants: [{ ...singleVariant, availableForSale: false }],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Sold out')).toBeVisible()

    await expect(
      canvas.queryByRole('button', { name: /add to cart/i }),
    ).not.toBeInTheDocument()
  },
}

/** Cert badges from tags: organic + award (CARD-03) */
export const WithCertBadges: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/organic-award-sencha',
      handle: 'organic-award-sencha',
      title: 'Organic Award Winning Sencha',
      tags: ['ACO Certified', 'Award winning', 'Organic'],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText('Organic')).toBeVisible()
    await expect(canvas.getByText('Award winning')).toBeVisible()
  },
}

/** No productType: eyebrow line absent (CARD-02) */
export const NoBrandingInfo: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/plain-tea',
      handle: 'plain-tea',
      title: 'House Blend Black Tea',
      productType: '',
      tags: ['Wholesale'],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // No eyebrow when productType is absent
    await expect(canvas.queryByText('Green tea')).not.toBeInTheDocument()

    // Title still renders
    await expect(canvas.getByText('House Blend Black Tea')).toBeVisible()
  },
}

/** All variants returned by the listing query remain directly selectable. */
export const ManyVariants: Story = {
  args: {
    product: {
      ...stubProduct,
      variants: firstPageVariantLimit,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('combobox', {
        name: 'Select pack size for Tea Masters Sencha Green Tea',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Add to cart' }),
    ).toBeVisible()
  },
}

/** Rated card: star rating row visible between title and price */
export const WithRating: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/rated-sencha',
      handle: 'rated-sencha',
      title: 'Rated Premium Sencha',
      rating: 4.8,
      reviewCount: 37,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Star rating accessible label
    await expect(
      canvas.getByRole('img', { name: /4.8 out of 5 stars/i }),
    ).toBeInTheDocument()

    // Review count rendered
    await expect(canvas.getByText('(37)')).toBeVisible()
  },
}

/** Unrated card: no star rating row */
export const NoRating: Story = {
  args: {
    product: {
      ...stubProduct,
      id: 'gid://shopify/Product/unrated-sencha',
      handle: 'unrated-sencha',
      title: 'Unrated Sencha Green Tea',
      rating: undefined,
      reviewCount: undefined,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.queryByRole('img', { name: /out of 5 stars/i }),
    ).not.toBeInTheDocument()
  },
}

/** Long title on mobile: should not overflow */
export const LongUnbrokenTitleMobile: Story = {
  args: {
    product: {
      ...stubProduct,
      title: 'WholesaleTeaProcurementComplianceSourcingIntelligenceSenchaBlend',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: ({ canvasElement }) => {
    if (canvasElement.scrollWidth > canvasElement.clientWidth) {
      throw new Error('Long product title overflows the mobile canvas')
    }
  },
}
