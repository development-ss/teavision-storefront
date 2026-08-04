import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { PAYMENT_METHODS } from '../data'
import { PaymentMark } from './payment-mark'

const meta: Meta<typeof PaymentMark> = {
  title: 'Layout/Footer/Payment Mark',
  component: PaymentMark,
  tags: ['autodocs'],
  args: {
    method: PAYMENT_METHODS[0],
  },
}
export default meta

type Story = StoryObj<typeof PaymentMark>

export const Default: Story = {}

export const AllMethods: Story = {
  render: () => (
    <ul className="flex flex-wrap gap-1" role="list" aria-label="Payment marks">
      {PAYMENT_METHODS.map((method) => (
        <li key={method.label}>
          <PaymentMark method={method} />
        </li>
      ))}
    </ul>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const marks = canvas.getAllByRole('img')

    await expect(marks).toHaveLength(PAYMENT_METHODS.length)
    PAYMENT_METHODS.forEach((method) => {
      expect(canvas.getByRole('img', { name: method.label })).toBeVisible()
    })
  },
}
