import { Check } from 'lucide-react'

import { Section } from '@/components/ui/section'

import { IMPORT_FEATURE_CARDS } from '../_lib/data'

export function ImportFeaturesSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <div className="mb-10 max-w-prose">
          <h2 className="type-heading-01 text-ink">
            What You Can Import With Us
          </h2>
          <p className="type-lede text-ink-soft mt-4">
            We source across a wide network to meet your price, quality and
            lead-time targets.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {IMPORT_FEATURE_CARDS.map((card) => (
            <div
              key={card.title}
              className="border-hairline bg-paper flex items-start gap-4 rounded-xl border p-6"
            >
              <span className="bg-brand text-paper mt-0.5 grid size-6 shrink-0 place-items-center rounded-full">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="type-label text-ink font-semibold">
                  {card.title}
                </h3>
                <p className="type-body-sm text-ink-soft mt-1">
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
