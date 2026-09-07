import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { sampleArticles } from '../story-data'
import { ArticleResults } from './article-results'

const meta: Meta<typeof ArticleResults> = {
  title: 'Blog/ArticleResults',
  component: ArticleResults,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
}
export default meta

type Story = StoryObj<typeof ArticleResults>

export const LatestArticles: Story = {
  args: {
    activeTag: null,
    blogHandle: 'teavision-blogs',
    heading: 'Latest Articles',
    paginated: {
      articles: sampleArticles,
      currentPage: 1,
      totalPages: 2,
      totalArticles: sampleArticles.length,
    },
    tags: ['Herbal Tea', 'Japanese Tea', 'Tea Bag', 'Wholesale Tea'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { name: 'Latest Articles' })
    await expect(heading).toHaveAttribute('id', 'articles')
    await expect(heading).toHaveAttribute('tabindex', '-1')
    heading.focus({ preventScroll: true })
    await expect(heading).toHaveFocus()
    await expect(
      canvas.getByRole('navigation', { name: 'Article page navigation' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('navigation', { name: 'Blog pagination' }),
    ).toBeVisible()
  },
}

export const SearchResults: Story = {
  args: {
    activeTag: 'Japanese Tea',
    blogHandle: 'teavision-blogs',
    heading: 'Japanese Tea Articles',
    paginated: {
      articles: sampleArticles.slice(1, 2),
      currentPage: 1,
      totalPages: 1,
      totalArticles: 1,
    },
    query: 'matcha',
    tags: ['Herbal Tea', 'Japanese Tea', 'Tea Bag', 'Wholesale Tea'],
  },
}

export const Empty: Story = {
  args: {
    activeTag: null,
    blogHandle: 'teavision-blogs',
    heading: 'Search Results',
    paginated: {
      articles: [],
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0,
    },
    query: 'oolong matcha wholesale',
    tags: ['Herbal Tea', 'Japanese Tea', 'Tea Bag', 'Wholesale Tea'],
  },
}
