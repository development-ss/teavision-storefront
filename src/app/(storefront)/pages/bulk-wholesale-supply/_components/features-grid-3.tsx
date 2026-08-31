import { Section } from '@/components/ui/section'

import { FEATURE_CARDS_3 } from '../_lib/data'

export function FeaturesGrid3() {
  return (
    <Section.Root tone="sunken" spacing="compact">
      <Section.Container>
        <div className="grid gap-6 sm:grid-cols-3">
          {FEATURE_CARDS_3.map((card) => (
            <div
              key={card.title}
              className="border-hairline bg-paper flex items-start gap-4 rounded-xl border p-6"
            >
              <span className="bg-ink text-paper grid size-11 shrink-0 place-items-center rounded-lg">
                <card.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="type-heading-05 text-ink">{card.title}</h3>
                <p className="type-body-sm text-ink-soft mt-1.5">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
