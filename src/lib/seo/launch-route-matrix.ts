import {
  LEGAL_POLICIES,
  getPolicyRedirects,
  type LegalPolicy,
} from '@/lib/legal/policies'

export type LaunchSeoRouteCheck =
  | 'canonical'
  | 'noindex'
  | 'redirect'
  | 'sitemap'
  | 'status'
  | 'structured-data'

export type LaunchSeoPath = '/' | `/${string}`

export type LaunchSeoRouteExpectation = {
  path: LaunchSeoPath
  expectedStatus: 200 | 308
  canonicalPath: LaunchSeoPath
  shouldIndexWhenEnabled: boolean
  shouldAppearInSitemap: boolean
  checks: readonly LaunchSeoRouteCheck[]
}

const INDEXABLE_PAGE_CHECKS = [
  'status',
  'canonical',
  'noindex',
  'sitemap',
] satisfies readonly LaunchSeoRouteCheck[]

const NON_INDEXABLE_PAGE_CHECKS = [
  'status',
  'noindex',
] satisfies readonly LaunchSeoRouteCheck[]

const REDIRECT_CHECKS = [
  'status',
  'redirect',
  'canonical',
] satisfies readonly LaunchSeoRouteCheck[]

function toLaunchSeoPath(path: string): LaunchSeoPath {
  if (!path.startsWith('/')) {
    throw new Error(`Launch SEO paths must be local absolute paths: ${path}`)
  }

  return path as LaunchSeoPath
}

function legalPolicyToExpectation(
  policy: LegalPolicy,
): LaunchSeoRouteExpectation {
  return {
    path: policy.href,
    expectedStatus: 200,
    canonicalPath: policy.href,
    shouldIndexWhenEnabled: policy.sitemap,
    shouldAppearInSitemap: policy.sitemap,
    checks: INDEXABLE_PAGE_CHECKS,
  }
}

export const LEGAL_ROUTE_EXPECTATIONS = LEGAL_POLICIES.map(
  legalPolicyToExpectation,
)

export const STATIC_LAUNCH_ROUTE_EXPECTATIONS = [
  {
    path: '/',
    expectedStatus: 200,
    canonicalPath: '/',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/search',
    expectedStatus: 200,
    canonicalPath: '/search',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: NON_INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/wholesale',
    expectedStatus: 200,
    canonicalPath: '/pages/wholesale',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/wholesale-account-request',
    expectedStatus: 200,
    canonicalPath: '/pages/wholesale-account-request',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/our-story',
    expectedStatus: 200,
    canonicalPath: '/pages/our-story',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/contact',
    expectedStatus: 200,
    canonicalPath: '/pages/contact',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/bulk-wholesale-supply',
    expectedStatus: 200,
    canonicalPath: '/pages/bulk-wholesale-supply',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/custom-tea-blends',
    expectedStatus: 200,
    canonicalPath: '/pages/custom-tea-blends',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/faq',
    expectedStatus: 200,
    canonicalPath: '/pages/faq',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/private-label-packing',
    expectedStatus: 200,
    canonicalPath: '/pages/private-label-packing',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/tea-bag-manufacturer',
    expectedStatus: 200,
    canonicalPath: '/pages/tea-bag-manufacturer',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
  {
    path: '/pages/new-product-development-order-form',
    expectedStatus: 200,
    canonicalPath: '/pages/new-product-development-order-form',
    shouldIndexWhenEnabled: true,
    shouldAppearInSitemap: true,
    checks: INDEXABLE_PAGE_CHECKS,
  },
] satisfies readonly LaunchSeoRouteExpectation[]

export const APP_OWNED_REDIRECT_EXPECTATIONS = [
  {
    path: '/collections/:handle/products/:productHandle',
    expectedStatus: 308,
    canonicalPath: '/products/:productHandle',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/pages/banner',
    expectedStatus: 308,
    canonicalPath: '/',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/pages/search-results-page',
    expectedStatus: 308,
    canonicalPath: '/search',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/pages/search-results',
    expectedStatus: 308,
    canonicalPath: '/search',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/pages/test-page',
    expectedStatus: 308,
    canonicalPath: '/',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/blogs/teavision-blogs',
    expectedStatus: 308,
    canonicalPath: '/blog',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/blogs/journal',
    expectedStatus: 308,
    canonicalPath: '/blog',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
  {
    path: '/blogs/journal/:path*',
    expectedStatus: 308,
    canonicalPath: '/blogs/teavision-blogs/:path*',
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  },
] satisfies readonly LaunchSeoRouteExpectation[]

export const POLICY_REDIRECT_ROUTE_EXPECTATIONS = getPolicyRedirects().map(
  (redirect): LaunchSeoRouteExpectation => ({
    path: toLaunchSeoPath(redirect.source),
    expectedStatus: 308,
    canonicalPath: redirect.destination,
    shouldIndexWhenEnabled: false,
    shouldAppearInSitemap: false,
    checks: REDIRECT_CHECKS,
  }),
)

export const REDIRECT_ROUTE_EXPECTATIONS = [
  ...APP_OWNED_REDIRECT_EXPECTATIONS,
  ...POLICY_REDIRECT_ROUTE_EXPECTATIONS,
] satisfies readonly LaunchSeoRouteExpectation[]

export function getLaunchSeoRouteExpectations(): LaunchSeoRouteExpectation[] {
  return [
    ...STATIC_LAUNCH_ROUTE_EXPECTATIONS,
    ...LEGAL_ROUTE_EXPECTATIONS,
    ...REDIRECT_ROUTE_EXPECTATIONS,
  ]
}
