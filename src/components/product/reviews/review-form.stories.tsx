import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ReviewForm } from './review-form'

const meta: Meta<typeof ReviewForm> = {
  title: 'Product/Reviews/ReviewForm',
  component: ReviewForm,
  tags: ['autodocs'],
  args: {
    productTitle: 'Organic Peppermint',
    action: async () => ({
      status: 'success',
      message: 'Thanks for sharing your experience.',
    }),
    onCancel: () => undefined,
  },
  parameters: { a11y: { test: 'error' } },
}

export default meta

type Story = StoryObj<typeof ReviewForm>

export const Default: Story = {}
