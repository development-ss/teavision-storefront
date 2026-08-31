import { AnimatedElement } from '@/components/ui/animated-element'
import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { SectionRootProps } from '@/components/ui/section'
import type { HomepageContent } from '@/lib/sanity/home-page'

export interface CtaProps {
  tone?: SectionRootProps['tone']
  intro: HomepageContent['catalogueCta']['intro']
  cta: HomepageContent['catalogueCta']['cta']
  secondaryCta?: HomepageContent['catalogueCta']['secondaryCta']
}

export function Cta({ tone, intro, cta, secondaryCta }: CtaProps) {
  return (
    <Section.Root tone={tone ?? 'brand'} className="overflow-hidden">
      <Section.Container>
        {/* Narrow motif tracks + negative margins (same as the other motif bands):
            images bleed past the content edge, the copy column gets wider */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,200px)_1fr_minmax(0,160px)]">
          <div className="flex justify-center lg:order-0 lg:-ml-18">
            <AnimatedElement
              animation="float-primary"
              src="/images/catalogue-cup.png"
              width={680}
              height={567}
              className="w-[clamp(184px,23vw,248px)]"
              sizes="(min-width: 1024px) 248px, 40vw"
            />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            {intro.eyebrow ? (
              <Eyebrow tone="gold" className="mb-4 justify-center">
                {intro.eyebrow}
              </Eyebrow>
            ) : null}
            <h2 className="type-heading-01 text-paper">{intro.title}</h2>
            {intro.copy ? (
              <p className="type-lede text-paper/75 mt-4">{intro.copy}</p>
            ) : null}

            {cta ? (
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button href={cta.href} variant="inverse" size="cta">
                  {cta.children}
                </Button>
                {secondaryCta ? (
                  <Button
                    href={secondaryCta.href}
                    variant="inverseSecondary"
                    size="cta"
                  >
                    {secondaryCta.children}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex justify-center lg:order-0 lg:-mr-20">
            <AnimatedElement
              animation="float-secondary"
              src="/images/catalogue-stamp.png"
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
