import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  sanitizeShopifyCollectionStoryHtml,
  sanitizeShopifyCompactHtml,
} from './html-content'

describe('sanitizeShopifyCompactHtml', () => {
  it('demotes imported H1 and H2 headings to compact H3 elements', () => {
    const html = sanitizeShopifyCompactHtml(
      '<h1>Imported product title</h1><h2>Imported section</h2><p>Body copy</p>',
    )

    expect(html).toContain(
      '<h3 class="type-heading-05 text-ink mt-5">Imported product title</h3>',
    )
    expect(html).toContain(
      '<h3 class="type-heading-05 text-ink mt-5">Imported section</h3>',
    )
    expect(html).not.toContain('<h1')
    expect(html).not.toContain('<h2')
  })
})

describe('sanitizeShopifyCollectionStoryHtml', () => {
  it('promotes collection story H3 and H4 headings with their existing visual styles', () => {
    const html = sanitizeShopifyCollectionStoryHtml(
      '<h1>Imported title</h1><h2>Imported section</h2><h3>Story section</h3><h4>Story detail</h4><h5>Deep detail</h5><h6>Fine detail</h6>',
    )

    expect(html).toContain(
      '<h3 class="type-heading-05 text-ink mt-5">Imported title</h3>',
    )
    expect(html).toContain(
      '<h3 class="type-heading-05 text-ink mt-5">Imported section</h3>',
    )
    expect(html).toContain(
      '<h2 class="type-heading-05 text-ink mt-5">Story section</h2>',
    )
    expect(html).toContain(
      '<h3 class="type-label text-ink mt-5">Story detail</h3>',
    )
    expect(html).toContain(
      '<h5 class="type-label text-ink mt-4">Deep detail</h5>',
    )
    expect(html).toContain(
      '<h6 class="type-label text-ink mt-4">Fine detail</h6>',
    )
  })
})
