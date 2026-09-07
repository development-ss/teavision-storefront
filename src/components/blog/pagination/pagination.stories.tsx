import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Pagination } from './pagination'

const meta: Meta<typeof Pagination> = {
  title: 'Blog/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta

type Story = StoryObj<typeof Pagination>

export const Default: Story = {
  args: {
    activeTag: null,
    blogHandle: 'teavision-blogs',
    currentPage: 1,
    totalPages: 5,
  },
}

export const MiddlePageTagged: Story = {
  args: {
    activeTag: 'Japanese Tea',
    blogHandle: 'teavision-blogs',
    currentPage: 5,
    totalPages: 10,
  },
}

export const LastPage: Story = {
  args: {
    ...Default.args,
    currentPage: 5,
  },
}

export const SinglePage: Story = {
  args: {
    ...Default.args,
    totalPages: 1,
  },
}
