import { describe, expect, test } from 'vitest'

import { ADDRESS } from '@/app/(storefront)/pages/contact/_lib/page-data'

import { organizationJsonLd } from './homepage-json-ld'

describe('organizationJsonLd', () => {
  test('gives the full address shown on the contact page', () => {
    const { address } = organizationJsonLd

    expect(address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '29 Palladium Circuit',
      addressLocality: 'Clyde North',
      addressRegion: 'VIC',
      postalCode: '3978',
      addressCountry: 'AU',
    })
    expect(
      `${address.streetAddress}, ${address.addressLocality} ${address.addressRegion} ${address.postalCode}`,
    ).toBe(ADDRESS)
  })
})
