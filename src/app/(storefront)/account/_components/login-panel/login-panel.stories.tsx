import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LoginPanel } from './login-panel'

const meta: Meta<typeof LoginPanel> = {
  title: 'Account/LoginPanel',
  component: LoginPanel,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-paper px-gutter py-section">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof LoginPanel>

export const Normal: Story = {
  args: {
    loginHref: '/account/login/start?returnTo=%2Faccount',
    reason: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      canvas.getByRole('link', { name: 'Sign in with Shopify' }),
    ).toHaveAttribute('href', '/account/login/start?returnTo=%2Faccount')
    await expect(
      canvas.getByRole('link', { name: 'Continue shopping' }),
    ).toHaveAttribute('href', '/collections/all')
    await expect(
      canvas.getByText('Secure account access is handled by Shopify.'),
    ).toBeVisible()
  },
}

export const Expired: Story = {
  args: {
    loginHref: '/account/login/start?returnTo=%2Faccount',
    reason: 'expired',
  },
}

export const VerificationFailed: Story = {
  args: {
    loginHref: '/account/login/start?returnTo=%2Faccount',
    reason: 'verification-failed',
  },
}
