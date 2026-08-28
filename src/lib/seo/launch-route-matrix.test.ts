import { describe, expect, test } from 'vitest'

import { LEGAL_POLICIES, getPolicyRedirects } from '@/lib/legal/policies'

import {
  APP_OWNED_REDIRECT_EXPECTATIONS,
  LEGAL_ROUTE_EXPECTATIONS,
  POLICY_REDIRECT_ROUTE_EXPECTATIONS,
  REDIRECT_ROUTE_EXPECTATIONS,
  STATIC_LAUNCH_ROUTE_EXPECTATIONS,
  getLaunchSeoRouteExpectations,
} from './launch-route-matrix'

const REQUIRED_LEGAL_PATHS = [
  '/pages/privacy-policy',
  '/pages/shipping-policy',
  '/pages/refund-policy',
  '/pages/terms-of-service',
  '/pages/cookie-preferences',
]

const REQUIRED_STATIC_PATHS = [
  '/pages/bulk-wholesale-supply',
  '/pages/custom-tea-blends',
  '/pages/faq',
  '/pages/private-label-packing',
  '/pages/tea-bag-manufacturer',
  '/pages/new-product-development-order-form',
]

describe('launch SEO route matrix', () => {
  test('represents every legal policy registry entry', () => {
    const legalPaths = LEGAL_ROUTE_EXPECTATIONS.map(
      (expectation) => expectation.path,
    )

    expect(legalPaths).toEqual(LEGAL_POLICIES.map((policy) => policy.href))

    for (const path of REQUIRED_LEGAL_PATHS) {
      expect(legalPaths).toContain(path)
    }
  })

  test('marks legal routes as canonical sitemap pages', () => {
    for (const policy of LEGAL_POLICIES) {
      expect(LEGAL_ROUTE_EXPECTATIONS).toContainEqual({
        path: policy.href,
        expectedStatus: 200,
        canonicalPath: policy.href,
        shouldIndexWhenEnabled: policy.sitemap,
        shouldAppearInSitemap: policy.sitemap,
        checks: ['status', 'canonical', 'noindex', 'sitemap'],
      })
    }
  })

  test('contains launch static landing and service pages', () => {
    const staticPaths = STATIC_LAUNCH_ROUTE_EXPECTATIONS.map(
      (expectation) => expectation.path,
    )

    expect(staticPaths).toEqual(
      expect.arrayContaining([
        '/',
        '/search',
        '/pages/wholesale',
        '/pages/wholesale-account-request',
        '/pages/our-story',
        '/pages/contact',
        ...REQUIRED_STATIC_PATHS,
      ]),
    )
  })

  test('keeps search represented but non-indexable', () => {
    expect(STATIC_LAUNCH_ROUTE_EXPECTATIONS).toContainEqual({
      path: '/search',
      expectedStatus: 200,
      canonicalPath: '/search',
      shouldIndexWhenEnabled: false,
      shouldAppearInSitemap: false,
      checks: ['status', 'noindex'],
    })
  })

  test('represents every policy redirect source', () => {
    const expectedRedirects = getPolicyRedirects()

    expect(POLICY_REDIRECT_ROUTE_EXPECTATIONS).toHaveLength(
      expectedRedirects.length,
    )

    for (const redirect of expectedRedirects) {
      expect(POLICY_REDIRECT_ROUTE_EXPECTATIONS).toContainEqual({
        path: redirect.source,
        expectedStatus: 308,
        canonicalPath: redirect.destination,
        shouldIndexWhenEnabled: false,
        shouldAppearInSitemap: false,
        checks: ['status', 'redirect', 'canonical'],
      })
    }
  })

  test('represents app-owned product, utility, search, and blog redirects', () => {
    const redirects = [
      [
        '/collections/:handle/products/:productHandle',
        '/products/:productHandle',
      ],
      ['/pages/banner', '/'],
      ['/pages/search-results-page', '/search'],
      ['/pages/search-results', '/search'],
      ['/pages/test-page', '/'],
      ['/blogs/teavision-blogs', '/blog'],
      ['/blogs/journal', '/blog'],
      ['/blogs/journal/:path*', '/blogs/teavision-blogs/:path*'],
    ] as const

    for (const [path, canonicalPath] of redirects) {
      const expectation = {
        path,
        expectedStatus: 308,
        canonicalPath,
        shouldIndexWhenEnabled: false,
        shouldAppearInSitemap: false,
        checks: ['status', 'redirect', 'canonical'],
      }

      expect(APP_OWNED_REDIRECT_EXPECTATIONS).toContainEqual(expectation)
      expect(REDIRECT_ROUTE_EXPECTATIONS).toContainEqual(expectation)
    }
  })

  test('includes required legacy policy redirect aliases', () => {
    const redirectPaths = REDIRECT_ROUTE_EXPECTATIONS.map(
      (expectation) => expectation.path,
    )

    expect(redirectPaths).toEqual(
      expect.arrayContaining([
        '/policies/privacy-policy',
        '/policies/terms-of-service',
      ]),
    )
  })

  test('combines static, legal, and redirect expectations without duplicates', () => {
    const expectations = getLaunchSeoRouteExpectations()
    const paths = expectations.map((expectation) => expectation.path)

    expect(new Set(paths).size).toBe(paths.length)
    expect(expectations).toHaveLength(
      STATIC_LAUNCH_ROUTE_EXPECTATIONS.length +
        LEGAL_ROUTE_EXPECTATIONS.length +
        REDIRECT_ROUTE_EXPECTATIONS.length,
    )
  })
})
