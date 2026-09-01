import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import {
  HERO_GRID_IMAGE_1_SRC,
  HERO_GRID_IMAGE_2_SRC,
  HERO_GRID_IMAGE_3_SRC,
  HERO_IMAGE_SRC,
  HERO_TRUST_PILLS,
} from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          {/* Copy column */}
          <div>
            <Eyebrow>Australia&rsquo;s #1 Private Label Partner</Eyebrow>
            <h1 className="type-heading-01 text-ink mt-4 max-w-[22ch] text-balance">
              Launch world-class{' '}
              <span className="text-brand">private label </span>
              teas &amp; functional blends &mdash; fast.
            </h1>
            <p className="type-lede text-ink-soft mt-4 max-w-[52ch]">
              From concept to shelf: teas, herbs, spices, custom blends, extract
              powders, superfoods, juices and premium tea bag manufacturing.
              R&amp;D support, packaging and logistics &mdash; sorted.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/pages/contact" variant="brand" size="lg">
                Private Label Now
              </Button>
              <Button href="#need-help" variant="secondary" size="lg">
                Get a Quote
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {HERO_TRUST_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="type-mono-meta bg-paper-2 text-ink-soft rounded-full px-3 py-1"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Media column */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-4/3 overflow-hidden rounded-xl">
              <Image
                src={HERO_IMAGE_SRC}
                alt="Teavision blends and tea bags hero"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                preload
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={HERO_GRID_IMAGE_1_SRC}
                  alt="Custom blend lab and botanicals"
                  fill
                  sizes="(max-width: 1024px) 33vw, 17vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={HERO_GRID_IMAGE_2_SRC}
                  alt="Tea bag manufacturing"
                  fill
                  sizes="(max-width: 1024px) 33vw, 17vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={HERO_GRID_IMAGE_3_SRC}
                  alt="Variety of sachets and packs"
                  fill
                  sizes="(max-width: 1024px) 33vw, 17vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
