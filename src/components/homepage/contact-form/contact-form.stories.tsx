import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { HomepageContactForm } from './contact-form'

const noopAction = async () => ({ success: true })

const errorAction = async () => ({
  success: false,
  error: 'Unable to send your message right now.',
})

function pendingAction() {
  return new Promise<never>(() => undefined)
}

const meta: Meta<typeof HomepageContactForm> = {
  title: 'Homepage/HomepageContactForm',
  component: HomepageContactForm,
  tags: ['autodocs'],
  args: {
    action: noopAction,
  },
}
export default meta

type Story = StoryObj<typeof HomepageContactForm>

export const Default: Story = {
  args: {},
}

export const Success: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/^Name/), 'Buyer')
    await userEvent.type(canvas.getByLabelText(/^Email/), 'buyer@example.com')
    await userEvent.type(canvas.getByLabelText(/^Message/), 'Please contact me.')
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(await canvas.findByRole('status')).toHaveTextContent(
      'Thanks. The Teavision team will review your enquiry shortly.',
    )
  },
}

export const Error: Story = {
  args: {
    action: errorAction,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/^Name/), 'Buyer')
    await userEvent.type(canvas.getByLabelText(/^Email/), 'buyer@example.com')
    await userEvent.type(canvas.getByLabelText(/^Message/), 'Please contact me.')
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Unable to send your message right now.',
    )
  },
}

export const Pending: Story = {
  args: {
    action: pendingAction,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/^Name/), 'Buyer')
    await userEvent.type(canvas.getByLabelText(/^Email/), 'buyer@example.com')
    await userEvent.type(canvas.getByLabelText(/^Message/), 'Please contact me.')
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(
      await canvas.findByRole('button', { name: 'Sending…' }),
    ).toBeDisabled()
  },
}
