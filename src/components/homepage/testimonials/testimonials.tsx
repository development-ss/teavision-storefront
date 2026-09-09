import Image from 'next/image'
import { BadgeCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { StarRating } from '@/components/ui/star-rating'
import type { HomepageContent } from '@/lib/sanity/home-page'
import { cn } from '@/lib/utils'

import { TESTIMONIALS_FIXTURE } from '../content'
import { GoogleRating } from '../google-rating'
import { TestimonialsMarquee } from './marquee'

export type TestimonialsProps = {
  intro?: HomepageContent['testimonials']['intro']
  items?: HomepageContent['testimonials']['items']
}

function excerpt(quote: string) {
  if (quote.length <= 220) return quote

  const start = quote.slice(0, 220)
  const wordBoundary = start.lastIndexOf(' ')
  return `${start.slice(0, wordBoundary > 0 ? wordBoundary : 220).trimEnd()}…`
}

export function Testimonials({
  intro = TESTIMONIALS_FIXTURE.intro,
  items = TESTIMONIALS_FIXTURE.items,
}: TestimonialsProps = {}) {
  if (items.length === 0) return null

  return (
    <Section.Root tone="sunken" aria-label="Customer testimonials">
      <Section.Container>
        <div className="grid items-center gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
          <Section.Intro
            align="left"
            eyebrow={intro.eyebrow || 'Partner perspectives'}
            title={intro.title}
            copy={intro.copy}
            className="max-w-xl"
            copyClassName="max-w-[48ch] text-base leading-relaxed"
          />
          <GoogleRating />
        </div>
      </Section.Container>

      <TestimonialsMarquee itemCount={items.length}>
        {items.map((testimonial, index) => (
          <Card
            as="li"
            padding="lg"
            key={`${testimonial.name}-${index}`}
            className={cn(
              'flex min-w-0 flex-col gap-5 wrap-anywhere md:gap-6',
              items.length >= 4 && 'auto-scroll:w-96 auto-scroll:shrink-0',
            )}
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2">
              <div className="bg-paper row-span-2 size-14 shrink-0 overflow-hidden rounded-md sm:size-18">
                <Image
                  src={testimonial.logo.src}
                  alt={testimonial.logo.alt}
                  width={testimonial.logo.width}
                  height={testimonial.logo.height}
                  sizes="(min-width: 640px) 72px, 56px"
                  className="size-full object-contain p-1"
                />
              </div>
              <div className="min-w-0 self-end">
                <p className="text-ink font-semibold">
                  {testimonial.brand || testimonial.name}
                </p>
                {testimonial.brand && (
                  <p className="text-ink-soft text-sm">{testimonial.name}</p>
                )}
              </div>
              <StarRating rating={5} size="lg" className="self-start" />
            </div>
            <blockquote className="font-display text-ink-soft text-lg leading-relaxed italic">
              <p>“{excerpt(testimonial.quote)}”</p>
            </blockquote>
            <Badge
              variant="certification"
              label="Verified Customer"
              icon={
                <BadgeCheck aria-hidden="true" className="size-3.5 shrink-0" />
              }
              className="mt-auto self-start"
            />
          </Card>
        ))}
      </TestimonialsMarquee>
    </Section.Root>
  )
}
