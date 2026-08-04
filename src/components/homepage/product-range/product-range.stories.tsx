import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { PRODUCT_RANGE_FIXTURE, PRODUCT_RANGE_INTRO_FIXTURE } from '../content'
import { ProductRange } from './product-range'

const meta: Meta<typeof ProductRange> = {
  title: 'Homepage/ProductRange',
  component: ProductRange,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ProductRange>

export const Default: Story = {
  args: {
    cards: PRODUCT_RANGE_FIXTURE,
    intro: PRODUCT_RANGE_INTRO_FIXTURE,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvasElement.querySelector('#product-range'),
    ).toBeInTheDocument()
    await expect(
      canvas.queryByText(/apply for a bulk wholesale account/i),
    ).not.toBeInTheDocument()
  },
}
