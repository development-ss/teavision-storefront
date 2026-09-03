import { describe, expect, it } from 'vitest'

import {
  getShopKeyForPath,
  isNavLinkActive,
  isServicesPath,
  isShopPath,
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
