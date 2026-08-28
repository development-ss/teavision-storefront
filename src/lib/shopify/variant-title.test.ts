import { describe, expect, it } from 'vitest'

import {
  getVariantDisplayTitle,
  isPlaceholderVariantTitle,
} from './variant-title'

describe('Shopify variant titles', () => {
  it.each(['Default Title', ' default title ', ''])(
    'uses a customer-facing pack label for %j',
    (title) => {
      expect(isPlaceholderVariantTitle(title)).toBe(true)
      expect(getVariantDisplayTitle(title)).toBe('Standard')
    },
  )

  it('preserves a real pack size and trims surrounding whitespace', () => {
    expect(isPlaceholderVariantTitle(' 250g box ')).toBe(false)
    expect(getVariantDisplayTitle(' 250g box ')).toBe('250g box')
  })
})
