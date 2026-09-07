import { Award } from 'lucide-react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

const AWARDS = [
  '5 Gold Medals - Golden Leaf Awards (2018 & 2020)',
  '7 Silver Medals - Golden Leaf Awards (2020)',
  '2 Bronze Medals - Golden Leaf Awards (2020)',
  'Local Business Awards in the Mornington Peninsula region',
]

export function AwardsSection() {
  return (
    <Section.Root aria-labelledby="awards-heading">
      <Section.Container className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow>Industry recognition</Eyebrow>
          <h2 id="awards-heading" className="type-heading-01 mt-4">
            Award-Winning Excellence
          </h2>
          <p className="type-lede text-ink-soft mt-5">
            Our award-winning blends have earned us recognition across the
            industry:
          </p>
          <p className="type-body text-ink-soft mt-6 max-w-[60ch]">
            When you choose Teavision, you&apos;re embracing a partner who
            combines accredited quality, industry recognition, and unwavering
            integrity—for every cup you create and every package you share.
          </p>
        </div>
        <ul
          aria-label="Industry awards"
          className="divide-hairline border-hairline divide-y border-y"
        >
          {AWARDS.map((award) => (
            <li key={award} className="flex items-center gap-4 py-5">
              <Award
                aria-hidden="true"
                className="text-gold-deep size-7 shrink-0"
              />
              <span className="type-body text-ink font-medium">{award}</span>
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
