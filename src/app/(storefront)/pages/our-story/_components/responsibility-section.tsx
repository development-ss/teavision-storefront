import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

import { RESPONSIBILITY_CARDS } from '../_lib/data'
import { SectionHeading } from './section-heading'
import { StoryImage } from './story-image'

export function ResponsibilitySection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow="Responsible sourcing"
          title="Corporate Social"
          highlight="Responsibility"
          copy="Our commitment extends beyond being premium wholesale tea suppliers — we're dedicated to ethical practices, environmental stewardship, and community wellbeing."
        />

        <ul className="grid gap-4 md:grid-cols-3" role="list">
          {RESPONSIBILITY_CARDS.map((card) => (
            <Card
              as="li"
              key={card.title}
              overflow="hidden"
              radius="lg"
              className="h-full"
            >
              <div className="aspect-video">
                <StoryImage
                  image={card.image}
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="type-heading-05 text-ink">{card.title}</h3>
                <p className="type-body-sm text-ink-soft mt-3">
                  {card.description}
                </p>
              </div>
            </Card>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
