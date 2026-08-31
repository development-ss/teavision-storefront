import { HomepageNewsletterForm } from '@/components/homepage/newsletter/newsletter-form'
import { AnimatedElement } from '@/components/ui/animated-element'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import { sendNewsletterSignupFormAction } from '@/lib/contact/actions'

export function BlogNewsletterBand() {
  return (
    <Section.Root tone="inverse" className="overflow-hidden">
      <Section.Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,260px)_1fr_minmax(0,210px)]">
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
            <Eyebrow tone="gold" className="mb-4 justify-center">
              Monthly newsletter
            </Eyebrow>
            <h2 className="type-heading-01 text-paper">
              Explore the World of Tea with{' '}
              <em className="text-gold italic">Monthly Newsletters</em>
            </h2>
            <p className="type-lede text-paper/75 mx-auto mt-4 max-w-[52ch]">
              Market insights, brewing tips and the latest from trusted
              suppliers in Australia and beyond.
            </p>
            <div className="mt-7">
              <HomepageNewsletterForm action={sendNewsletterSignupFormAction} />
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
