import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Hero } from './hero'

const meta: Meta<typeof Hero> = {
  title: 'Blog/Hero',
  component: Hero,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta

type Story = StoryObj<typeof Hero>

export const Default: Story = {
  args: {
    searchAction: '/blogs/teavision-blogs',
  },
}

export const CmsContent: Story = {
  args: {
    title: 'Wholesale Tea Education for Sourcing Teams',
    description:
      'Sanity-authored listing copy can introduce a seasonal editorial focus while keeping search and feed actions available.',
    image: {
      url: 'https://cdn.shopify.com/s/files/1/0786/8339/files/blog-hero.webp?v=1764582604&width=1600',
      altText: 'Loose leaf tea on a tasting bench',
    },
    searchAction: '/blogs/teavision-blogs',
  },
}

export const LongCmsCopy: Story = {
  args: {
    title:
      'Wholesale Botanical Tea Intelligence for Product, Procurement, Compliance, and Brand Teams',
    description:
      'A deliberately long CMS description checks that the hero keeps a readable measure, wraps safely on small screens, and preserves the search workflow.',
    searchAction: '/blogs/teavision-blogs',
  },
}

export const LongUnbrokenCopyMobile: Story = {
  args: {
    title:
      'WholesaleTeaProcurementComplianceSourcingIntelligenceForAustralianBrands',
    description:
      'Long unbroken CMS terms should wrap inside the mobile viewport without forcing horizontal overflow.',
    searchAction: '/blogs/teavision-blogs',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: ({ canvasElement }) => {
    if (canvasElement.scrollWidth > canvasElement.clientWidth) {
      throw new Error('Long blog hero copy overflows the mobile canvas')
    }
  },
}
