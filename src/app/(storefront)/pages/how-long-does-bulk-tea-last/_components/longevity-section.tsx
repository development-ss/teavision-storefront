import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { LONGEVITY } from '../_lib/data'

export function LongevitySection() {
  return (
    <Section.Root tone="surface" spacing="compact">
      <Section.Container>
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>{LONGEVITY.eyebrow}</Eyebrow>
            <h2 className="type-heading-02 text-ink mt-4 text-balance">
              {LONGEVITY.title}
            </h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <div className="type-body-lg text-ink-soft max-w-[68ch] space-y-4">
              {LONGEVITY.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="bg-brand-tint mt-8 flex max-w-[68ch] flex-wrap items-baseline gap-x-6 gap-y-1 rounded-xl px-7 py-5">
              <p className="text-brand-deep font-mono text-[2.75rem] leading-none">
                {LONGEVITY.statValue}
              </p>
              <div>
                <p className="type-label text-ink">{LONGEVITY.statUnit}</p>
                <p className="type-body-sm text-ink-soft">
                  {LONGEVITY.statLabel} · {LONGEVITY.statNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
