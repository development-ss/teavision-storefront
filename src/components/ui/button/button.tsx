import React from 'react'
import Link, { type LinkProps } from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'items-center justify-center gap-2.5 whitespace-nowrap',
    'inline-flex cursor-pointer',
    // translate is its own CSS property in Tailwind 4 — listing only
    // `transform` would make hover lifts snap instead of animate
    'transition-[background-color,color,box-shadow,translate]',
    // Design .btn svg: icon slides right on hover; lift respects reduced motion
    '[&_svg]:transition-transform hover:[&_svg]:translate-x-1',
    'motion-reduce:transform-none motion-reduce:[&_svg]:transform-none',
    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-40',
    'rounded-full',
  ],
  {
    variants: {
      variant: {
        brand:
          'bg-brand text-paper hover:bg-brand-deep active:bg-brand-deep hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-12px_var(--color-brand-deep)]',
        primary:
          'bg-ink text-paper hover:bg-ink-deep active:bg-ink-deep hover:-translate-y-0.5',
        secondary:
          'border-[1.5px] border-hairline bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper',
        inverse: 'bg-paper text-ink hover:-translate-y-0.5 hover:shadow-2',
        inverseSecondary:
          'border-[1.5px] border-paper/35 bg-transparent text-paper hover:border-ink hover:bg-ink',
        ghost: 'text-brand hover:bg-brand-tint hover:text-brand-deep',
        quiet: 'bg-transparent text-ink-faint hover:text-gold-deep',
        // Faux-input look for search/filter triggers — field chrome, placeholder-
        // weight text, and no icon hover-slide.
        field:
          'border-hairline bg-card text-ink-faint justify-start border hover:border-brand hover:text-ink-soft hover:[&_svg]:translate-x-0',
        footerLink:
          'bg-transparent text-paper/75 hover:text-paper focus-visible:ring-offset-ink',
      },
      size: {
        sm: 'type-label min-h-11 px-4.5 text-[0.86rem]',
        md: 'type-label min-h-11 px-6.5',
        lg: 'type-label min-h-12 px-8.5',
        cta: 'type-label min-h-12 px-8.5',
        // Quiet text-link sizing per design .cart__remove — mono caps, no pill padding
        quiet:
          'min-h-11 px-0 font-mono text-[10.5px] font-normal tracking-widest uppercase',
        footerLink:
          'min-h-0 px-0 font-mono text-[11px] font-normal tracking-[0.06em] normal-case',
        // Input-height sizing for the field variant — body-scale text, not label caps
        field: 'h-11 min-h-11 px-4 text-sm font-normal tracking-normal',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

function shouldUseNextLink(href: LinkProps['href']) {
  return (
    typeof href !== 'string' ||
    (href.startsWith('/') && !href.startsWith('//')) ||
    href.startsWith('#')
  )
}

type ButtonVariantProps = VariantProps<typeof buttonVariants>

type ButtonSharedProps = ButtonVariantProps & {
  children?: React.ReactNode
}

type ButtonAsButton = ButtonSharedProps &
  Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ButtonSharedProps
  > & {
    href?: never
    isLoading?: boolean
  }

type ButtonAsAnchor = ButtonSharedProps &
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof ButtonSharedProps | keyof LinkProps | 'type'
  > &
  LinkProps & {
    disabled?: never
    isLoading?: never
    type?: never
  }

export type ButtonProps = ButtonAsButton | ButtonAsAnchor

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    { variant = 'primary', size = 'md', children, className, ...props },
    ref,
  ) => {
    const baseClasses = buttonVariants({ variant, size })

    if (props.href !== undefined) {
      const classes = cn(baseClasses, className)

      if (!shouldUseNextLink(props.href)) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            className={classes}
            {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {children}
          </a>
        )
      }

      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...props}
        >
          {children}
        </Link>
      )
    }

    const {
      disabled,
      isLoading = false,
      type = 'button',
      ...buttonProps
    } = props
    const classes = cn(
      baseClasses,
      isLoading &&
        'disabled:opacity-100 hover:translate-y-0 hover:shadow-none hover:[&_svg]:translate-x-0',
      className,
    )

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        data-loading={isLoading || undefined}
        className={classes}
        {...buttonProps}
      >
        {isLoading && (
          <LoaderCircle
            className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
