import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors',
    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-40',
  ],
  {
    variants: {
      variant: {
        outline: 'border border-hairline hover:bg-brand-tint hover:text-brand',
        ghost: 'text-ink-soft hover:bg-brand-tint hover:text-brand',
        rating:
          'rounded-sm text-gold hover:bg-transparent hover:text-gold-deep aria-pressed:text-gold-deep',
      },
      size: {
        sm: 'size-11',
        md: 'size-11',
        lg: 'size-12',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  },
)

type IconButtonAccessibleName =
  | {
      'aria-label': string
      'aria-labelledby'?: string
    }
  | {
      'aria-label'?: string
      'aria-labelledby': string
    }

export type IconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> &
  VariantProps<typeof iconButtonVariants> &
  IconButtonAccessibleName & {
    children: React.ReactNode
  }

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, size, type = 'button', variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(iconButtonVariants({ size, variant }), className)}
        {...props}
      >
        {children}
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
