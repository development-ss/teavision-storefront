import { describe, expect, test } from 'vitest'

import {
  buildContentSecurityPolicy,
  contentSecurityPolicyReportOnlyHeaderName,
  securityHeaders,
} from './headers'

describe('security headers', () => {
  test('exports the approved response header set', () => {
    expect(securityHeaders).toEqual([
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: contentSecurityPolicyReportOnlyHeaderName,
        value: buildContentSecurityPolicy(),
      },
    ])
  })

  test('keeps content security policy in report-only mode', () => {
    expect(contentSecurityPolicyReportOnlyHeaderName).toBe(
      'Content-Security-Policy-Report-Only',
    )
    expect(securityHeaders.map((header) => header.key)).not.toContain(
      'Content-Security-Policy',
    )
    // upgrade-insecure-requests is ignored in report-only mode (browsers log a
    // console error), so it must stay out while the policy is report-only.
    expect(buildContentSecurityPolicy({})).not.toContain(
      'upgrade-insecure-requests',
    )
  })

  test('builds the approved content security policy directives', () => {
    expect(buildContentSecurityPolicy({})).toBe(
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "script-src 'self' 'unsafe-inline' https://searchserverapi.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data: https://cdn.shopify.com https://www.teavision.com.au https://cdn.sanity.io https://searchserverapi.com https://searchserverapi1.com",
        "font-src 'self' data:",
        "connect-src 'self' https://searchserverapi1.com https://api.trustoo.io https://*.myshopify.com https://*.shopify.com",
        "frame-src 'self' https://maps.google.com",
        "media-src 'self'",
        "manifest-src 'self'",
      ].join('; '),
    )
  })

  test('does not include newlines or speculative third-party hosts', () => {
    const contentSecurityPolicy = buildContentSecurityPolicy({})

    expect(contentSecurityPolicy).not.toMatch(/\r|\n/)
    expect(contentSecurityPolicy).not.toContain('googletagmanager.com')
    expect(contentSecurityPolicy).not.toContain('google-analytics.com')
    expect(contentSecurityPolicy).not.toContain('facebook.net')
    expect(contentSecurityPolicy).not.toContain('klaviyo')
    expect(contentSecurityPolicy).not.toContain(
      'cdn.shopify.com/s/shopify-pixels',
    )
  })

  test('adds GA4 hosts only when a measurement ID is configured', () => {
    const contentSecurityPolicy = buildContentSecurityPolicy({
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEAVISION',
    })

    expect(contentSecurityPolicy).toContain('googletagmanager.com')
    expect(contentSecurityPolicy).toContain('google-analytics.com')
    expect(contentSecurityPolicy).not.toContain('facebook.net')
    expect(contentSecurityPolicy).not.toContain('klaviyo')
  })

  test('adds GTM hosts only when a container ID is configured', () => {
    const contentSecurityPolicy = buildContentSecurityPolicy({
      NEXT_PUBLIC_GTM_CONTAINER_ID: 'GTM-TEAVISION',
    })

    expect(contentSecurityPolicy).toContain('googletagmanager.com')
    expect(contentSecurityPolicy).toContain('google-analytics.com')
    expect(contentSecurityPolicy).not.toContain('facebook.net')
    expect(contentSecurityPolicy).not.toContain('klaviyo')
  })
})
