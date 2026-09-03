import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FilterChips } from './filter-chips'

const organicInput = JSON.stringify({ tag: 'organic' })

const meta: Meta<typeof FilterChips> = {
  title: 'Collection/Filter Chips',
  component: FilterChips,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}

export default meta

type Story = StoryObj<typeof FilterChips>

export const Active: Story = {
  args: {
    selectedFilterLabels: [{ input: organicInput, label: 'Organic' }],
    selectedFilters: [organicInput],
    collectionPath: '/collections/all',
  },
}
