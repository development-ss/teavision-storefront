import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { STORY_VALUES } from '../_lib/data'
import { StoryValuesAccordion } from './story-values-accordion'

const meta: Meta<typeof StoryValuesAccordion> = {
  title: 'Storefront Pages/Our Story/StoryValuesAccordion',
  component: StoryValuesAccordion,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
  args: {
    values: STORY_VALUES,
  },
}
export default meta

type Story = StoryObj<typeof StoryValuesAccordion>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const mindfulness = canvas.getByRole('button', { name: 'Mindfulness' })
    const sincerity = canvas.getByRole('button', { name: 'Sincerity' })

    await expect(mindfulness).toHaveAttribute('aria-expanded', 'false')
    await expect(sincerity).toHaveAttribute('aria-expanded', 'false')
    await expect(
      canvas.queryByRole('region', { name: 'Mindfulness' }),
    ).not.toBeInTheDocument()

    await userEvent.click(mindfulness)

    await expect(mindfulness).toHaveAttribute('aria-expanded', 'true')
    await expect(
      canvas.getByRole('region', { name: 'Mindfulness' }),
    ).toBeVisible()

    await userEvent.click(mindfulness)

    await expect(mindfulness).toHaveAttribute('aria-expanded', 'false')
    await expect(
      canvas.queryByRole('region', { name: 'Mindfulness' }),
    ).not.toBeInTheDocument()

    const accordionImages = canvasElement.querySelectorAll('img')
    await expect(accordionImages).toHaveLength(STORY_VALUES.length)
    accordionImages.forEach((image) => {
      expect(image).toHaveAttribute('loading', 'eager')
    })
  },
}

export const SingleValue: Story = {
  args: {
    values: [STORY_VALUES[0]],
  },
}

export const Empty: Story = {
  args: {
    values: [],
  },
  play: ({ canvasElement }) => {
    if (canvasElement.textContent?.trim()) {
      throw new Error('Empty StoryValuesAccordion should not render content')
    }
  },
}
