import { CheckCircle2 } from 'lucide-react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

const BENEFITS = [
  {
    title: 'Seamless Integration',
    copy: 'Need blending, packing, and shipping? We coordinate everything under one roof.',
  },
  {
    title: 'Expert Support',
    copy: 'Our team is here to guide you through every step—from blend development to delivery.',
  },
  {
    title: 'Quality Assured',
    copy: 'Rigorous testing and certifications ensure every batch meets the highest standards.',
  },
  {
    title: 'Flexible Solutions',
    copy: 'From small runs to large-scale production, we adapt to your business needs.',
  },
]

export function SupportSection() {
  return (
    <Section.Root tone="brand" aria-labelledby="support-heading">
      <Section.Container className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <Eyebrow tone="gold">Your supply partner</Eyebrow>
          <h2
            id="support-heading"
            className="type-heading-01 text-paper mt-4 text-balance"
          >
            Why Teavision Stands Apart
          </h2>
          <p className="type-lede text-paper/85 mt-5">
            What sets us apart in the Australian tea industry.
          </p>
        </div>
        <dl className="grid gap-8 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title}>
              <CheckCircle2
                aria-hidden="true"
                className="text-gold mb-4 size-6"
              />
              <dt className="type-heading-04 text-paper">{benefit.title}</dt>
              <dd className="type-body text-paper/85 mt-3">{benefit.copy}</dd>
            </div>
          ))}
        </dl>
      </Section.Container>
    </Section.Root>
  )
}
