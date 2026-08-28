import {
  Globe2,
  Leaf,
  PackageCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

import { Card, Section } from '@/components/ui'

import { FEATURE_CARDS, type FeatureCard } from '../_lib/data'
import { SectionHeading } from './section-heading'

const ICONS: Record<FeatureCard['icon'], LucideIcon> = {
  blend: PackageCheck,
  globe: Globe2,
  leaf: Leaf,
  spark: Sparkles,
}

export function GrowthSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Wholesale tea house"
          title="From Small Venture to"
          highlight="Global Leader"
          copy="Discover how Teavision grew from a Melbourne startup to one of Australia's leading wholesale tea and herb suppliers, now trusted by over 2,000 businesses worldwide."
        />

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" role="list">
          {FEATURE_CARDS.map((card) => {
            const Icon = ICONS[card.icon]

            return (
              <Card
                as="li"
                key={card.title}
                padding="lg"
                radius="lg"
                tone="sunken"
                className="h-full"
              >
                <div className="bg-brand-tint text-brand flex size-12 items-center justify-center rounded-full">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="type-heading-05 text-ink mt-6">{card.title}</h3>
                <p className="type-body-sm text-ink-soft mt-3">
                  {card.description}
                </p>
              </Card>
            )
          })}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
