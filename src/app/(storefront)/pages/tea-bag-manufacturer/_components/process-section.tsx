import { Section } from '@/components/ui/section'

import { PROCESS_STEPS } from '../_lib/data'

export function ProcessSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <Section.Intro
          title="Simple 3-Step Process"
          copy="From concept to delivery, we make tea manufacturing simple"
          className="mb-12"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="border-hairline bg-paper flex flex-col items-center gap-3 rounded-xl border p-6 text-center"
            >
              <span className="bg-brand text-paper grid size-11 shrink-0 place-items-center rounded-full text-lg font-bold">
                {step.number}
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
