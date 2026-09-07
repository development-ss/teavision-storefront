import Image from 'next/image'

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
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16">
          <Section.Intro
            align="left"
            eyebrow={intro.eyebrow || 'Partner perspectives'}
            title={intro.title}
            copy={intro.copy}
            className="text-brand-deep max-w-xl"
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
            className="flex w-[82vw] max-w-96 shrink-0 flex-col gap-6 sm:w-96"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2">
              <div className="bg-paper row-span-2 size-18 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={testimonial.logo.src}
                  alt={testimonial.logo.alt}
                  width={testimonial.logo.width}
                  height={testimonial.logo.height}
                  sizes="72px"
                  className={cn(
                    'size-full object-contain',
                    testimonial.logo.src.includes('st-ali-logo') &&
                      'scale-[1.55]',
                  )}
                />
              </div>
              <div className="min-w-0 self-end">
                <p className="text-brand-deep font-semibold">
                  {testimonial.brand || testimonial.name}
                </p>
                {testimonial.brand && (
                  <p className="text-ink-soft text-sm">{testimonial.name}</p>
                )}
              </div>
              <StarRating rating={5} size="lg" className="self-start" />
            </div>
            <blockquote className="font-display text-brand-deep text-lg leading-relaxed italic">
              <p>“{excerpt(testimonial.quote)}”</p>
            </blockquote>
            <Badge
              variant="certification"
              label="Verified Customer"
              className="mt-auto self-start"
            />
          </Card>
        ))}
      </TestimonialsMarquee>
    </Section.Root>
  )
}
