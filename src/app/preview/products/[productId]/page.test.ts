import { describe, expect, test, vi } from 'vitest'

import { metadata } from './page'

vi.mock('server-only', () => ({}))

describe('product preview page metadata', () => {
  test('is explicitly hidden from crawlers and archives', () => {
    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
      noarchive: true,
    })
  })
})
