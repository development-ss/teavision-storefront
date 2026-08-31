import Image from 'next/image'
import { Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import {
  HERO_DESKTOP_IMAGE_SRC,
  HERO_MOBILE_POSTER_SRC,
  HERO_MOBILE_VIDEO_SRC,
} from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <Eyebrow>Bulk Imports • Containers • Volume Discounts</Eyebrow>
            <h1 className="type-heading-01 text-ink mt-4 max-w-[20ch] text-balance">
              Large-Scale Tea Imports to Australia - Delivered to Your Warehouse
            </h1>
            <p className="type-lede text-ink-soft mt-4 max-w-[52ch]">
              Import premium teas, herbs and botanicals at scale with Teavision.
              We source across 10+ countries, manage container freight to
              Melbourne, and pass through significant volume savings.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="tel:+611300729617" variant="secondary" size="lg">
                <Phone className="size-4" aria-hidden="true" />
                Call 1300 729 617
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl">
            {/* Desktop image */}
            <Image
              src={HERO_DESKTOP_IMAGE_SRC}
              alt="Bulk tea imports and container logistics"
              width={1500}
              height={1130}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="hidden w-full object-cover lg:block"
            />
            {/* Mobile video */}
            <video
              className="w-full object-cover lg:hidden"
              autoPlay
              loop
              muted
              playsInline
              poster={HERO_MOBILE_POSTER_SRC}
            >
              <source src={HERO_MOBILE_VIDEO_SRC} type="video/mp4" />
            </video>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
