import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import {
  LEGAL_POLICIES,
  getFooterLegalLinks,
  getPolicyRedirects,
  isLegalPolicyHandle,
} from './policies'

const CANONICAL_HREFS = [
  '/pages/privacy-policy',
  '/pages/shipping-policy',
  '/pages/refund-policy',
  '/pages/terms-of-service',
  '/pages/cookie-preferences',
]

const FOOTER_LABELS = [
  'Privacy Policy',
  'Shipping Policy',
  'Refund Policy',
  'Terms of Service',
  'Cookie Preferences',
]

function readLegalApprovalMatrix(): string {
  return readFileSync('docs/launch/legal-approval-matrix.md', 'utf8')
}

describe('legal policy registry', () => {
  test('contains the launch canonical policy hrefs', () => {
    expect(LEGAL_POLICIES.map((policy) => policy.href)).toEqual(CANONICAL_HREFS)
  })

  test('returns all footer legal labels from the registry', () => {
    expect(getFooterLegalLinks()).toEqual(
      FOOTER_LABELS.map((label, index) => ({
        href: CANONICAL_HREFS[index],
        label,
      })),
    )
  })

  test('keeps redirect sources unique', () => {
    const sources = getPolicyRedirects().map((redirect) => redirect.source)

    expect(new Set(sources).size).toBe(sources.length)
  })

  test('returns permanent legacy policy redirects', () => {
    expect(getPolicyRedirects()).toEqual(
      expect.arrayContaining([
        {
          source: '/policies/privacy-policy',
          destination: '/pages/privacy-policy',
          permanent: true,
        },
        {
          source: '/pages/terms-conditions',
          destination: '/pages/terms-of-service',
          permanent: true,
        },
        {
          source: '/terms-of-service',
          destination: '/pages/terms-of-service',
          permanent: true,
        },
        {
          source: '/policies/terms-of-service',
          destination: '/pages/terms-of-service',
          permanent: true,
        },
        {
          source: '/7868339/policies/privacy-policy.html',
          destination: '/pages/privacy-policy',
          permanent: true,
        },
      ]),
    )
  })

  test('narrows legal policy handles', () => {
    expect(isLegalPolicyHandle('privacy-policy')).toBe(true)
    expect(isLegalPolicyHandle('wholesale')).toBe(false)
  })

  test('keeps every registry policy represented in the approval matrix', () => {
    const matrix = readLegalApprovalMatrix()

    for (const policy of LEGAL_POLICIES) {
      expect(matrix).toContain(policy.href)
      expect(matrix).toContain(policy.lastReviewed)
    }
  })
})
