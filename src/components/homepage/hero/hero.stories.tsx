import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { HOMEPAGE_HERO_FIXTURE } from '../content'
import { HomepageHero } from './hero'

const meta: Meta<typeof HomepageHero> = {
  title: 'Homepage/HomepageHero',
  component: HomepageHero,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof HomepageHero>

export const Default: Story = {
  args: {
    hero: HOMEPAGE_HERO_FIXTURE,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('link', { name: 'Explore Our Teas' }),
    ).toHaveAttribute('href', '#product-range')
    await expect(
      canvas.queryByRole('link', { name: 'Open a wholesale account' }),
    ).not.toBeInTheDocument()
    await expect(
      canvas.getByRole('img', {
        name: '4.9 out of 5 stars from 76 Google reviews',
      }),
    ).toBeInTheDocument()
    await expect(canvas.getByText('4.9')).toBeInTheDocument()
    await expect(
      canvas.getByText('Google rated · 76 reviews'),
    ).toBeInTheDocument()
    await expect(canvas.getByText('Owned & Operated')).toBeInTheDocument()
    await expect(canvas.queryByText('1,000+')).not.toBeInTheDocument()
    await expect(canvas.queryByText('4.9-star')).not.toBeInTheDocument()
  },
}
