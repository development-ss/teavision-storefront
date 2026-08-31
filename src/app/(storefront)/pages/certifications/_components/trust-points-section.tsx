import { Shield, Trophy, Users, type LucideIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

import { TRUST_POINTS } from '../_lib/data'

const ICON_MAP: Record<(typeof TRUST_POINTS)[number]['icon'], LucideIcon> = {
  shield: Shield,
  trophy: Trophy,
  users: Users,
}

export function TrustPointsSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <ul className="grid gap-5 md:grid-cols-3" role="list">
          {TRUST_POINTS.map((point) => {
            const Icon = ICON_MAP[point.icon]

            return (
              <Card
                as="li"
                key={point.title}
                padding="lg"
                radius="lg"
                className="h-full text-center"
              >
                <div className="bg-brand-tint text-brand mx-auto flex size-16 items-center justify-center rounded-full">
                  <Icon aria-hidden="true" className="size-8" />
                </div>
                <div className="mt-5">
                  <Badge
                    variant={point.icon === 'trophy' ? 'gold' : 'organic'}
                    label={point.icon === 'trophy' ? 'Awarded' : 'Certified'}
                  />
                </div>
                <h3 className="type-heading-05 text-ink mt-4">{point.title}</h3>
                <p className="type-body-sm text-ink-soft mt-3">
                  {point.description}
                </p>
              </Card>
            )
          })}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
