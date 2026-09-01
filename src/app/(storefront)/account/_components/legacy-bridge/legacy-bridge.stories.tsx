import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LegacyBridge } from './legacy-bridge'

const meta: Meta<typeof LegacyBridge> = {
  title: 'Account/LegacyBridge',
  component: LegacyBridge,
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

type Story = StoryObj<typeof LegacyBridge>

const registerArgs = {
  body: 'Classic account registration has moved to the modern Shopify customer account flow.',
  heading: 'Create your account with Shopify',
  primaryHref: '/account/login/start?returnTo=%2Faccount',
  primaryLabel: 'Create account with Shopify',
}

const recoverArgs = {
  body: 'Classic password recovery has moved. Start Shopify sign-in and use the hosted account recovery options when prompted.',
  heading: 'Recover your account with Shopify',
  primaryHref: '/account/login/start?returnTo=%2Faccount',
}

function getRenderedLineCount(element: HTMLElement): number {
  const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight)
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return 1

  return Math.ceil(element.getBoundingClientRect().height / lineHeight)
}

async function assertBridgeFit(
  canvasElement: HTMLElement,
  heading: string,
  maxLines: number,
) {
  const canvas = within(canvasElement)
  const headingElement = canvas.getByRole('heading', { name: heading })
  const primaryAction = canvas.getByRole('link', {
    name: /(?:Create account|Sign in) with Shopify/,
  })
  const supportAction = canvas.getByRole('link', { name: 'Contact support' })
  const cardElement = headingElement.parentElement?.parentElement

  if (!cardElement) {
    throw new Error('Could not find the account bridge card')
  }

  const cardBounds = cardElement.getBoundingClientRect()

  for (const action of [primaryAction, supportAction]) {
    const actionBounds = action.getBoundingClientRect()

    expect(actionBounds.left).toBeGreaterThanOrEqual(cardBounds.left)
    expect(actionBounds.right).toBeLessThanOrEqual(cardBounds.right)
  }

  expect(canvasElement.scrollWidth).toBeLessThanOrEqual(
    canvasElement.clientWidth + 1,
  )
  expect(headingElement.scrollWidth).toBeLessThanOrEqual(
    headingElement.clientWidth + 1,
  )
  expect(getRenderedLineCount(headingElement)).toBeLessThanOrEqual(maxLines)
  await expect(
    canvas.getByText(
      'Teavision now uses Shopify-hosted Customer Account sign-in.',
    ),
  ).toBeInTheDocument()
  await expect(primaryAction).toHaveAttribute(
    'href',
    '/account/login/start?returnTo=%2Faccount',
  )
}

export const Register: Story = {
  args: registerArgs,
  play: async ({ canvasElement }) => {
    await assertBridgeFit(canvasElement, registerArgs.heading, 2)
  },
}

export const Recover: Story = {
  args: recoverArgs,
  play: async ({ canvasElement }) => {
    await assertBridgeFit(canvasElement, recoverArgs.heading, 2)
  },
}

export const RegisterMobile: Story = {
  name: 'register-mobile',
  args: registerArgs,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    await assertBridgeFit(canvasElement, registerArgs.heading, 3)
  },
}

export const RecoverMobile: Story = {
  name: 'recover-mobile',
  args: recoverArgs,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: async ({ canvasElement }) => {
    await assertBridgeFit(canvasElement, recoverArgs.heading, 3)
  },
}

export const VerificationFailed: Story = {
  args: {
    body: 'We could not verify that account link. Start sign-in again to continue through the secure Shopify account flow.',
    heading: 'Account link could not be verified',
    primaryHref: '/account/login/start?returnTo=%2Faccount',
  },
}

export const UnknownRoute: Story = {
  args: {
    body: 'This classic account link is no longer used by the headless storefront. Start Shopify sign-in or contact support if you need help finding an order.',
    heading: 'Account access has moved',
    primaryHref: '/account/login/start?returnTo=%2Faccount',
  },
}
