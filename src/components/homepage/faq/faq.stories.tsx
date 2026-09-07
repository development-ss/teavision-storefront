import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { getServiceFaqs } from '@/lib/faq/content'

import { FAQ_FIXTURE } from '../content'
import { Faq } from './faq'

const meta: Meta<typeof Faq> = {
  title: 'Homepage/Faq',
  component: Faq,
  tags: ['autodocs'],
  args: FAQ_FIXTURE,
}
export default meta

type Story = StoryObj<typeof Faq>

export const Default: Story = {
  args: {},
}

export const TitledGroup: Story = {
  args: {
    eyebrow: null,
    description: null,
    title: 'General Wholesale Tea Questions',
    tone: 'surface',
  },
}

export const TeaBagManufacturing: Story = {
  args: {
    eyebrow: null,
    description: null,
    title: 'Tea Bag Manufacturing FAQs',
    items: getServiceFaqs('tea-bag-manufacturer'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const question = canvas.getByText(
      'Do you manufacture tea bags for other brands?',
    )
    const details = question.closest('details')

    await expect(canvasElement.querySelectorAll('details')).toHaveLength(5)
    await expect(details).not.toHaveAttribute('open')
    await userEvent.click(question)
    await expect(details).toHaveAttribute('open')
    await expect(
      canvas.getByText(/Yes. Teavision provides tea bag manufacturing/),
    ).toBeVisible()
    await userEvent.click(question)
    await expect(details).not.toHaveAttribute('open')
  },
}

export const PrivateLabel: Story = {
  args: {
    eyebrow: null,
    description: null,
    title: 'Private Label FAQs',
    items: getServiceFaqs('private-label-packing'),
  },
}

export const CustomBlending: Story = {
  args: {
    eyebrow: null,
    description: null,
    title: 'Custom Tea Blending FAQs',
    items: getServiceFaqs('custom-tea-blends'),
  },
}
