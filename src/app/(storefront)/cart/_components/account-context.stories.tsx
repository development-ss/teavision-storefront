import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { CartAccountContext } from './account-context'

const meta: Meta<typeof CartAccountContext> = {
  title: 'Cart/CartAccountContext',
  component: CartAccountContext,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <form className="bg-paper max-w-xl px-4 py-6">
        <Story />
      </form>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof CartAccountContext>

export const Guest: Story = {
  name: 'guest',
  args: {
    state: 'guest',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByText(/Checking out as a guest/)).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Sign in to use saved addresses' }),
    ).toHaveAttribute('href', '/account/login?returnTo=/cart')
  },
}
export const SignedIn: Story = {
  name: 'signed-in',
  args: {
    state: 'signed-in',
  },
}

export const SyncPending: Story = {
  name: 'sync-pending',
  args: {
    state: 'sync-pending',
  },
}

export const SyncFailedBlocked: Story = {
  name: 'sync-failed-blocked',
  args: {
    state: 'sync-failed-blocked',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByText(/We could not confirm your account for checkout/),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Retry checkout' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Sign in again' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Contact support' }),
    ).toBeVisible()
  },
}
