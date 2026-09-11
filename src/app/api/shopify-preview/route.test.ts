import { createHmac } from 'node:crypto'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'
import { getShopifyProductPreviewSecret } from '@/lib/env/server'
import { getProductPreview } from '@/lib/shopify/operations/product-preview'
import { setProductPreviewSession } from '@/lib/shopify/preview-session'
import type { Product } from '@/lib/shopify/types'

import { GET } from './route'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env/server', () => ({ getShopifyProductPreviewSecret: vi.fn() }))
vi.mock('@/lib/observability/logger', () => ({ logEvent: vi.fn() }))
vi.mock('@/lib/shopify/operations/product-preview', () => ({
  getProductPreview: vi.fn(),
}))
vi.mock('@/lib/shopify/preview-session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/shopify/preview-session')>()),
  setProductPreviewSession: vi.fn(),
}))

const SECRET = 'preview-secret-0123456789abcdef0123456789'
const getPreviewMock = vi.mocked(getProductPreview)
const setSessionMock = vi.mocked(setProductPreviewSession)

function previewRequest(overrides: Record<string, string> = {}): Request {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = createHmac('sha256', SECRET)
    .update(`shopify-theme-preview:v1:123:${timestamp}`)
    .digest('hex')
  const params = new URLSearchParams({
    productId: '123',
    timestamp,
    signature,
    ...overrides,
  })
  return new Request(`https://teavision.test/api/shopify-preview?${params}`)
}

describe('Shopify theme preview entry', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getShopifyProductPreviewSecret).mockReturnValue(SECRET)
    getPreviewMock.mockResolvedValue({
      status: 'DRAFT',
      product: {} as Product,
    })
    setSessionMock.mockResolvedValue(true)
  })

  test('creates a session only for the signed product and strips authentication from redirect', async () => {
    const response = await GET(previewRequest())
    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://teavision.test/preview/products/123',
    )
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(response.headers.get('referrer-policy')).toBe('no-referrer')
    expect(response.headers.get('x-robots-tag')).toContain('noindex')
    expect(setSessionMock).toHaveBeenCalledWith('123')
    expect(JSON.stringify(vi.mocked(logEvent).mock.calls)).not.toContain(SECRET)
  })

  test.each<Record<string, string>>([
    { productId: '456' },
    { timestamp: '1000000000' },
    { signature: '0'.repeat(64) },
  ])(
    'rejects altered or expired authentication before reading Admin data',
    async (overrides) => {
      const response = await GET(previewRequest(overrides))
      expect(response.status).toBe(401)
      expect(getPreviewMock).not.toHaveBeenCalled()
      expect(setSessionMock).not.toHaveBeenCalled()
    },
  )

  test('retires shared-secret URLs and rejects duplicate parameters', async () => {
    const oldLink = new Request(
      `https://teavision.test/api/shopify-preview?productId=123&secret=${SECRET}`,
    )
    expect((await GET(oldLink)).status).toBe(401)
    expect(
      (await GET(new Request(`${previewRequest().url}&productId=456`))).status,
    ).toBe(401)
    expect(getPreviewMock).not.toHaveBeenCalled()
  })

  test('fails closed when signing secret is missing or too short', async () => {
    for (const secret of [undefined, 'short']) {
      vi.mocked(getShopifyProductPreviewSecret).mockReturnValue(secret)
      expect((await GET(previewRequest())).status).toBe(500)
    }
    expect(getPreviewMock).not.toHaveBeenCalled()
  })

  test('handles a deleted product without issuing a session', async () => {
    getPreviewMock.mockResolvedValueOnce(null)
    expect((await GET(previewRequest())).status).toBe(404)
    expect(setSessionMock).not.toHaveBeenCalled()
  })

  test('fails closed on Admin errors and never logs exception contents', async () => {
    getPreviewMock.mockRejectedValueOnce(new Error(`sensitive ${SECRET}`))
    expect((await GET(previewRequest())).status).toBe(502)
    expect(setSessionMock).not.toHaveBeenCalled()
    expect(JSON.stringify(vi.mocked(logEvent).mock.calls)).not.toContain(SECRET)
  })

  test('does not redirect when session creation fails', async () => {
    setSessionMock.mockResolvedValueOnce(false)
    expect((await GET(previewRequest())).status).toBe(500)
  })
})
