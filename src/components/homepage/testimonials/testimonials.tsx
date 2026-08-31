import Image from 'next/image'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import { StarRating } from '@/components/ui/star-rating'
import type { HomepageContent } from '@/lib/sanity/home-page'
import { cn } from '@/lib/utils'

import { TESTIMONIALS_FIXTURE } from '../content'
import { TestimonialsSlider } from './testimonials-slider'

export type TestimonialsProps = {
  intro?: HomepageContent['testimonials']['intro']
  items?: HomepageContent['testimonials']['items']
}

export function Testimonials({
  intro = TESTIMONIALS_FIXTURE.intro,
  items = TESTIMONIALS_FIXTURE.items,
}: TestimonialsProps = {}) {
  return (
    <Section.Root tone="inverse">
      <Section.Container>
        <div className="mx-auto max-w-3xl text-center">
          {intro.eyebrow && (
            <Eyebrow tone="gold" className="mb-4 justify-center">
              {intro.eyebrow}
            </Eyebrow>
          )}
          <h2 className="type-heading-01 text-paper">{intro.title}</h2>
          {intro.copy && <p className="text-paper/75 mt-4">{intro.copy}</p>}
        </div>

        <TestimonialsSlider slideCount={items.length}>
          {items.map((testimonial) => (
            <div
              key={testimonial.name}
              className="min-w-0 shrink-0 grow-0 basis-full pl-4"
              role="group"
              aria-roledescription="slide"
              aria-label={`${testimonial.name} testimonial`}
            >
              <article className="border-paper/15 mx-auto max-w-5xl border-y py-6 md:py-8">
                <div className="grid gap-6 md:grid-cols-[9rem_minmax(0,1fr)] md:items-start md:gap-12">
                  <div className="flex flex-col items-start">
                    <div className="border-paper/20 bg-paper size-24 shrink-0 overflow-hidden rounded-md border md:size-32">
                      <Image
                        src={testimonial.logo.src}
                        alt={testimonial.logo.alt}
                        width={testimonial.logo.width}
                        height={testimonial.logo.height}
                        sizes="(min-width: 768px) 128px, 96px"
                        className={cn(
                          'size-full object-contain',
                          testimonial.logo.src.includes('st-ali-logo') &&
                            'scale-[1.55]',
                        )}
                      />
                    </div>
                    <StarRating rating={5} size="lg" className="mt-4" />
                  </div>

                  <blockquote>
                    <p className="text-paper/85 max-w-[70ch] text-base leading-relaxed md:text-[1.04rem]">
                      {testimonial.quote}
                    </p>
                    <footer className="mt-6">
                      <cite className="not-italic">
                        <span className="font-display text-paper block text-[1.25rem] leading-tight">
                          {testimonial.name}
                        </span>
                        <span className="text-paper/65 mt-1 block text-sm">
                          {testimonial.role ? `${testimonial.role}` : null}
                          {testimonial.role && testimonial.brand ? ', ' : null}
                          {testimonial.brand ?? null}
                        </span>
                      </cite>
                    </footer>
                  </blockquote>
                </div>
              </article>
            </div>
          ))}
        </TestimonialsSlider>
      </Section.Container>
    </Section.Root>
  )
}
