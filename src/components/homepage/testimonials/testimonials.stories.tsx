import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { TESTIMONIALS_FIXTURE } from '../content'
import { Testimonials } from './testimonials'

const meta: Meta<typeof Testimonials> = {
  title: 'Homepage/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  args: TESTIMONIALS_FIXTURE,
}
export default meta

type Story = StoryObj<typeof Testimonials>

export const Default: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getAllByRole('img', { name: '5.0 out of 5 stars' }),
    ).toHaveLength(TESTIMONIALS_FIXTURE.items.length)
  },
}
