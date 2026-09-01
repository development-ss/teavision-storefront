import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { NewsletterSignupActionResult } from '@/lib/contact/types'

import { NewsletterPopup } from './newsletter-popup'

const successAction = async (): Promise<NewsletterSignupActionResult> => ({
  success: true,
})

const meta: Meta<typeof NewsletterPopup> = {
  title: 'Layout/NewsletterPopup',
  component: NewsletterPopup,
  tags: ['autodocs'],
  args: {
    action: successAction,
    forceOpen: true,
  },
}
export default meta

type Story = StoryObj<typeof NewsletterPopup>

export const Default: Story = {
  args: {},
}
