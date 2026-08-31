import { AnimatedElement } from '@/components/ui/animated-element'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { HomepageContent } from '@/lib/sanity/home-page'

import { SUPPLY_CHAIN_FIXTURE } from '../content'

export type SupplyChainProps = {
  cta?: HomepageContent['supplyChain']['cta']
  intro?: HomepageContent['supplyChain']['intro']
}

export function SupplyChain({
  cta = SUPPLY_CHAIN_FIXTURE.cta,
  intro = SUPPLY_CHAIN_FIXTURE.intro,
}: SupplyChainProps = {}) {
  return (
    <Section.Root tone="inverse" className="overflow-hidden">
      <Section.Container>
        {/* Narrow motif tracks + negative margins (same as newsletter band):
            images bleed past the content edge, the copy column gets wider */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,200px)_1fr_minmax(0,160px)]">
          <div className="flex justify-center lg:-ml-18">
            <AnimatedElement
              animation="float-primary"
              src="/images/business-handshake.png"
              width={678}
              height={594}
              className="w-[clamp(188px,23.5vw,252px)]"
              sizes="(min-width: 1024px) 252px, 40vw"
            />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            {intro.eyebrow && (
              <Eyebrow tone="gold" className="mb-4 justify-center">
                {intro.eyebrow}
              </Eyebrow>
            )}
            <h2 className="type-heading-01 text-paper">{intro.title}</h2>
            {intro.copy && (
              <p className="type-lede text-paper/75 mt-4">{intro.copy}</p>
            )}
            <div className="mt-7 flex justify-center">
              <Button href={cta.href} variant="inverse" size="cta">
                {cta.children}
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:-mr-20">
            <AnimatedElement
              animation="float-secondary"
              src="/images/business-stamp.png"
              width={562}
              height={567}
              className="w-[clamp(140px,14vw,200px)]"
              sizes="(min-width: 1024px) 200px, 30vw"
            />
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
