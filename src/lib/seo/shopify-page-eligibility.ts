// Shopify pages kept out of search: redirected or utility pages, the Trustoo
// reviews page (an app widget with no content of its own) and the
// app-generated privacy compliance pages.
const NON_INDEXABLE_SHOPIFY_PAGE_HANDLES = new Set([
  'appi-compliance',
  'banner',
  'gdpr-compliance',
  'pipeda-compliance',
  'reviews',
  'search-results',
  'search-results-page',
  'terms-conditions',
  'terms-conditions-1',
  'test-page',
  'us-laws-compliance',
])

export function isShopifyPageEligibleForSitemap(handle: string): boolean {
  return !NON_INDEXABLE_SHOPIFY_PAGE_HANDLES.has(handle)
}
