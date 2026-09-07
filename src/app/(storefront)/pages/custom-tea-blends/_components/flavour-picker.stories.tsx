import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { FlavourPicker } from './flavour-picker'

const meta: Meta<typeof FlavourPicker> = {
  title: 'Pages/CustomTeaBlends/FlavourPicker',
  component: FlavourPicker,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof FlavourPicker>

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = canvas.getByRole('searchbox', { name: 'Search Flavours' })
    const continueLink = canvas.getByRole('link', {
      name: 'Continue without flavours',
    })

    await expect(continueLink).toHaveAttribute(
      'href',
      '/pages/contact#need-help',
    )
    await expect(continueLink).toHaveClass('bg-transparent')
    await expect(canvas.getByText('0 / 12 selected')).toBeVisible()
    await expect(canvas.getAllByRole('group')).toHaveLength(6)
    await expect(
      within(canvas.getByRole('group', { name: 'Citrus' })).getByRole(
        'checkbox',
        { name: 'Lemon' },
      ),
    ).toBeVisible()

    await userEvent.click(search)
    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await userEvent.tab()
      await expect(checkbox).toHaveFocus()
    }
    await userEvent.tab()
    await expect(continueLink).toHaveFocus()
  },
}

export const Selected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const search = canvas.getByRole('searchbox', { name: 'Search Flavours' })

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Lemon' }))
    await expect(
      canvas.getByRole('link', { name: 'Continue to Brief (1)' }),
    ).toHaveClass('bg-ink')
    await expect(
      canvas.getByText('1 flavour ready to include in your brief.'),
    ).toBeVisible()

    for (const flavour of ['Ginger', 'Jasmine', 'Vanilla', 'Berry Mix']) {
      await userEvent.click(canvas.getByRole('checkbox', { name: flavour }))
    }
    await expect(canvas.getByText('5 / 12 selected')).toBeVisible()
    await expect(
      canvas.getAllByRole('button', { name: /^Remove / }),
    ).toHaveLength(5)
    const continueLink = canvas.getByRole('link', {
      name: 'Continue to Brief (5)',
    })
    const target = new URL(
      continueLink.getAttribute('href')!,
      'https://example.com',
    )
    await expect(target.pathname).toBe('/pages/contact')
    await expect(target.hash).toBe('#need-help')
    await expect(target.searchParams.get('flavours')).toBe(
      'Lemon,Ginger,Jasmine,Vanilla,Berry Mix',
    )

    await userEvent.type(search, 'not-a-flavour')
    await expect(
      await canvas.findByText(
        'No matching flavours. Try another flavour note.',
      ),
    ).toBeVisible()
    await expect(continueLink).toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Remove Lemon' }))
    await expect(canvas.getByText('4 / 12 selected')).toBeVisible()
    await userEvent.clear(search)
    await expect(
      await canvas.findByRole('checkbox', { name: 'Lemon' }),
    ).not.toBeChecked()
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Lemon' }))
  },
}

export const MaximumSelected: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const checkboxes = canvas.getAllByRole('checkbox')
    const limitMessage =
      'Maximum of 12 flavours reached. Remove one to add another.'

    for (const checkbox of checkboxes.slice(0, 12)) {
      await userEvent.click(checkbox)
    }
    await expect(canvas.getByText('12 / 12 selected')).toBeVisible()
    await expect(canvas.getByText(limitMessage)).toBeVisible()
    await expect(
      canvas.getByText(limitMessage).closest('[aria-live]'),
    ).toHaveAttribute('aria-live', 'polite')
    await expect(
      canvas.getByRole('link', { name: 'Continue to Brief (12)' }),
    ).toBeVisible()
    for (const checkbox of checkboxes.slice(12)) {
      await expect(checkbox).toBeDisabled()
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Remove Peach' }))
    await expect(canvas.queryByText(limitMessage)).not.toBeInTheDocument()
    await expect(canvas.getByText('11 / 12 selected')).toBeVisible()
    await expect(checkboxes[12]).toBeEnabled()
    await userEvent.click(checkboxes[12])
    await expect(canvas.getByText(limitMessage)).toBeVisible()
    await userEvent.click(checkboxes[12])
    await expect(canvas.queryByText(limitMessage)).not.toBeInTheDocument()
    await userEvent.click(checkboxes[0])
  },
}
