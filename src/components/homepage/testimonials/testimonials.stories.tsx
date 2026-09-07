import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { TESTIMONIALS_FIXTURE } from '../content'
import { Testimonials } from './testimonials'

const meta: Meta<typeof Testimonials> = {
  title: 'Homepage/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  args: TESTIMONIALS_FIXTURE,
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
}
export default meta

type Story = StoryObj<typeof Testimonials>

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('complementary', { name: 'Google rating summary' }),
    ).toBeVisible()
    const heading = canvas.getByRole('heading', {
      name: TESTIMONIALS_FIXTURE.intro.title,
    })
    const paragraph = canvas.getByText(TESTIMONIALS_FIXTURE.intro.copy)
    await expect(paragraph.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      heading.getBoundingClientRect().bottom,
    )
    const list = canvas.getByRole('list', { name: 'Partner testimonials' })
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4)
    await expect(
      within(list).getAllByRole('img', { name: '5.0 out of 5 stars' }),
    ).toHaveLength(TESTIMONIALS_FIXTURE.items.length)
    await expect(within(list).getAllByText('Verified Customer')).toHaveLength(
      TESTIMONIALS_FIXTURE.items.length,
    )
    for (const item of TESTIMONIALS_FIXTURE.items) {
      await expect(within(list).getByText(item.brand)).toBeVisible()
      await expect(
        canvas.queryByText(item.quote, { exact: true }),
      ).not.toBeInTheDocument()
    }
  },
}

export const PauseControl: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const pause = canvas.getByRole('checkbox', {
      name: 'Pause or resume automatic scrolling',
      hidden: true,
    })
    // The control is intentionally absent from touch and reduced-motion layouts.
    if (
      window.matchMedia(
        '(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      ).matches
    ) {
      pause.focus()
      await userEvent.keyboard(' ')
      await expect(pause).toBeChecked()
      await expect(canvas.getByText('Resume')).toBeVisible()
      await userEvent.keyboard(' ')
      await expect(pause).not.toBeChecked()
    } else {
      await expect(pause).not.toBeVisible()
    }
  },
}

export const SinglePartner: Story = {
  args: { items: TESTIMONIALS_FIXTURE.items.slice(0, 1) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list', { name: 'Partner testimonials' })
    await expect(within(list).getAllByRole('listitem')).toHaveLength(1)
    await expect(canvas.queryByRole('checkbox')).not.toBeInTheDocument()
  },
}

export const TwoPartners: Story = {
  args: { items: TESTIMONIALS_FIXTURE.items.slice(0, 2) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list', { name: 'Partner testimonials' })
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2)
    await expect(canvas.queryByRole('checkbox')).not.toBeInTheDocument()
    await expect(
      canvas.getByRole('region', { name: 'Customer testimonial excerpts' }),
    ).toHaveAttribute('tabindex', '0')
  },
}

export const ShortQuoteWithoutOptionalAttribution: Story = {
  args: {
    intro: { title: 'Our partners', eyebrow: null, copy: null },
    items: [
      {
        ...TESTIMONIALS_FIXTURE.items[0],
        brand: null,
        role: null,
        quote: 'Reliable service and thoughtful support.',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const list = canvas.getByRole('list', { name: 'Partner testimonials' })
    await expect(within(list).getByText('Ashley McGrath')).toBeVisible()
    await expect(
      within(list).getByText('“Reliable service and thoughtful support.”'),
    ).toBeVisible()
  },
}

export const LongContent: Story = {
  args: {
    items: TESTIMONIALS_FIXTURE.items.map((item) => ({
      ...item,
      name: 'A customer with a particularly long name',
      brand:
        'An Australian tea and botanical ingredient business with a long name',
      quote: item.quote.repeat(3),
    })),
  },
}

export const Empty: Story = {
  args: { items: [] },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('region', {
        name: 'Customer testimonials',
      }),
    ).not.toBeInTheDocument()
  },
}
