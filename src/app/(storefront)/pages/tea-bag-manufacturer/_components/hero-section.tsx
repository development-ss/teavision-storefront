import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { HERO_CERT_LOGOS, HERO_FEATURES, HERO_IMAGE_SRC } from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Copy column */}
          <div>
            <Eyebrow>Tea Bag Manufacturer</Eyebrow>
            <h1 className="type-heading-01 text-ink mt-4 text-balance">
              Custom <span className="text-brand">tea bags &amp; blends</span>{' '}
              for global brands
            </h1>
            <p className="type-lede text-ink-soft mt-4 max-w-[52ch]">
              Over 10 million tea bags produced annually. From custom blends to
              private label packaging, we deliver premium tea solutions
              worldwide with international shipping from Australia.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {HERO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span
                    className="bg-brand mt-1.5 size-2.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  <span className="text-ink font-semibold">{feature}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-8 flex flex-wrap items-center gap-3">
              {HERO_CERT_LOGOS.map((logo) => (
                <li key={logo.src}>
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={56}
                    height={56}
                    unoptimized
                    className="h-12 w-auto sm:h-14"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#need-help" variant="brand" size="lg">
                Get Custom Quote
              </Button>
            </div>
          </div>

          {/* Media column */}
          <div className="relative aspect-4/3 overflow-hidden rounded-xl">
            <Image
              src={HERO_IMAGE_SRC}
              alt="Teavision tea bag manufacturing"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              preload
            />
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
