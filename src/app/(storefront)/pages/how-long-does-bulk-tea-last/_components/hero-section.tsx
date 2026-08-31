import { Badge } from '@/components/ui/badge'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { HERO } from '../_lib/data'

export function HeroSection() {
  return (
    <Section.Root tone="brand">
      <Section.Container>
        <Eyebrow tone="gold">{HERO.eyebrow}</Eyebrow>
        <h1 className="type-display text-paper mt-5 max-w-[20ch] text-balance">
          {HERO.title}
        </h1>
        <p className="type-lede text-paper/85 mt-6 max-w-[60ch]">{HERO.lede}</p>
        <div className="mt-9 flex flex-wrap gap-2">
          {HERO.badges.map((badge) => (
            <Badge key={badge} variant="onDark" label={badge} />
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
