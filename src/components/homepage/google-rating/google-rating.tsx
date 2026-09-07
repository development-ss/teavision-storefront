import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { cn } from '@/lib/utils'

// Google Maps review summary verified on 7 September 2026, highest stars first.
// Source: Teavision, 29 Palladium Cct, Clyde North (REVIEWS_URL below).
const REVIEW_COUNTS = [74, 1, 0, 0, 1] as const
const REVIEW_COUNT = REVIEW_COUNTS.reduce<number>(
  (total, count) => total + count,
  0,
)
const RATING =
  REVIEW_COUNTS.reduce<number>(
    (total, count, index) => total + count * (5 - index),
    0,
  ) / REVIEW_COUNT
const REVIEWS_URL =
  'https://www.google.com/maps/search/?api=1&query=Teavision+29+Palladium+Circuit+Clyde+North'

export function GoogleRating() {
  return (
    <Card
      as="aside"
      padding="lg"
      aria-label="Google rating summary"
      className="w-full max-w-md"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Image
          src="/images/homepage/google-logo.png"
          alt="Google"
          width={92}
          height={30}
          className="h-auto w-23"
        />
        <span className="text-ink-soft text-sm font-semibold">
          Customer reviews
        </span>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <p className="font-display text-brand-deep shrink-0 text-6xl leading-none font-semibold tracking-tight whitespace-nowrap sm:text-7xl">
          {RATING.toFixed(1)}
          <span className="sr-only"> out of 5</span>
        </p>
        <div className="grid gap-1">
          <div aria-hidden="true">
            <StarRating rating={RATING} size="lg" />
          </div>
          <p className="text-ink-soft text-sm">
            Based on {REVIEW_COUNT} reviews
          </p>
        </div>
      </div>

      <ul aria-label="Rating breakdown" className="mt-6 grid gap-2">
        {REVIEW_COUNTS.map((count, index) => (
          <li
            key={index}
            className="text-ink-soft flex items-center gap-3 text-sm tabular-nums"
          >
            <span className="w-2">
              {5 - index}
              <span className="sr-only"> stars</span>
            </span>
            <Star
              aria-hidden="true"
              className="text-rating size-3 shrink-0 fill-current"
            />
            <svg
              aria-hidden="true"
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full"
              viewBox="0 0 100 6"
              preserveAspectRatio="none"
            >
              <rect
                width="100"
                height="6"
                className="text-paper-3 fill-current"
              />
              <rect
                width={(count / REVIEW_COUNT) * 100}
                height="6"
                rx="3"
                className={cn(
                  'fill-current',
                  index === 0 ? 'text-brand-deep' : 'text-ink-faint/50',
                )}
              />
            </svg>
            <span className="w-12 text-right">
              {((count / REVIEW_COUNT) * 100).toFixed(1)}%
            </span>
            <span className="sr-only">
              {count} {count === 1 ? 'review' : 'reviews'}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-ink-soft mt-4 text-xs">
        Checked <time dateTime="2026-09-07">7 September 2026</time>
      </p>

      <Button
        href={REVIEWS_URL}
        variant="secondary"
        size="sm"
        className="mt-6 w-full"
      >
        <span className="whitespace-normal">Read all reviews on Google</span>
        <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </Button>
    </Card>
  )
}
