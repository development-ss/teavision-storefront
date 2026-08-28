import { CertificationCoverage, SupplyChain } from '@/components/homepage'
import { StatBand } from '@/components/ui'

import { CERTIFICATION_STATS } from '../_lib/data'
import { AwardExcellenceSection } from './award-excellence-section'
import { CtaSection } from './cta-section'
import { HeroSection } from './hero-section'
import { TrustPointsSection } from './trust-points-section'

export function PageContent() {
  return (
    <>
      <HeroSection />
      <StatBand
        aria-label="Teavision supplier credentials"
        items={CERTIFICATION_STATS}
      />
      <CertificationCoverage />
      <SupplyChain />
      <TrustPointsSection />
      <AwardExcellenceSection />
      <CtaSection />
    </>
  )
}
