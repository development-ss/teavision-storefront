import type { Metadata } from 'next'
import { describe, expect, test, vi } from 'vitest'

import { metadata as bulkMetadata } from './bulk-wholesale-supply/page'
import { metadata as contactMetadata } from './contact/page'
import { metadata as ourStoryMetadata } from './our-story/page'
import { metadata as privateLabelMetadata } from './private-label-packing/page'

vi.mock('server-only', () => ({}))

function getAbsoluteTitle(metadata: Metadata): string | undefined {
  const { title } = metadata

  return title && typeof title === 'object' && 'absolute' in title
    ? title.absolute
    : undefined
}

// These pages set their own full title, so each one must name the brand and
// say what the page is about, not just "Contact" (TKT-03324).
describe.each([
  ['Contact', contactMetadata, 'Contact Teavision | Wholesale Tea Enquiries'],
  [
    'Our Story',
    ourStoryMetadata,
    'Our Story: Melbourne Tea Supplier Since 2014 | Teavision',
  ],
  [
    'Private Label Packing',
    privateLabelMetadata,
    'Private Label Tea Packing Australia | Teavision',
  ],
  [
    'Bulk Wholesale Supply',
    bulkMetadata,
    'Bulk Wholesale Tea Supply Australia | Teavision',
  ],
])('%s page title', (_name, metadata, expected) => {
  test('is descriptive and names Teavision', () => {
    const title = getAbsoluteTitle(metadata)

    expect(title).toBe(expected)
    expect(title).toContain('Teavision')
    expect(title?.length ?? 0).toBeLessThanOrEqual(60)
  })

  test('matches the share preview title', () => {
    expect(metadata.openGraph?.title).toBe(expected)
  })
})
