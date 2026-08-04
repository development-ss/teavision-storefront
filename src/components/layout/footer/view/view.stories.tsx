import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  CONTACT_LINKS,
  FOOTER_LINKS,
  MAIN_MENU_LINKS,
  PAYMENT_METHODS,
} from '../data'
import type { FooterNewsletterAction } from '../newsletter-form'
import { FooterView } from './view'

let lastNewsletterFields: Record<string, string> | null = null

const storyNewsletterAction: FooterNewsletterAction = async (
  _previousState: unknown,
  formData: FormData,
) => {
  lastNewsletterFields = {
    email: String(formData.get('email') ?? ''),
    website: String(formData.get('website') ?? ''),
  }

  return { success: true }
}

const meta: Meta<typeof FooterView> = {
  title: 'Layout/Footer',
  component: FooterView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true },
  },
  args: {
    newsletterAction: storyNewsletterAction,
  },
}
export default meta

type Story = StoryObj<typeof FooterView>

async function expectFooterParity(canvasElement: HTMLElement) {
  lastNewsletterFields = null
  const footer = canvasElement.querySelector('footer')
  if (!footer) throw new Error('Footer landmark not found')

  const expectedLinks = [...MAIN_MENU_LINKS, ...FOOTER_LINKS, ...CONTACT_LINKS]
  // Exclude the collapsed Popular Searches SEO block — parity covers visible links only.
  const links = Array.from(footer.querySelectorAll('a'))
    .filter((link) => !link.closest('#popular-searches'))
    .map((link) => ({
      href: link.getAttribute('href'),
      label: link.textContent?.trim() ?? '',
    }))

  if (links.length !== expectedLinks.length) {
    throw new Error(
      `Expected ${expectedLinks.length} footer links, found ${links.length}`,
    )
  }

  expectedLinks.forEach((expectedLink, index) => {
    const link = links[index]
    if (!link) {
      throw new Error(`Missing footer link at index ${index}`)
    }

    if (link.href !== expectedLink.href || link.label !== expectedLink.label) {
      throw new Error(
        `Footer link mismatch at ${index}: expected ${expectedLink.label} (${expectedLink.href}), found ${link.label} (${link.href})`,
      )
    }
  })

  const paymentTitles = Array.from(
    footer.querySelectorAll(
      '[aria-label="Payment methods"] svg[role="img"] title',
    ),
  ).map((node) => node.textContent)

  const expectedPaymentTitles = PAYMENT_METHODS.map((method) => method.label)

  if (paymentTitles.join('|') !== expectedPaymentTitles.join('|')) {
    throw new Error('Payment icons are not in the live footer order')
  }

  const canvas = within(canvasElement)
  const popularSearchesToggle = canvas.getByRole('button', {
    name: 'Popular Searches',
  })
  await expect(popularSearchesToggle).toHaveAttribute('aria-expanded', 'false')

  const popularSearchesPanel = canvasElement.querySelector('#popular-searches')
  if (!popularSearchesPanel) {
    throw new Error('Popular Searches panel not found')
  }
  await expect(popularSearchesPanel).toHaveAttribute('hidden')

  await userEvent.click(popularSearchesToggle)
  await expect(popularSearchesToggle).toHaveTextContent('Hide Popular Searches')
  await expect(popularSearchesToggle).toHaveAttribute('aria-expanded', 'true')
  await expect(popularSearchesPanel).not.toHaveAttribute('hidden')

  const popularSearchLinks = Array.from(
    popularSearchesPanel.querySelectorAll('a'),
  ).map((link) => ({
    href: link.getAttribute('href'),
    label: link.textContent?.trim() ?? '',
  }))

  if (
    popularSearchLinks.at(0)?.label !== 'teas australia' ||
    popularSearchLinks.at(0)?.href !== '/'
  ) {
    throw new Error('Popular Searches first link does not match theme order')
  }

  if (
    popularSearchLinks.at(-1)?.label !== 'japanese matcha' ||
    popularSearchLinks.at(-1)?.href !== '/collections/japanese-matcha'
  ) {
    throw new Error('Popular Searches last link does not match theme order')
  }

  await userEvent.type(canvas.getByLabelText('Email'), 'buyer@example.com')
  await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))

  await expect(await canvas.findByRole('status')).toHaveTextContent(
    'Thanks for signing up.',
  )

  const submittedFields = lastNewsletterFields as Record<string, string> | null

  if (
    !submittedFields ||
    submittedFields.email !== 'buyer@example.com' ||
    submittedFields.website !== ''
  ) {
    throw new Error('Newsletter form did not submit the expected FormData')
  }
}

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expectFooterParity(canvasElement)
  },
}

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  play: ({ canvasElement }) => {
    const footer = canvasElement.querySelector('footer')
    if (!footer) throw new Error('Footer landmark not found')

    const paymentList = footer.querySelector('[aria-label="Payment methods"]')
    if (!paymentList) throw new Error('Payment methods list not found')

    if (footer.scrollWidth > footer.clientWidth) {
      throw new Error('Footer overflows the tablet canvas')
    }
  },
}

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  play: ({ canvasElement }) => {
    const footer = canvasElement.querySelector('footer')
    if (!footer) throw new Error('Footer landmark not found')

    if (footer.scrollWidth > footer.clientWidth) {
      throw new Error('Footer overflows the mobile canvas')
    }
  },
}

export const NewsletterError: Story = {
  args: {
    newsletterAction: async () => ({
      success: false,
      error: 'Please enter a valid email address.',
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'buyer@example.com')
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Please enter a valid email address.',
    )
  },
}

export const NewsletterPending: Story = {
  args: {
    newsletterAction: (() =>
      new Promise<Awaited<ReturnType<FooterNewsletterAction>>>((resolve) => {
        void resolve
        // Keep the promise pending so Storybook can assert the submit state.
      })) satisfies FooterNewsletterAction,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'buyer@example.com')
    await userEvent.click(canvas.getByRole('button', { name: 'Subscribe' }))

    const pendingSubmit = await canvas.findByRole('button', {
      name: 'Sending…',
    })
    await expect(pendingSubmit).toBeDisabled()
    await expect(canvasElement.querySelector('form')).toHaveAttribute(
      'aria-busy',
      'true',
    )
  },
}
