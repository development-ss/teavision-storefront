import { beforeEach, describe, expect, test, vi } from 'vitest'

import { clearProductPreviewSession } from '@/lib/shopify/preview-session'

import { GET } from './route'

vi.mock('@/lib/shopify/preview-session', () => ({
  clearProductPreviewSession: vi.fn(),
}))

const clearSessionMock = vi.mocked(clearProductPreviewSession)

describe('Shopify product preview disable route', () => {
  beforeEach(() => vi.clearAllMocks())

  test('clears the session and redirects home', async () => {
    const response = await GET(
      new Request('https://teavision.test/api/shopify-preview/disable'),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('https://teavision.test/')
    expect(clearSessionMock).toHaveBeenCalledTimes(1)
  })
})
