const NON_INDEXABLE_SHOPIFY_PAGE_HANDLES = new Set([
  'banner',
  'search-results',
  'search-results-page',
  'terms-conditions',
  'terms-conditions-1',
  'test-page',
])

export function isShopifyPageEligibleForSitemap(handle: string): boolean {
  return !NON_INDEXABLE_SHOPIFY_PAGE_HANDLES.has(handle)
}
