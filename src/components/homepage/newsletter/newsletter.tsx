import { AnimatedElement } from '@/components/ui/animated-element'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { NewsletterSignupActionResult } from '@/lib/contact/types'
import type { HomepageContent } from '@/lib/sanity/home-page'

import { HomepageNewsletterForm } from './newsletter-form'

export type HomepageNewsletterProps = {
  intro: HomepageContent['newsletter']['intro']
  action: (
    previousState: NewsletterSignupActionResult,
    formData: FormData,
  ) => Promise<NewsletterSignupActionResult> | NewsletterSignupActionResult
}

export function HomepageNewsletter({ action, intro }: HomepageNewsletterProps) {
  return (
    <Section.Root tone="inverse" className="overflow-hidden">
      <Section.Container>
        {/* Narrow motif tracks + negative margins: images keep their size and
            drift slightly past the container edge, giving the copy more width */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,200px)_1fr_minmax(0,160px)]">
          <div className="flex justify-center lg:-ml-18">
            <AnimatedElement
              animation="float-primary"
              src="/images/newsletter-teapot.png"
              width={530}
              height={378}
              className="w-[clamp(200px,25vw,268px)]"
              sizes="(min-width: 1024px) 268px, 40vw"
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
            <div className="flex justify-center">
              <HomepageNewsletterForm action={action} />
            </div>
          </div>

          <div className="flex justify-center lg:-mr-20">
            <AnimatedElement
              animation="float-secondary"
              src="/images/newsletter-label.png"
              width={376}
              height={378}
              className="w-[clamp(140px,14vw,200px)]"
              sizes="(min-width: 1024px) 200px, 30vw"
            />
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
