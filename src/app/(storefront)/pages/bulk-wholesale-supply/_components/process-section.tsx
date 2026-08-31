import { Section } from '@/components/ui/section'

import { PROCESS_STEPS } from '../_lib/data'

export function ProcessSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <Section.Intro align="left" title="How It Works" className="mb-10" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="border-hairline bg-paper flex flex-col gap-3 rounded-xl border p-6"
            >
              <span className="type-mono-meta text-brand font-bold">
                {String(step.number).padStart(2, '0')}
              </span>
              <h3 className="type-label text-ink font-semibold">
                {step.title}
              </h3>
              <p className="type-body-sm text-ink-soft">{step.description}</p>
            </div>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
