import { ContactSection } from '@/components/contact/contact-section'
import { Faq } from '@/components/homepage/faq'
import { submitContactFormAction } from '@/lib/contact/actions'
import { getServiceFaqs } from '@/lib/faq/content'

import { BlendDetailsSection } from './blend-details-section'
import { FlavourPicker } from './flavour-picker'
import { JsonLd } from './json-ld'
import { HeroSection } from './hero-section'
import { IntroSection } from './intro-section'
import { ProcessSection } from './process-section'
import { QualitySection } from './quality-section'

export function PageContent() {
  return (
    <>
      <JsonLd />
      <HeroSection />
      <IntroSection />
      <FlavourPicker />
      <BlendDetailsSection />
      <QualitySection />
      <ProcessSection />
      <ContactSection action={submitContactFormAction} />
      <Faq
        title="Custom Tea Blending FAQs"
        eyebrow={null}
        description={null}
        items={getServiceFaqs('custom-tea-blends')}
      />
    </>
  )
}
