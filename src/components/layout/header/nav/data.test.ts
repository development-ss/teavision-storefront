import { resolve } from 'node:path'

import sharp from 'sharp'
import { describe, expect, it } from 'vitest'

import {
  getShopKeyForPath,
  isNavLinkActive,
  isServicesPath,
  isShopPath,
  SERVICES_LINKS,
} from './data'

describe('header navigation active state', () => {
  it('keeps direct links active on their nested routes', () => {
    expect(
      isNavLinkActive('/blogs/tea-journal/article', '/blogs/tea-journal'),
    ).toBe(true)
    expect(isNavLinkActive('/pages/our-story', '/pages/our-story')).toBe(true)
    expect(isNavLinkActive('/pages/contact-us', '/pages/contact')).toBe(false)
  })

  it('marks collection and product routes as Shop', () => {
    expect(isShopPath('/collections/black-tea')).toBe(true)
    expect(isShopPath('/products/earl-grey')).toBe(true)
    expect(isShopPath('/pages/custom-tea-blends')).toBe(false)
  })

  it('selects the shop category containing the current link', () => {
    expect(
      getShopKeyForPath('/collections/tea-masters-selection-worlds-best-teas'),
    ).toBe('tea')
    expect(getShopKeyForPath('/collections/herbs-and-spices')).toBe(
      'herbs-spices',
    )
    expect(getShopKeyForPath('/pages/contact')).toBeUndefined()
  })

  it('marks only represented service routes as Services', () => {
    expect(isServicesPath('/pages/wholesale')).toBe(true)
    expect(isServicesPath('/pages/private-label-packing')).toBe(true)
    expect(isServicesPath('/pages/faq')).toBe(true)
    expect(isServicesPath('/pages/wholesale-account-request')).toBe(false)
    expect(isServicesPath('/pages/contact')).toBe(false)
  })
})

describe('service menu imagery', () => {
  it('provides a distinct, labeled image for each existing service destination', () => {
    expect(SERVICES_LINKS.map((service) => service.href)).toEqual([
      '/pages/custom-tea-blends',
      '/pages/private-label-packing',
      '/pages/tea-bag-manufacturer',
      '/pages/new-product-development-order-form',
      '/pages/bulk-wholesale-supply',
      '/pages/faq',
    ])
    expect(
      new Set(SERVICES_LINKS.map((service) => service.imageSrc)).size,
    ).toBe(6)
    for (const service of SERVICES_LINKS) {
      expect(service.imageAlt).not.toBe('')
      expect(service.imageLabel).not.toBe('')
    }
  })

  it.each(SERVICES_LINKS)(
    '$label has a square 1024px WebP asset',
    async (service) => {
      const metadata = await sharp(
        resolve('public', service.imageSrc.slice(1)),
      ).metadata()
      expect(metadata).toMatchObject({
        width: 1024,
        height: 1024,
        format: 'webp',
      })
    },
  )
})
