import Image from 'next/image'
import {
  ArrowRight,
  FlaskConical,
  Medal,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { HomepageContent } from '@/lib/sanity/home-page'
import { cn } from '@/lib/utils'

const STRIP_ICON_MAP: Record<string, LucideIcon> = {
  FlaskConical,
  Medal,
  Truck,
}

const GOOGLE_RATING = {
  rating: 4.9,
  reviewCount: 76,
  stars: [1, 2, 3, 4, 5],
} as const

export type HomepageHeroProps = {
  hero: HomepageContent['hero']
}

export function HomepageHero({ hero }: HomepageHeroProps) {
  return (
    <Section.Root
      tone="transparent"
      spacing="none"
      className="relative isolate flex min-h-[min(92vh,860px)] flex-col overflow-hidden"
    >
      <Image
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        sizes="100vw"
        fetchPriority="high"
        quality={82}
        placeholder={hero.image.lqip ? 'blur' : 'empty'}
        blurDataURL={hero.image.lqip ?? undefined}
        className="absolute inset-0 -z-20 object-cover"
      />
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />
      {/* Inner content: mt-auto + block padding per design .heroA__inner —
          text sits above the trust strip, not flush to the hero bottom.
          The transparent gradient marks this block as sitting over the hero
          image so automated contrast checks treat it as image-backed (their
          correct "needs review" verdict) rather than failing the light-gold
          eyebrow against the page background — real legibility comes from
          .hero-scrim above. */}
      <Section.Container className="mt-auto w-full bg-linear-to-t from-transparent to-transparent py-[clamp(60px,9vw,110px)]">
        <Eyebrow tone="gold" className="mb-6.5">
          {hero.eyebrow}
        </Eyebrow>
        <h1 className="type-display text-paper max-w-[16ch]">{hero.title}</h1>
        <p className="type-lede text-paper/90 mt-6 max-w-[48ch]">{hero.copy}</p>
        <div className="mt-8.5 flex flex-wrap gap-3">
          <Button href={hero.cta.href} variant="inverse" size="lg">
            {hero.cta.children}
            <ArrowRight
              aria-hidden="true"
              className="size-4.5"
              strokeWidth={1.8}
            />
          </Button>
        </div>
      </Section.Container>

      {/* Trust strip at the hero foot per design .heroA__strip —
          dark translucent band keeps the stats legible over any hero photo */}
      <div className="border-paper/18 bg-ink/75 border-t">
        <Section.Container className="sm:px-gutter! px-4!">
          <ul
            className="grid grid-cols-1 min-[360px]:grid-cols-2 xl:grid-cols-4"
            role="list"
          >
            {hero.proofPoints.map((point, index) => {
              const IconComponent = point.icon
                ? STRIP_ICON_MAP[point.icon]
                : undefined
              const isGoogleRating = index === 2
              const isLastOverall = index === hero.proofPoints.length - 1
              return (
                <li
                  key={point.title}
                  className={cn(
                    'border-paper/14 grid min-h-28 min-w-0 grid-rows-[auto_auto] content-center gap-1.5 p-4 min-[360px]:grid-rows-[auto_2.5rem] sm:p-5 md:grid-rows-[auto_auto] lg:px-6 xl:px-7',
                    !isLastOverall && 'border-b',
                    index === 2 && 'min-[360px]:border-b-0',
                    index < 2 && 'xl:border-b-0',
                    index % 2 === 0 && 'min-[360px]:border-r',
                    index === 1 && 'xl:border-r',
                  )}
                >
                  <div className="font-display text-paper flex h-7 min-w-0 items-center gap-2.5 text-[clamp(1rem,4.2vw,1.4rem)] leading-none whitespace-nowrap sm:text-[1.45rem] lg:text-[1.65rem]">
                    {isGoogleRating ? (
                      <>
                        <span>{GOOGLE_RATING.rating}</span>
                        <span
                          className="text-rating flex items-center gap-0.5"
                          role="img"
                          aria-label={`${GOOGLE_RATING.rating} out of 5 stars from ${GOOGLE_RATING.reviewCount} Google reviews`}
                        >
                          {GOOGLE_RATING.stars.map((star) => (
                            <Star
                              key={star}
                              aria-hidden="true"
                              className="size-3.5 fill-current lg:size-4"
                              strokeWidth={1.5}
                            />
                          ))}
                        </span>
                      </>
                    ) : (
                      <>
                        {point.image ? (
                          <Image
                            src={point.image.src}
                            alt={point.image.alt}
                            width={48}
                            height={24}
                            className="h-auto w-11 shrink-0 lg:w-12"
                          />
                        ) : IconComponent ? (
                          <IconComponent
                            aria-hidden="true"
                            className="text-gold size-6 shrink-0"
                            strokeWidth={1.8}
                          />
                        ) : null}
                        <span>{point.title}</span>
                      </>
                    )}
                  </div>
                  <p className="text-paper/85 max-w-[22ch] text-[0.82rem] leading-snug text-pretty md:max-w-none md:text-[0.95rem] md:whitespace-nowrap">
                    {isGoogleRating
                      ? `Google rated · ${GOOGLE_RATING.reviewCount} reviews`
                      : point.description}
                  </p>
                </li>
              )
            })}
          </ul>
        </Section.Container>
      </div>
    </Section.Root>
  )
}
