import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { FACTORS } from '../_lib/data'

export function FactorsSection() {
  return (
    <Section.Root tone="sunken" spacing="compact">
      <Section.Container>
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>{FACTORS.eyebrow}</Eyebrow>
            <h2 className="type-heading-02 text-ink mt-4 text-balance">
              {FACTORS.title}
            </h2>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <div className="type-body-lg text-ink-soft max-w-[68ch] space-y-4">
              {FACTORS.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <p className="type-body-lg text-ink mt-6 max-w-[68ch] font-medium">
              {FACTORS.bridge}
            </p>

            <dl className="border-hairline mt-10 border-t">
              {FACTORS.items.map((item) => (
                <div
                  key={item.label}
                  className="border-hairline grid gap-2 border-b py-6 md:grid-cols-[10rem_1fr] md:gap-10"
                >
                  <dt className="flex items-baseline gap-4">
                    <span className="type-mono-meta text-gold-deep">
                      {item.index}
                    </span>
                    <span className="type-heading-04 text-ink">
                      {item.label}
                    </span>
                  </dt>
                  <dd className="type-body-lg text-ink-soft">{item.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
