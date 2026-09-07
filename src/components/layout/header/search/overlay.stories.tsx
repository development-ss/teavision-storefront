import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { Button } from '@/components/ui/button'

import { SearchOverlay } from './overlay'

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
        <Button
          variant="brand"
          size="md"
          onClick={() => setOpen(true)}
        >
          Open search
        </Button>
        <SearchOverlay open={open} onClose={() => setOpen(false)} />
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open search' })

    await userEvent.click(trigger)

    const dialog = await canvas.findByRole('dialog', { name: 'Site search' })
    await expect(dialog).toBeVisible()
    await expect(canvas.getByRole('combobox')).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    await expect(trigger).toHaveFocus()
  },
}
