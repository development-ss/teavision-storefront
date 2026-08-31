import { Section } from '@/components/ui/section'

import { PROCESS_STEPS } from '../_lib/data'

export function ProcessSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <Section.Intro
          align="left"
          title="From brief to shelf in 5 steps"
          variant="compact"
          className="mb-10 max-w-none"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {PROCESS_STEPS.map((step) => (
            <div
              key={step.number}
              className="border-hairline bg-paper flex flex-col gap-3 rounded-xl border p-6"
            >
              <span className="bg-brand text-paper grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold">
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
