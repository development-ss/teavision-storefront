import { SITE_URL } from '@/lib/seo/site-url'

export const ORGANIZATION_ID = `${SITE_URL}/#organization`

// Rendered on every storefront page from the storefront layout. Values follow
// the SEO team's pre-migration schema brief.
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: 'Teavision',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/teavision.svg`,
  foundingDate: '2014',
  description:
    'Australian-owned tea company and wholesale supplier of loose leaf tea, tea bags, herbs, spices and superfood powders to cafes, retailers and wellness brands.',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'AU',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+61-1300-729-617',
    contactType: 'customer service',
    email: 'info@teavision.com.au',
    areaServed: 'AU',
  },
  sameAs: [
    'https://www.linkedin.com/company/teavision',
    'https://www.facebook.com/TeavisionAU/',
    'https://www.instagram.com/teavision_australia/',
  ],
  // Matches the claim shown on /pages/our-story and /pages/certifications.
  award: ['17+ industry awards, including 7 Gold Medals'],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'HACCP Food Safety Certification',
    },
    {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'ACO Certified Organic',
    },
  ],
}

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Teavision',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// Built from the FAQ items shown on the homepage so the schema always matches
// the visible questions and answers.
export type FaqJsonLdItem = {
  question: string
  answer: string
}

export function getHomepageFaqJsonLd(items: readonly FaqJsonLdItem[]) {
  if (items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
