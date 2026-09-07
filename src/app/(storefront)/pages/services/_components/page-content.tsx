import { ContactSection } from '@/components/contact/contact-section'
import type { ContactActionResult } from '@/lib/contact/types'

import { AwardsSection } from './awards-section'
import { HeroSection } from './hero-section'
import { OfferingsSection } from './offerings-section'
import { SupportSection } from './support-section'

type PageContentProps = {
  action: (formData: FormData) => Promise<ContactActionResult>
}

export function PageContent({ action }: PageContentProps) {
  return (
    <>
      <HeroSection />
      <OfferingsSection />
      <SupportSection />
      <AwardsSection />
      <ContactSection
        action={action}
        className="scroll-mt-32 md:scroll-mt-44"
        intro={{
          eyebrow: 'Need help?',
          title: 'Speak with our Ingredients Experts Today.',
          copy: '',
        }}
      />
    </>
  )
}
