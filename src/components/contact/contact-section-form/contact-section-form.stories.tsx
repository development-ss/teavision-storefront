import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { ContactSectionForm } from './contact-section-form'

const noopAction = async () => ({ success: true })

const errorAction = async () => ({
  success: false,
  error: 'Unable to send your message right now.',
})

const fieldErrorAction = async () => ({
  success: false,
  error: 'Please fill in all required fields.',
  fieldErrors: {
    name: 'Enter your name.',
    email: 'Enter a valid email address.',
  },
})

function pendingAction() {
  return new Promise<never>(() => undefined)
}

const meta: Meta<typeof ContactSectionForm> = {
  title: 'Contact/ContactSectionForm',
  component: ContactSectionForm,
  tags: ['autodocs'],
  args: {
    action: noopAction,
  },
}
export default meta

type Story = StoryObj<typeof ContactSectionForm>

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

export const FieldErrors: Story = {
  args: {
    action: fieldErrorAction,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText(/^Name/), 'Buyer')
    await userEvent.type(canvas.getByLabelText(/^Email/), 'buyer@example.com')
    await userEvent.type(canvas.getByLabelText(/^Message/), 'Please contact me.')
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }))

    await expect(await canvas.findByText('Enter your name.')).toBeVisible()
    await expect(canvas.getByLabelText(/^Name/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    await expect(canvas.getByLabelText(/^Name/)).toHaveFocus()
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
