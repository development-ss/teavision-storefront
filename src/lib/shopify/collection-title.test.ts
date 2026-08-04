import { describe, expect, it } from 'vitest'

import { getCollectionDisplayTitle } from './collection-title'

describe('getCollectionDisplayTitle', () => {
  it('removes a trailing Shopify collection suffix', () => {
    expect(getCollectionDisplayTitle('Organic Tea Collection')).toBe(
      'Organic Tea',
    )
    expect(getCollectionDisplayTitle('Cocktail & Iced Tea collection')).toBe(
      'Cocktail & Iced Tea',
    )
  })

  it('preserves collection when it is not a trailing suffix', () => {
    expect(getCollectionDisplayTitle('Collection of Rare Teas')).toBe(
      'Collection of Rare Teas',
    )
  })
})
