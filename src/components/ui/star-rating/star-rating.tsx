import { useId } from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export type StarRatingSize = 'sm' | 'md' | 'lg'

export type StarRatingProps = {
  rating: number
  count?: number
  size?: StarRatingSize
  className?: string
}

const starSizeBySize: Record<StarRatingSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
}

const ratingTextVariants = cva('text-ink-soft tabular-nums', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    } satisfies Record<StarRatingSize, string>,
  },
  defaultVariants: {
    size: 'md',
  },
})

function Star({
  fill,
  size,
  gradientId,
}: {
  fill: 'full' | 'half' | 'empty'
  size: number
  gradientId: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      className={cn(fill === 'empty' ? 'text-ink-faint/40' : 'text-rating')}
    >
      {fill === 'half' && (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.49L10 14.01l-4.94 2.69.94-5.49-4-3.9 5.53-.8L10 1.5z"
        fill={
          fill === 'full'
            ? 'currentColor'
            : fill === 'half'
              ? `url(#${gradientId})`
              : 'none'
        }
        stroke="currentColor"
        strokeWidth={fill === 'empty' ? 1.5 : 0}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarRating({
  rating,
  count,
  size = 'md',
  className,
}: StarRatingProps) {
  const starSize = starSizeBySize[size]
  const clamped = Math.min(5, Math.max(0, rating))
  const gradientIdBase = useId().replace(/:/g, '')

  const stars = Array.from({ length: 5 }, (_, i) => {
    if (clamped >= i + 1) return 'full' as const
    if (clamped >= i + 0.5) return 'half' as const
    return 'empty' as const
  })
  const ratingLabel = `${clamped.toFixed(1)} out of 5 stars${
    count !== undefined
      ? `, ${count} ${count === 1 ? 'review' : 'reviews'}`
      : ''
  }`

  return (
    <div
      className={cn('inline-flex items-center gap-1.5', className)}
      role="img"
      aria-label={ratingLabel}
    >
      <div className="flex" aria-hidden="true">
        {stars.map((fill, i) => (
          <Star
            key={i}
            fill={fill}
            size={starSize}
            gradientId={`${gradientIdBase}-star-half-${i}`}
          />
        ))}
      </div>
      {count !== undefined && (
        <span className={ratingTextVariants({ size })} aria-hidden="true">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  )
}
