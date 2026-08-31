import { Section } from '@/components/ui/section'

import { CERT_SPANS } from '../_lib/data'

export function CertsStrip() {
  return (
    <Section.Root tone="brand" spacing="compact">
      <Section.Container>
        <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2">
          {CERT_SPANS.map((span) => (
            <span key={span} className="type-mono-meta text-paper/90">
              {span}
            </span>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
