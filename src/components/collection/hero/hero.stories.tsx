import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'

import { Hero } from './hero'

const meta: Meta<typeof Hero> = {
  title: 'Collection/Hero',
  component: Hero,
  tags: ['autodocs'],
  args: {
    title: 'Wholesale tea, herbs & spices',
    collectionTitle: 'Wholesale Bulk Tea',
    collectionPath: '/collections/wholesale-bulk-tea',
    intro:
      'Loose leaf teas and botanical ingredients for cafes, retailers and foodservice teams.',
    image: {
      url: '/images/collections/wholesale-tea-hero-v2.webp',
      altText: 'Loose tea and herbal ingredients',
      width: 1536,
      height: 1024,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByRole('heading', { level: 1 })).toBeVisible()
  },
}
export default meta

type Story = StoryObj<typeof Hero>

export const Default: Story = {
  args: {},
}

export const NoImage: Story = { args: { image: null } }
export const Minimal: Story = { args: { image: null, intro: '' } }
export const Category: Story = { args: { category: 'All Organic Tea' } }
export const TeaBagActions: Story = {
  args: {
    title: 'Ready-Made Bulk Tea Bags for Cafes, Hotels & Retail',
    actions: [
      { href: '#catalogue', label: 'View our Tea Bag Manufacturing Catalogue' },
      {
        href: 'mailto:info@teavision.com.au',
        label: 'Speak to Our Team About Custom Tea Bags',
      },
      {
        href: '/collections/all',
        label: 'Create Your Own White Label Tea Bag',
      },
    ],
    footnote: 'Minimum Order Quantity: 6,000 Tea Bags Per Blend',
  },
}

export const Mobile: Story = {
  ...TeaBagActions,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}
