import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { ProfileLoading } from './profile-loading'

const meta: Meta<typeof ProfileLoading> = {
  title: 'Account/Profile/Loading',
  component: ProfileLoading,
  tags: ['autodocs'],
  parameters: {
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="bg-paper px-gutter py-section">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ProfileLoading>

export const Loading: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading profile',
    )
  },
}
