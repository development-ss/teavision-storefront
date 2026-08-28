export type PageAction = {
  href: string
  label: string
}

export type PageLink = PageAction & {
  description: string
}

type ProofPoint = {
  term: string
  detail: string
}

export type PageProfile = {
  kicker: string
  supportTitle: string
  supportCopy: string
  primaryAction: PageAction
  secondaryAction: PageAction
  proofPoints: ProofPoint[]
  relatedLinks: PageLink[]
}

const POLICY_HANDLES = new Set([
  'terms-of-service',
  'refund-policy',
  'appi-compliance',
  'pipeda-compliance',
  'gdpr-compliance',
  'us-laws-compliance',
])

export function isPolicyPageHandle(handle: string): boolean {
  return POLICY_HANDLES.has(handle)
}

const SERVICE_HANDLES = new Set([
  'services',
  'custom-tea-blends',
  'private-label-packing',
  'bulk-wholesale-supply',
  'tea-bag-manufacturer',
  'pyramid-tea-bag-supplier',
  'tea-importers-australia',
  'tea-brokers',
  'global-tea-supplier',
  'tea-supplier-nz',
  'import-tea-herbs-australia',
])

const GUIDE_HANDLES = new Set([
  'faq',
  'wholesale-tea-supplier-faq',
  'how-to-store-bulk-tea',
  'how-long-does-bulk-tea-last',
  'australian-herbs-and-teas',
  'natural-sweeteners-australia',
])

const COMPANY_HANDLES = new Set([
  'our-story',
  'certifications',
  'reviews',
  'evolution',
])

const DEFAULT_PROFILE: PageProfile = {
  kicker: 'Teavision pages',
  supportTitle: 'Talk to a real team',
  supportCopy:
    'Use this page as a starting point, then bring the Teavision team into the supply conversation when you need detail.',
  primaryAction: {
    href: '/collections/all',
    label: 'Browse ingredients',
  },
  secondaryAction: {
    href: '/pages/contact',
    label: 'Speak with our team',
  },
  proofPoints: [
    {
      term: 'Wholesale focus',
      detail: 'Built for cafes, retailers, manufacturers, and wellness brands.',
    },
    {
      term: 'Broad range',
      detail:
        'Tea, herbs, spices, powders, extracts, and tea bags in one place.',
    },
    {
      term: 'Practical support',
      detail: 'Samples, catalogue guidance, and sourcing advice before scale.',
    },
  ],
  relatedLinks: [
    {
      href: '/pages/services',
      label: 'Services',
      description: 'See the main wholesale supply capabilities.',
    },
    {
      href: '/pages/custom-tea-blends',
      label: 'Custom tea blends',
      description: 'Plan blends, flavour direction, and commercial supply.',
    },
    {
      href: '/pages/download-catalogues',
      label: 'Download catalogues',
      description: 'Browse the range before making a shortlist.',
    },
  ],
}

const SERVICE_PROFILE: PageProfile = {
  ...DEFAULT_PROFILE,
  kicker: 'Wholesale services',
  supportTitle: 'Build the brief before the quote',
  supportCopy:
    'Commercial supply works best when product type, pack size, certification, and launch timing are clear.',
  primaryAction: {
    href: '/pages/contact',
    label: 'Discuss this service',
  },
  secondaryAction: {
    href: '/pages/contact',
    label: 'Speak with our team',
  },
  proofPoints: [
    {
      term: 'Commercial scale',
      detail: 'Bulk supply, blends, tea bags, and packing for repeat ordering.',
    },
    {
      term: 'Range depth',
      detail:
        'Ingredient options across organic, functional, native, and cafe use.',
    },
    {
      term: 'Buyer-ready details',
      detail: 'Help with samples, certifications, pack sizes, and lead times.',
    },
  ],
  relatedLinks: [
    {
      href: '/pages/custom-tea-blends',
      label: 'Custom tea blends',
      description: 'Create a blend for retail, cafe, or wellness channels.',
    },
    {
      href: '/pages/private-label-packing',
      label: 'Private label packing',
      description: 'Prepare packed product for your own brand.',
    },
    {
      href: '/pages/tea-bag-manufacturer',
      label: 'Tea bag manufacture',
      description: 'Explore pyramid and commercial tea bag options.',
    },
  ],
}

const POLICY_PROFILE: PageProfile = {
  ...DEFAULT_PROFILE,
  kicker: 'Policy',
  supportTitle: 'Clear terms for commercial buying',
  supportCopy:
    'Policies are here to remove ambiguity before orders, account setup, or compliance review.',
  primaryAction: {
    href: '/pages/contact',
    label: 'Ask about this policy',
  },
  secondaryAction: {
    href: '/pages/terms-of-service',
    label: 'View terms',
  },
  proofPoints: [
    {
      term: 'Current reference',
      detail: 'Use the modified date to confirm the page version in review.',
    },
    {
      term: 'Commercial clarity',
      detail:
        'Policies support ordering, returns, privacy, and compliance checks.',
    },
    {
      term: 'Human follow-up',
      detail: 'The team can clarify how a policy applies to your order.',
    },
  ],
  relatedLinks: [
    {
      href: '/pages/terms-of-service',
      label: 'Terms of Service',
      description: 'Commercial account and order terms.',
    },
    {
      href: '/pages/refund-policy',
      label: 'Refund policy',
      description: 'Review returns and refund expectations.',
    },
    {
      href: '/pages/contact',
      label: 'Contact',
      description: 'Ask for clarification before ordering.',
    },
  ],
}

const GUIDE_PROFILE: PageProfile = {
  ...DEFAULT_PROFILE,
  kicker: 'Buyer guide',
  supportTitle: 'Use the guide to narrow the brief',
  supportCopy:
    'These pages help buyers make practical choices about storage, shelf life, ingredients, and wholesale supply.',
  primaryAction: {
    href: '/pages/download-catalogues',
    label: 'Download catalogues',
  },
  secondaryAction: {
    href: '/pages/contact',
    label: 'Ask an expert',
  },
  proofPoints: [
    {
      term: 'Operational detail',
      detail: 'Focused on buying, storing, handling, and scaling ingredients.',
    },
    {
      term: 'Wholesale context',
      detail: 'Written for repeated commercial use rather than one-off retail.',
    },
    {
      term: 'Next step ready',
      detail: 'Pair the guidance with samples, catalogues, and team advice.',
    },
  ],
  relatedLinks: [
    {
      href: '/pages/wholesale-tea-supplier-faq',
      label: 'Wholesale supplier FAQ',
      description: 'Common wholesale ordering and supply questions.',
    },
    {
      href: '/pages/how-to-store-bulk-tea',
      label: 'How to store bulk tea',
      description: 'Protect freshness in commercial storage.',
    },
    {
      href: '/pages/how-long-does-bulk-tea-last',
      label: 'Bulk tea shelf life',
      description: 'Plan stock rotation and freshness expectations.',
    },
  ],
}

const COMPANY_PROFILE: PageProfile = {
  ...DEFAULT_PROFILE,
  kicker: 'Company',
  supportTitle: 'Credibility buyers can pass on',
  supportCopy:
    'These pages help procurement teams understand the business behind the catalogue.',
  primaryAction: {
    href: '/collections/all',
    label: 'Browse ingredients',
  },
  secondaryAction: {
    href: '/pages/contact',
    label: 'Talk to Teavision',
  },
  proofPoints: [
    {
      term: 'Established supplier',
      detail: 'Founded in 2014 and built around commercial tea supply.',
    },
    {
      term: 'Certification signal',
      detail: 'Compliance and certification details support buyer confidence.',
    },
    {
      term: 'Buyer evidence',
      detail: 'Reviews, story, and service pages help validate fit.',
    },
  ],
  relatedLinks: [
    {
      href: '/pages/our-story',
      label: 'Our story',
      description: 'Understand the business behind the range.',
    },
    {
      href: '/pages/certifications',
      label: 'Certifications',
      description: 'Review trust and compliance signals.',
    },
    {
      href: '/pages/reviews',
      label: 'Reviews',
      description: 'See buyer feedback and reputation signals.',
    },
  ],
}

const PAGE_PROFILE_OVERRIDES: Record<string, Partial<PageProfile>> = {
  'download-catalogues': {
    kicker: 'Catalogues',
    supportTitle: 'Turn the range into a shortlist',
    primaryAction: {
      href: '/pages/contact',
      label: 'Request catalogue help',
    },
  },
  'wholesale-account-request': {
    kicker: 'Wholesale access',
    supportTitle: 'Start the trade relationship',
    primaryAction: {
      href: '/collections/all',
      label: 'Browse ingredients',
    },
    secondaryAction: {
      href: '/pages/contact',
      label: 'Speak with our team',
    },
  },
  'new-product-development-order-form': {
    kicker: 'Product development',
    supportTitle: 'Make the product brief concrete',
    primaryAction: {
      href: '/pages/contact',
      label: 'Discuss product development',
    },
  },
  'search-results': {
    kicker: 'Search utility',
    supportTitle: 'Find the right product path',
    primaryAction: {
      href: '/search',
      label: 'Open site search',
    },
  },
  'search-results-page': {
    kicker: 'Search utility',
    supportTitle: 'Find the right product path',
    primaryAction: {
      href: '/search',
      label: 'Open site search',
    },
  },
}

function baseProfileForHandle(handle: string): PageProfile {
  if (POLICY_HANDLES.has(handle)) return POLICY_PROFILE
  if (SERVICE_HANDLES.has(handle)) return SERVICE_PROFILE
  if (GUIDE_HANDLES.has(handle)) return GUIDE_PROFILE
  if (COMPANY_HANDLES.has(handle)) return COMPANY_PROFILE

  return DEFAULT_PROFILE
}

export function resolvePageProfile(handle: string): PageProfile {
  const baseProfile = baseProfileForHandle(handle)
  const override = PAGE_PROFILE_OVERRIDES[handle]

  if (!override) return baseProfile

  return {
    ...baseProfile,
    ...override,
    primaryAction: override.primaryAction ?? baseProfile.primaryAction,
    secondaryAction: override.secondaryAction ?? baseProfile.secondaryAction,
    proofPoints: override.proofPoints ?? baseProfile.proofPoints,
    relatedLinks: override.relatedLinks ?? baseProfile.relatedLinks,
  }
}
