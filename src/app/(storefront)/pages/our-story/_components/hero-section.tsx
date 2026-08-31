import Image from 'next/image'
import { ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { HERO_IMAGE } from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root
      tone="brand"
      className="border-paper/20 relative isolate min-h-136 overflow-hidden border-b md:min-h-164"
    >
      <Image
        src={HERO_IMAGE.src}
        alt={HERO_IMAGE.alt}
        fill
        sizes="100vw"
        preload
        className="absolute inset-0 -z-20 object-cover"
      />
      <div aria-hidden="true" className="bg-ink/55 absolute inset-0 -z-10" />
      <Section.Container>
        <div className="max-w-4xl">
          <Eyebrow tone="gold">Mindfulness · Sincerity · Wholesomeness</Eyebrow>
          <h1 className="type-display text-paper mt-5 max-w-[16ch] text-balance">
            Our <span className="text-gold">Tea Story</span> <br /> Since 2014
          </h1>
          <p className="type-lede text-paper/85 mt-6 max-w-[54ch]">
            Founded in Melbourne by Lucas and Belinda, Teavision combines
            passion for healthy living with the power of tea. From a small
            venture, we&apos;ve grown into one of Australia&apos;s leading
            wholesale tea and herb suppliers, trusted by over 2,000 global
            businesses seeking premium bulk tea bags and certified organic herbs
            and spices.
          </p>
          <div className="mt-8">
            <Button href="#our-team" variant="inverse" size="cta">
              Discover our Story
              <ArrowDown className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
