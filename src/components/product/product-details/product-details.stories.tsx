import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { Product } from '@/lib/shopify/types'

import { ProductDetails } from './product-details'

const product: Product = {
  id: 'gid://shopify/Product/123',
  handle: 'preview-matcha',
  title: 'Organic Premium Matcha',
  description: 'A bright, grassy matcha for everyday service.',
  descriptionHtml: '<p>A bright, grassy matcha for everyday service.</p>',
  tags: ['categories: Tea', 'Organic'],
  collectionIds: [],
  images: [
    {
      url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/matcha.jpg',
      altText: 'Organic Premium Matcha',
      width: 800,
      height: 800,
    },
  ],
  priceRange: {
    minVariantPrice: { amount: '42.00', currencyCode: 'AUD' },
  },
  variants: [
    {
      id: 'gid://shopify/ProductVariant/456',
      title: '1kg',
      availableForSale: false,
      quantityAvailable: 0,
      quantityRule: { minimum: 1, maximum: null, increment: 1 },
      price: { amount: '42.00', currencyCode: 'AUD' },
      quantityPriceBreaks: [],
      image: null,
    },
  ],
  options: [{ name: 'Pack size', values: ['1kg'] }],
  rating: 4.7,
  reviewCount: 18,
}

const meta: Meta<typeof ProductDetails> = {
  title: 'Product/ProductDetails',
  component: ProductDetails,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
}

export default meta

type Story = StoryObj<typeof ProductDetails>

export const Preview: Story = {
  args: {
    product,
    mode: 'preview',
    reviewSummary: product,
  },
}
