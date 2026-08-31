import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { PREPARE } from '../_lib/data'

export function PrepareSection() {
  return (
    <Section.Root tone="surface" spacing="compact">
      <Section.Container>
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>{PREPARE.eyebrow}</Eyebrow>
            <h2 className="type-heading-02 text-ink mt-4 text-balance">
              {PREPARE.title}
            </h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <div className="type-body-lg text-ink-soft grid gap-x-12 gap-y-4 md:grid-cols-2">
              {PREPARE.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
