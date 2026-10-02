// Old Shopify URLs that 404 on the headless storefront, reported in the SEO
// team's post-migration review (received 28 September 2026). Each target was
// checked against the live Shopify catalogue on 2 October 2026: a product when
// an equivalent is published, otherwise the closest live collection or page.
// next.config.ts serves these as literal 301s, as the SEO team requested.
export type LegacyCatalogRedirect = {
  source: `/${string}`
  destination: `/${string}`
}

const SEO_REVIEW_REDIRECTS = [
  {
    source: '/pages/tea-packaging',
    destination: '/pages/private-label-packing',
  },
  {
    source: '/products/organic-moringa-leaf',
    destination: '/collections/moringa-leaves',
  },
  {
    source: '/products/organic-dark-roast-oolong',
    destination: '/collections/oolong-tea-wholesale',
  },
  {
    source: '/products/siberian-ginseng',
    destination: '/products/siberian-ginseng-tea',
  },
  {
    source: '/products/japan-matcha-conventional',
    destination: '/collections/japanese-matcha',
  },
  {
    source: '/products/organic-marshmallow-root',
    destination: '/products/marshmallow-root',
  },
  {
    source: '/products/raspberry-leaf-organic',
    destination: '/products/organic-raspberry-leaf',
  },
  {
    source: '/products/matcha-green-tea',
    destination: '/collections/matcha-tea',
  },
  {
    source: '/products/conventional-alfalfa-leaves-cut',
    destination: '/products/oganic-alfalfa-leaves',
  },
  {
    source: '/products/black-ceylon-tea-op1',
    destination: '/products/black-ceylon-tea-orangepekoe',
  },
  {
    source: '/products/organic-ceylon-cinnamon-powder',
    destination: '/products/organic-cinnamon-powder-ceylon',
  },
  {
    source: '/products/dandelion-root-organic',
    destination: '/products/organic-dandelion-root',
  },
] as const satisfies readonly LegacyCatalogRedirect[]

// URL redirects that the old Shopify Online Store served from its own redirect
// table (Shopify admin, URL redirects). The headless storefront never reads
// that table, so these old URLs showed "not found". Copied on 2 October 2026,
// keeping only rows whose old URL was broken on the live site and whose target
// was a live, indexable page. Chains are collapsed to the final page, and rows
// whose only target was the homepage or a missing page are left out.
const SHOPIFY_ADMIN_REDIRECTS = [
  {
    source: '/pages/test-lp-page',
    destination: '/pages/tea-bag-manufacturer',
  },
  {
    source: '/collections/the-best-australian-herbal-store',
    destination: '/collections/australian-herbal-store',
  },
  {
    source: '/collections/cacao-tea-shells',
    destination: '/collections/cocoa-tea-shells',
  },
  {
    source:
      '/blogs/teavision-blogs/the-benefits-of-moringa-tea-enhancing-health-and-sleep',
    destination: '/blogs/teavision-blogs/moringa-tea-benefits',
  },
  {
    source: '/collections/nettle-leaf',
    destination: '/collections/nettle-leaf-tea',
  },
  {
    source: '/collections/australian-grown-tea',
    destination: '/collections/australian-tea',
  },
  {
    source: '/collections/spearmint',
    destination: '/collections/spearmint-tea',
  },
  {
    source: '/collections/organic-digestive-tea',
    destination: '/collections/digestive-tea',
  },
  {
    source: '/collections/calendula-tea',
    destination: '/collections/calendula-flowers-petals-tea',
  },
  {
    source: '/collections/yerba-mate',
    destination: '/collections/yerba-mate-tea',
  },
  {
    source: '/collections/lemon-myrtle',
    destination: '/collections/lemon-myrtle-tea',
  },
  {
    source: '/collections/rose-tea',
    destination: '/collections/rose-bud-tea',
  },
  {
    source: '/collections/licorice-tea',
    destination: '/collections/licorice-root-tea',
  },
  {
    source: '/collections/peppermint',
    destination: '/collections/peppermint-tea',
  },
  {
    source: '/collections/dandelion-tea',
    destination: '/collections/dandelion-leaf-tea',
  },
  {
    source: '/collections/bulk-wholesale-chai',
    destination: '/collections/chai',
  },
  {
    source: '/collections/olive-leaf-wholesale',
    destination: '/collections/olive-leaf',
  },
  {
    source: '/collections/dandelion-leaf',
    destination: '/collections/dandelion-leaf-tea',
  },
  {
    source: '/collections/cardamom',
    destination: '/collections/cardamom-pods',
  },
  {
    source: '/collections/ceylon-black-tea',
    destination: '/collections/ceylon-tea',
  },
  {
    source: '/collections/keemun',
    destination: '/collections/keemun-tea',
  },
  {
    source: '/collections/ginseng',
    destination: '/collections/siberian-ginseng',
  },
  {
    source: '/collections/dandelion-root-roasted',
    destination: '/collections/dandelion-root',
  },
  {
    source: '/collections/chinese-tea-wholesale',
    destination: '/collections/chinese-tea',
  },
  {
    source: '/collections/loose-leaf-tea-suppliers',
    destination: '/collections/loose-leaf-tea',
  },
  {
    source: '/collections/japanese-matcha-tea',
    destination: '/collections/japanese-green-tea',
  },
  {
    source: '/products/copy-of-organic-tulsi-tea-1',
    destination: '/products/organic-tulsi-tea-1',
  },
  {
    source: '/pages/copy-of-pyramid-tea-bag-supplier',
    destination: '/pages/global-tea-supplier',
  },
  {
    source: '/pages/private-label',
    destination: '/pages/private-label-packing',
  },
  {
    source: '/collections/import-tea-herbs-australia',
    destination: '/pages/import-tea-herbs-australia',
  },
  {
    source: '/pages/herb-tea-importers',
    destination: '/pages/import-tea-herbs-australia',
  },
  {
    source: '/collections/iced-tea',
    destination: '/collections/wholesale-bulk-ice-tea-blends',
  },
  {
    source: '/products/organic-peppermint-tea',
    destination: '/collections/organic-wholesale-peppermint-tea',
  },
  {
    source: '/collections/organic-peppermint-tea',
    destination: '/collections/organic-wholesale-peppermint-tea',
  },
  {
    source: '/products/black-tea-extract',
    destination: '/collections/black-tea-extract',
  },
  {
    source: '/products/organic-rooibos-tea',
    destination: '/collections/organic-rooibos-tea',
  },
  {
    source: '/collections/organic-rooibos',
    destination: '/collections/organic-rooibos-tea',
  },
  {
    source: '/products/organic-turmeric-powder',
    destination: '/collections/organic-turmeric-powder',
  },
  {
    source:
      '/blogs/teavision-blogs/blending-functional-teas-with-naturopath-amy-castle',
    destination: '/blogs/teavision-blogs/blending-functional-teas-naturopath',
  },
  {
    source: '/tea-packaging',
    destination: '/pages/private-label-packing',
  },
  {
    source: '/wholesale-tea',
    destination: '/collections/wholesale-bulk-tea',
  },
  {
    source: '/wholesale-herbs-spices',
    destination: '/collections/herbs-and-spices',
  },
  {
    source: '/pages/brokers',
    destination: '/pages/tea-brokers',
  },
  {
    source:
      '/blogs/teavision-blogs/five-australian-tea-trends-for-business-owners-to-stay-across',
    destination: '/blogs/teavision-blogs/five-australian-tea-trends',
  },
  {
    source: '/blogs/tea-blog/113488005-why-organic-matters',
    destination: '/blogs/teavision-blogs/113488005-why-organic-matters',
  },
  {
    source: '/blogs/tea-blog/118372165-tea-grading-guide',
    destination: '/blogs/teavision-blogs/118372165-tea-grading-guide',
  },
  {
    source: '/blogs/tea-blog',
    destination: '/blog',
  },
  {
    source: '/products/organic-turmeric-powder-5',
    destination: '/collections/organic-turmeric-powder',
  },
  {
    source: '/pages/import',
    destination: '/pages/tea-importers-australia',
  },
  {
    source: '/collections/wholesale-tea/categories_organic-black-tea',
    destination: '/collections/wholesale-bulk-tea',
  },
  {
    source: '/collections/wholesale-tea/categories_pu-erh-tea',
    destination: '/collections/wholesale-bulk-tea',
  },
  {
    source: '/tea-blending',
    destination: '/collections/custom-tea-blends',
  },
  {
    source: '/collections/tea-blending',
    destination: '/collections/custom-tea-blends',
  },
  {
    source: '/pages/tea-packing',
    destination: '/pages/private-label-packing',
  },
  {
    source: '/collections/wholesale-tea',
    destination: '/collections/wholesale-bulk-tea',
  },
  {
    source: '/products/black-assam-3',
    destination: '/products/black-assam-op1',
  },
  {
    source: '/products/black-assam-1',
    destination: '/products/black-assam-fbop',
  },
  {
    source: '/collections/tea-ware',
    destination: '/collections/herbs-and-spices',
  },
  {
    source: '/pages/about-us',
    destination: '/pages/evolution',
  },
  {
    source: '/collections/frontpage',
    destination: '/collections/organic-tea',
  },
  {
    source: '/pages/mr-tea-wholesale-customers',
    destination: '/pages/wholesale',
  },
] as const satisfies readonly LegacyCatalogRedirect[]

export const LEGACY_CATALOG_REDIRECTS = [
  ...SEO_REVIEW_REDIRECTS,
  ...SHOPIFY_ADMIN_REDIRECTS,
] as const satisfies readonly LegacyCatalogRedirect[]
