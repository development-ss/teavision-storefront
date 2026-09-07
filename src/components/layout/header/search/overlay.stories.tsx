import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { SearchOverlay } from './overlay'
import { SearchTrigger } from './trigger'

const meta: Meta<typeof SearchOverlay> = {
  title: 'Layout/Header/Search Overlay',
  component: SearchOverlay,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
}

export default meta

type Story = StoryObj<typeof SearchOverlay>

export const FocusManagement: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <div className="bg-paper min-h-screen p-6">
        <SearchTrigger onClick={() => setOpen(true)} />
        <SearchOverlay open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', {
      name: 'Search teas, herbs & spices…',
    })

    await userEvent.click(trigger)

    const dialog = await canvas.findByRole('dialog', { name: 'Site search' })
    await expect(dialog).toBeVisible()
    await waitFor(() => {
      expect(canvas.getByRole('combobox')).toHaveFocus()
    })

    await userEvent.keyboard('{Escape}')
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(trigger).toHaveFocus()
  },
}
