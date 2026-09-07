import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { INTRO } from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root aria-labelledby="services-heading">
      <Section.Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Eyebrow>Teavision Services</Eyebrow>
          <h1
            id="services-heading"
            className="type-heading-01 text-ink mt-4 text-balance"
          >
            Our Core <span className="text-brand">Services</span>
          </h1>
          <p className="type-lede text-ink-soft mt-5 max-w-[52ch]">{INTRO}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#need-help" variant="brand" size="lg">
              Talk to our experts
              <ArrowRight aria-hidden="true" className="size-4" />
            </Button>
            <Button href="#core-services" variant="secondary" size="lg">
              Explore our services
            </Button>
          </div>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-xl">
          <Image
            src="/images/our-story/our-story-awards.webp"
            alt="Teavision warehouse with bulk ingredients, packing stations and production equipment"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            preload
          />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
