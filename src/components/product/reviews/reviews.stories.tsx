import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import type { ProductReviewsPage } from '@/lib/reviews/trustoo'

import { Reviews } from './reviews'

const firstPage: ProductReviewsPage = {
  page: 1,
  totalPages: 2,
  totalCount: 3,
  reviews: [
    {
      id: '1',
      rating: 5,
      author: 'Sample customer A.',
      title: 'Fresh and fragrant',
      content:
        'A lovely peppermint tea. The aroma is fresh and the delivery was quick.',
      date: '2026-09-01',
      reply: '',
    },
    {
      id: '2',
      rating: 4,
      author: 'Sample customer B.',
      title: '',
      content: '',
      date: '2026-08-20',
      reply: '',
    },
  ],
}
const nextPage: ProductReviewsPage = {
  page: 2,
  totalPages: 2,
  totalCount: 3,
  reviews: [
    {
      id: '3',
      rating: 5,
      author: 'Sample customer C.',
      title: '',
      content: 'Great tea for our cafe.',
      date: '2026-08-12',
      reply: 'Thank you for sharing your feedback.',
    },
  ],
}

const meta: Meta<typeof Reviews> = {
  title: 'Product/Reviews',
  component: Reviews,
  tags: ['autodocs'],
  args: {
    handle: 'organic-peppermint',
    productTitle: 'Organic Peppermint',
    initialPage: firstPage,
    loadPageAction: async () => nextPage,
    submitReviewAction: async () => ({
      status: 'success',
      message: 'Thanks for sharing your experience.',
    }),
  },
  parameters: { a11y: { test: 'error' } },
}
export default meta

type Story = StoryObj<typeof Reviews>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Fresh and fragrant')).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more reviews' }),
    )
    await expect(
      await canvas.findByText('Great tea for our cafe.'),
    ).toBeVisible()
    await expect(canvas.getByText('Showing 3 of 3 reviews')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Load more reviews' }),
    ).not.toBeInTheDocument()
  },
}

export const Empty: Story = {
  args: { initialPage: { page: 1, totalPages: 0, totalCount: 0, reviews: [] } },
}

export const WriteReview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Write a review' }),
    )
    const form = canvas.getByRole('form', {
      name: 'Write a review for Organic Peppermint',
    })
    await expect(form).toBeVisible()
    const formCanvas = within(form)
    await userEvent.click(formCanvas.getByRole('button', { name: '5 stars' }))
    await expect(
      form.querySelector('input[name="rating"][value="5"]'),
    ).toBeChecked()
    await userEvent.type(formCanvas.getByLabelText(/^Name/), 'A customer')
    await userEvent.type(
      formCanvas.getByLabelText(/^Email \(private\)/),
      'customer@example.com',
    )
    await userEvent.type(
      formCanvas.getByLabelText(/^Review/),
      'Fresh and fragrant tea.',
    )
    await userEvent.click(
      formCanvas.getByRole('button', { name: 'Submit review' }),
    )
    await expect(await canvas.findByText('Review received')).toBeVisible()
  },
}

export const Unavailable: Story = {
  args: { initialPage: null, loadPageAction: async () => null },
}
export const Retry: Story = {
  args: {
    initialPage: null,
    loadPageAction: async () => ({
      ...firstPage,
      totalPages: 1,
      totalCount: 2,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    await expect(await canvas.findByText('Fresh and fragrant')).toBeVisible()
    await expect(
      canvas.queryByText('Reviews could not be loaded. Please try again.'),
    ).not.toBeInTheDocument()
  },
}
export const PaginationFailure: Story = {
  args: { loadPageAction: async () => null },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more reviews' }),
    )
    await expect(
      await canvas.findByRole('button', { name: 'Try again' }),
    ).toBeVisible()
    await expect(canvas.getByText('Fresh and fragrant')).toBeVisible()
  },
}
