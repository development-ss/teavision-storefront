import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StarRating } from '@/components/ui/star-rating'
import { cn } from '@/lib/utils'

// Distribution supplied in the design reference; the review count is 76.
const DISTRIBUTION = [87, 9, 3, 1, 0] as const
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
          Verified Rating
        </span>
      </div>

      <div className="mt-5 flex items-center gap-5">
        <p className="font-display text-brand-deep shrink-0 text-6xl leading-none font-semibold tracking-tight whitespace-nowrap sm:text-7xl">
          4.9<span className="sr-only"> out of 5</span>
        </p>
        <div className="grid gap-1">
          <div aria-hidden="true">
            <StarRating rating={5} size="lg" />
          </div>
          <p className="text-ink-soft text-sm">Based on 76 reviews</p>
        </div>
      </div>

      <ul aria-label="Rating breakdown" className="mt-6 grid gap-2">
        {DISTRIBUTION.map((percentage, index) => (
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
                width={percentage}
                height="6"
                rx="3"
                className={cn(
                  'fill-current',
                  index === 0 ? 'text-brand-deep' : 'text-ink-faint/50',
                )}
              />
            </svg>
            <span className="w-8 text-right">{percentage}%</span>
          </li>
        ))}
      </ul>

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
