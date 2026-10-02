import { ORGANIZATION_ID } from '@/lib/seo/homepage-json-ld'
import { serializeInlineJson } from '@/lib/seo/serialize-inline-json'
import { getSiteUrl } from '@/lib/seo/site-url'

import { SERVICES } from '../_lib/data'

const PAGE_PATH = '/pages/services'

// Only real services get Service markup. The catalogue and certification cards
// on this page are resources, not services.
const SERVICE_PATHS = new Set([
  '/pages/custom-tea-blends',
  '/pages/private-label-packing',
  '/pages/tea-bag-manufacturer',
  '/pages/bulk-wholesale-supply',
])

export function JsonLd() {
  const pageUrl = getSiteUrl(PAGE_PATH)
  const services = SERVICES.filter((service) => SERVICE_PATHS.has(service.href))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: getSiteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Services',
            item: pageUrl,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Teavision services',
        url: pageUrl,
        itemListElement: services.map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Service',
            serviceType: service.title,
            name: service.title,
            description: service.copy,
            url: getSiteUrl(service.href),
            provider: {
              '@type': 'Organization',
              '@id': ORGANIZATION_ID,
              name: 'Teavision',
            },
            areaServed: 'AU',
          },
        })),
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeInlineJson(jsonLd) }}
    />
  )
}
