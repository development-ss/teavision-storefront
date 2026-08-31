import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { PROCESS_STEPS } from '../_lib/data'

export function ProcessSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Eyebrow>Process</Eyebrow>
            <h2 className="type-heading-02 text-ink mt-3">
              From idea to shelf in six practical steps.
            </h2>
          </div>
          <Button href="#need-help" variant="secondary">
            Start a brief
          </Button>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          {PROCESS_STEPS.map((step, index) => (
            <Card as="li" key={step.title} padding="md" radius="lg">
              <span className="type-mono-meta bg-brand-tint text-brand flex size-9 items-center justify-center rounded-full">
                {index + 1}
              </span>
              <h3 className="type-heading-05 text-ink mt-5">{step.title}</h3>
              <p className="type-body-sm text-ink-soft mt-3">
                {step.description}
              </p>
            </Card>
          ))}
        </ol>
      </Section.Container>
    </Section.Root>
  )
}
