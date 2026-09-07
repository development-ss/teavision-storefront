import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { INTRO, SERVICES } from '../_lib/data'
import { PageContent } from './page-content'

const meta: Meta<typeof PageContent> = {
  title: 'Storefront Pages/Services/PageContent',
  component: PageContent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  args: { action: fn().mockResolvedValue({ success: true }) },
}
export default meta

type Story = StoryObj<typeof PageContent>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Our Core Services' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Talk to our experts' }),
    ).toHaveAttribute('href', '#need-help')
    await expect(canvas.getByText(INTRO)).toBeVisible()
    const servicesList = within(
      canvas.getByRole('list', { name: 'Core services' }),
    )
    await expect(servicesList.getAllByRole('listitem')).toHaveLength(6)
    await expect(servicesList.getAllByRole('link')).toHaveLength(6)
    for (const service of SERVICES) {
      const cardLink = servicesList.getByRole('link', {
        name: `Learn More about ${service.title}`,
      })
      await expect(cardLink).toHaveAttribute('href', service.href)
      const card = within(cardLink)
      await expect(
        card.getByRole('heading', { name: service.title }),
      ).toBeVisible()
      await expect(card.getByText(service.copy)).toBeVisible()
      await expect(card.getByRole('img', { name: service.alt })).toBeVisible()
    }
    await expect(canvas.getByRole('textbox', { name: 'Name' })).toBeVisible()
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeVisible()
  },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: Default.play,
}
