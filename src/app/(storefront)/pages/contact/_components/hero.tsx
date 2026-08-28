import { Badge, Eyebrow, Section } from '@/components/ui'

import { SUPPLY_CUES } from '../_lib/page-data'
import { Breadcrumb } from './breadcrumb'
import { LocationMap } from './location-map'

export function Hero() {
  return (
    <Section.Root tone="surface" spacing="compact">
      <Section.Container>
        <Breadcrumb />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] lg:items-stretch">
          <div className="flex flex-col justify-center">
            <Eyebrow>Teavision procurement desk</Eyebrow>
            <h1 className="type-display text-brand-deep mt-5 max-w-[16ch] text-balance">
              Let&rsquo;s talk supply.
            </h1>
            <p className="type-lede text-ink-soft mt-6 max-w-[54ch]">
              Speak with the team behind wholesale tea, herbs, spices, custom
              blending, and private label supply for Australian food and
              beverage businesses.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3" role="list">
              {SUPPLY_CUES.map((cue) => (
                <li key={cue}>
                  <Badge variant="gold" label={cue} />
                </li>
              ))}
            </ul>
          </div>

          <LocationMap />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
