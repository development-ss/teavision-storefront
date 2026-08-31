import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

export function HeroSection() {
  return (
    <Section.Root tone="brand" className="relative isolate overflow-hidden">
      <Image
        src="/images/homepage-hero.jpg"
        alt=""
        fill
        sizes="100vw"
        preload
        className="absolute inset-0 -z-20 object-cover"
      />
      <div aria-hidden="true" className="bg-ink/50 absolute inset-0 -z-10" />
      <Section.Container>
        <div className="max-w-4xl">
          <Eyebrow tone="gold">Certified quality</Eyebrow>
          <h1 className="type-display text-paper mt-5 max-w-[16ch] text-balance">
            Certified Organic. Globally Sourced. Quality Assured
          </h1>
          <p className="type-lede text-paper/85 mt-6 max-w-[54ch]">
            From organic accreditation to food safety standards, our
            certifications back every product we make. We pair rigorous quality
            systems with world-class ingredients to deliver award-winning teas.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge variant="onDark" label="ACO certified" />
            <Badge variant="onDark" label="USDA organic" />
            <Badge variant="onDark" label="Quality assured" />
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
