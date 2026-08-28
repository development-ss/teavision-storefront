import { describe, expect, test } from 'vitest'

import { isShopifyPageEligibleForSitemap } from './shopify-page-eligibility'

describe('isShopifyPageEligibleForSitemap', () => {
  test.each([
    'banner',
    'search-results',
    'search-results-page',
    'terms-conditions',
    'terms-conditions-1',
    'test-page',
  ])('excludes the redirected or utility Shopify page %s', (handle) => {
    expect(isShopifyPageEligibleForSitemap(handle)).toBe(false)
  })

  test('keeps a normal Shopify content page eligible', () => {
    expect(isShopifyPageEligibleForSitemap('tea-supplier-nz')).toBe(true)
  })
})
