/**
 * The last real content change for each app-owned page in the sitemap.
 *
 * Google only trusts sitemap dates that are accurate, so these are picked by
 * hand from the git history: changes to words, images, forms or structured
 * data count; markup, performance, import and share-image changes do not.
 * When you change what a page says or shows, update its date here (TKT-03324).
 *
 * A page with no date here is listed without a date rather than a made-up one.
 * The sitemap test fails if a sitemap page is missing from this list.
 */
export const STATIC_PAGE_LAST_MODIFIED: Readonly<Record<string, string>> = {
  '/': '2026-10-28',
  '/pages/services': '2026-10-02',
  '/pages/wholesale': '2026-09-01',
  '/pages/wholesale-account-request': '2026-06-25',
  '/pages/our-story': '2026-11-12',
  '/pages/contact': '2026-11-12',
  '/pages/bulk-wholesale-supply': '2026-11-12',
  '/pages/custom-tea-blends': '2026-09-07',
  '/pages/faq': '2026-09-07',
  '/pages/private-label-packing': '2026-11-12',
  '/pages/tea-bag-manufacturer': '2026-10-28',
  '/pages/new-product-development-order-form': '2026-07-17',
  '/pages/privacy-policy': '2026-08-28',
  '/pages/shipping-policy': '2026-08-28',
  '/pages/refund-policy': '2026-08-28',
  '/pages/terms-of-service': '2026-08-28',
  '/pages/cookie-preferences': '2026-08-28',
}
