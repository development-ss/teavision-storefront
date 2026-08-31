import { CheckCircle2 } from 'lucide-react'

import { Section } from '@/components/ui/section'

import { VALUE_POINTS } from '../_lib/data'

export function IntroSection() {
  return (
    <Section.Root tone="brand" spacing="compact">
      <Section.Container>
        <ul
          className="grid gap-3 md:grid-cols-3"
          role="list"
          aria-label="Custom tea blending service highlights"
        >
          {VALUE_POINTS.map((point) => (
            <li key={point} className="type-label flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
