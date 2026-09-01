import { describe, expect, test } from 'vitest'

import { normalizeZotaboxEmbedUrl } from './public'

describe('public environment configuration', () => {
  test('accepts Zotabox widget URLs from the approved HTTPS host', () => {
    expect(
      normalizeZotaboxEmbedUrl(
        'https://static.zotabox.com/5/f/example/widgets.js',
      ),
    ).toBe('https://static.zotabox.com/5/f/example/widgets.js')

    expect(
      normalizeZotaboxEmbedUrl('//static.zotabox.com/a/b/example/widgets.js'),
    ).toBe('https://static.zotabox.com/a/b/example/widgets.js')
  })

  test('rejects malformed, insecure, or unapproved script URLs', () => {
    expect(normalizeZotaboxEmbedUrl(undefined)).toBeUndefined()
    expect(normalizeZotaboxEmbedUrl('not-a-url')).toBeUndefined()
    expect(
      normalizeZotaboxEmbedUrl(
        'http://static.zotabox.com/5/f/example/widgets.js',
      ),
    ).toBeUndefined()
    expect(
      normalizeZotaboxEmbedUrl('https://example.com/widgets.js'),
    ).toBeUndefined()
    expect(
      normalizeZotaboxEmbedUrl('https://static.zotabox.com/other.js'),
    ).toBeUndefined()
  })
})
