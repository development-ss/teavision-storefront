import { Section } from '@/components/ui/section'

import { FAQ_HERO_SUBHEADING } from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root tone="brand">
      <Section.Container variant="base" className="text-center">
        <h1 className="type-display text-paper mx-auto max-w-[14ch] text-balance">
          Wholesale Tea Supplier FAQ
        </h1>
        <p className="type-lede text-paper/85 mx-auto mt-6 max-w-prose">
          {FAQ_HERO_SUBHEADING}
        </p>
      </Section.Container>
    </Section.Root>
  )
}
