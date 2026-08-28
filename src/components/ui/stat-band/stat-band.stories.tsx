import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Award,
  CheckCircle,
  Globe,
  Leaf,
  Package,
  Trophy,
  Users,
} from 'lucide-react'

import { StatBand } from './stat-band'

const meta: Meta<typeof StatBand> = {
  title: 'Ui/StatBand',
  component: StatBand,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof StatBand>

export const Default: Story = {
  args: {
    'aria-label': 'Supplier credentials',
    items: [
      { icon: Users, value: '2,500+', label: 'Satisfied customers' },
      { icon: Award, value: '#1', label: 'Rated and most trusted' },
      { icon: Globe, value: '40+', label: 'Countries worldwide' },
      {
        icon: CheckCircle,
        value: '100%',
        label: 'Quality satisfaction',
      },
    ],
  },
}

export const TeaBagManufacturing: Story = {
  args: {
    'aria-label': 'Tea bag manufacturing capabilities',
    items: [
      { icon: Package, value: '10M+', label: 'Tea bags sold annually' },
      {
        icon: Trophy,
        value: '#1',
        label: 'In Australia and New Zealand',
      },
      { icon: Globe, value: '50+', label: 'Countries served' },
      { icon: Leaf, value: '100+', label: 'Tea varieties' },
    ],
  },
}
