import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { GoogleRating } from './google-rating'

const meta: Meta<typeof GoogleRating> = {
  title: 'Homepage/GoogleRating',
  component: GoogleRating,
  tags: ['autodocs'],
  parameters: { a11y: { test: 'error' } },
}
export default meta

type Story = StoryObj<typeof GoogleRating>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('img', { name: 'Google' })).toBeVisible()
    await expect(canvas.getByText('Customer reviews')).toBeVisible()
    await expect(canvas.getByText('Based on 76 reviews')).toBeVisible()
    const breakdown = canvas.getByRole('list', { name: 'Rating breakdown' })
    await expect(within(breakdown).getAllByRole('listitem')).toHaveLength(5)
    await expect(within(breakdown).getByText('97.4%')).toBeVisible()
    await expect(within(breakdown).getByText('74 reviews')).toBeInTheDocument()
    await expect(
      canvas.getByRole('link', { name: 'Read all reviews on Google' }),
    ).toHaveAttribute(
      'href',
      'https://www.google.com/maps/search/?api=1&query=Teavision+29+Palladium+Circuit+Clyde+North',
    )
  },
}
