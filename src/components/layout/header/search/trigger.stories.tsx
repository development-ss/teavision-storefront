import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { SearchTrigger } from './trigger'

const meta: Meta<typeof SearchTrigger> = {
  title: 'Layout/Header/Search Trigger',
  component: SearchTrigger,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <div className="bg-paper w-[min(36rem,calc(100vw-2rem))] p-6">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SearchTrigger>

/** Default header placement: full width of its container, keyboard hint at lg+. */
export const Default: Story = {}
