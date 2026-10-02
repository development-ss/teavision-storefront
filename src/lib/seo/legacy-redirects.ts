// Old Shopify URLs that 404 on the headless storefront, reported in the SEO
// team's post-migration review (received 28 September 2026). Each target was
// checked against the live Shopify catalogue on 2 October 2026: a product when
// an equivalent is published, otherwise the closest live collection or page.
// next.config.ts serves these as literal 301s, as the SEO team requested.
export type LegacyCatalogRedirect = {
  source: `/${string}`
  destination: `/${string}`
}

export const LEGACY_CATALOG_REDIRECTS = [
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
