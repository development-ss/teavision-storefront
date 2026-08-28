export type LegalPolicyStatus = 'pending_owner_legal_review' | 'approved'

export type LegalPolicyHandle =
  | 'privacy-policy'
  | 'shipping-policy'
  | 'refund-policy'
  | 'terms-of-service'
  | 'cookie-preferences'

export type LegalPolicyHref = `/pages/${LegalPolicyHandle}`

export type LegalPolicy = {
  handle: LegalPolicyHandle
  href: LegalPolicyHref
  title: string
  description: string
  status: LegalPolicyStatus
  lastReviewed: string
  includeInFooter: boolean
  sitemap: boolean
  redirectSources: readonly string[]
}

export type LegalPolicyLink = {
  href: LegalPolicy['href']
  label: string
}

export type LegalPolicyRedirect = {
  source: string
  destination: LegalPolicy['href']
  permanent: true
}

const LEGAL_POLICIES_BY_HANDLE = {
  'privacy-policy': {
    handle: 'privacy-policy',
    href: '/pages/privacy-policy',
    title: 'Privacy Policy',
    description:
      'Information about how Teavision collects, uses, stores, discloses, and protects customer and visitor information.',
    status: 'pending_owner_legal_review',
    lastReviewed: '2026-08-28',
    includeInFooter: true,
    sitemap: true,
    redirectSources: [
      '/policies/privacy-policy',
      '/7868339/policies/privacy-policy.html',
    ],
  },
  'shipping-policy': {
    handle: 'shipping-policy',
    href: '/pages/shipping-policy',
    title: 'Shipping Policy',
    description:
      'Information about Teavision delivery timeframes, courier delays, damaged or lost shipments, and PO Box restrictions.',
    status: 'pending_owner_legal_review',
    lastReviewed: '2026-08-28',
    includeInFooter: true,
    sitemap: true,
    redirectSources: [
      '/policies/shipping-policy',
      '/7868339/policies/shipping-policy.html',
    ],
  },
  'refund-policy': {
    handle: 'refund-policy',
    href: '/pages/refund-policy',
    title: 'Refund Policy',
    description:
      'Information about Teavision returns, credits, exchanges, product claims, quality assurance, and return shipping.',
    status: 'pending_owner_legal_review',
    lastReviewed: '2026-08-28',
    includeInFooter: true,
    sitemap: true,
    redirectSources: [
      '/policies/refund-policy',
      '/7868339/policies/refund-policy.html',
    ],
  },
  'terms-of-service': {
    handle: 'terms-of-service',
    href: '/pages/terms-of-service',
    title: 'Terms of Service',
    description:
      'Terms governing use of the Teavision website, online store, products, services, orders, accounts, and user submissions.',
    status: 'pending_owner_legal_review',
    lastReviewed: '2026-08-28',
    includeInFooter: true,
    sitemap: true,
    redirectSources: [
      '/pages/terms-conditions',
      '/terms-of-service',
      '/policies/terms-of-service',
      '/7868339/policies/terms-of-service.html',
    ],
  },
  'cookie-preferences': {
    handle: 'cookie-preferences',
    href: '/pages/cookie-preferences',
    title: 'Cookie Preferences',
    description:
      'Choose which optional cookies Teavision can use for analytics and marketing, and update your preferences at any time.',
    status: 'pending_owner_legal_review',
    lastReviewed: '2026-08-28',
    includeInFooter: true,
    sitemap: true,
    redirectSources: [],
  },
} satisfies Record<LegalPolicyHandle, LegalPolicy>

export const LEGAL_POLICIES = Object.values(LEGAL_POLICIES_BY_HANDLE)

export function getLegalPolicy(handle: LegalPolicyHandle): LegalPolicy {
  return LEGAL_POLICIES_BY_HANDLE[handle]
}

export function isLegalPolicyHandle(
  handle: string,
): handle is LegalPolicyHandle {
  return Object.hasOwn(LEGAL_POLICIES_BY_HANDLE, handle)
}

export function getFooterLegalLinks(): LegalPolicyLink[] {
  return LEGAL_POLICIES.filter((policy) => policy.includeInFooter).map(
    (policy) => ({
      href: policy.href,
      label: policy.title,
    }),
  )
}

export function getPolicyRedirects(): LegalPolicyRedirect[] {
  return LEGAL_POLICIES.flatMap((policy) =>
    policy.redirectSources.map((source) => ({
      source,
      destination: policy.href,
      permanent: true,
    })),
  )
}

export function getSitemapLegalPages(): LegalPolicy[] {
  return LEGAL_POLICIES.filter((policy) => policy.sitemap)
}
