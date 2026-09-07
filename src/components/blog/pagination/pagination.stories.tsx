import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.queryByRole('link', { name: 'Previous page' }),
    ).toBeNull()
    await expect(
      canvas.getByRole('link', { name: 'Next page' }),
    ).toHaveAttribute('href', '/blogs/teavision-blogs/page/2#articles')
    await expect(canvas.getByRole('link', { name: 'Page 1' })).toHaveAttribute(
      'href',
      '/blog#articles',
    )
  },
}

export const MiddlePageTagged: Story = {
  args: {
    activeTag: 'Japanese Tea',
    blogHandle: 'teavision-blogs',
    currentPage: 5,
    totalPages: 10,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const link of canvas.getAllByRole('link')) {
      await expect(link.getAttribute('href')).toMatch(
        /\/tagged\/japanese-tea(?:\/page\/\d+)?#articles$/,
      )
    }
    await expect(canvas.getByRole('link', { name: 'Page 5' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  },
}

export const LastPage: Story = {
  args: {
    ...Default.args,
    currentPage: 5,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('link', { name: 'Next page' })).toBeNull()
    await expect(
      canvas.getByRole('link', { name: 'Previous page' }),
    ).toHaveAttribute('href', '/blogs/teavision-blogs/page/4#articles')
  },
}

export const SinglePage: Story = {
  args: {
    ...Default.args,
    totalPages: 1,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('navigation')).toBeNull()
  },
}

export const Compact: Story = {
  args: {
    ...Default.args,
    currentPage: 2,
    variant: 'compact',
  },
  decorators: [
    (Story) => (
      <div className="w-80 max-w-full">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Page 2 of 5')).toBeVisible()
    await expect(canvas.getAllByRole('link')).toHaveLength(2)
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.clientWidth,
    )
    await expect(
      canvas.getByRole('link', { name: 'Previous page' }),
    ).toHaveAttribute('href', '/blog#articles')
  },
}
