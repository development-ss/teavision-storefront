import { beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'
import { getShopifyProductPreviewSecret } from '@/lib/env/server'
import { getProductPreview } from '@/lib/shopify/operations/product-preview'
import { setProductPreviewSession } from '@/lib/shopify/preview-session'
import type { Product } from '@/lib/shopify/types'

import { GET } from './route'

vi.mock('@/lib/env/server', () => ({
  getShopifyProductPreviewSecret: vi.fn(),
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

vi.mock('@/lib/shopify/operations/product-preview', () => ({
  getProductPreview: vi.fn(),
}))

vi.mock('@/lib/shopify/preview-session', () => ({
  setProductPreviewSession: vi.fn(),
}))

const getSecretMock = vi.mocked(getShopifyProductPreviewSecret)
const getPreviewMock = vi.mocked(getProductPreview)
const setSessionMock = vi.mocked(setProductPreviewSession)
const logEventMock = vi.mocked(logEvent)
const SECRET = 'preview-secret-0123456789abcdef0123456789'

function previewRequest(search: string): Request {
  return new Request(`https://teavision.test/api/shopify-preview${search}`)
}

describe('Shopify product preview route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSecretMock.mockReturnValue(SECRET)
    getPreviewMock.mockResolvedValue({
      status: 'DRAFT',
      product: {} as Product,
    })
    setSessionMock.mockResolvedValue(true)
  })

  test('rejects an invalid secret before fetching product data', async () => {
    const response = await GET(previewRequest('?secret=wrong&productId=123'))

    expect(response.status).toBe(401)
    expect(getPreviewMock).not.toHaveBeenCalled()
    expect(setSessionMock).not.toHaveBeenCalled()
    expect(JSON.stringify(logEventMock.mock.calls)).not.toContain(SECRET)
  })

  test('rejects invalid product IDs', async () => {
    const response = await GET(
      previewRequest(
        `?secret=${SECRET}&productId=gid%3A%2F%2Fshopify%2FProduct%2F123`,
      ),
    )

    expect(response.status).toBe(400)
    expect(getPreviewMock).not.toHaveBeenCalled()
  })

  test('returns 404 when the Admin product does not exist', async () => {
    getPreviewMock.mockResolvedValueOnce(null)

    const response = await GET(
      previewRequest(`?secret=${SECRET}&productId=123`),
    )

    expect(response.status).toBe(404)
    expect(setSessionMock).not.toHaveBeenCalled()
  })

  test('sets a session and redirects without the secret in the URL', async () => {
    const response = await GET(
      previewRequest(`?secret=${SECRET}&productId=123`),
    )

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe(
      'https://teavision.test/preview/products/123',
    )
    expect(setSessionMock).toHaveBeenCalledWith('123')
    expect(response.headers.get('location')).not.toContain(SECRET)
  })

  test('fails safely when the preview secret is not configured', async () => {
    getSecretMock.mockReturnValueOnce(undefined)

    const response = await GET(previewRequest('?secret=anything&productId=123'))

    expect(response.status).toBe(500)
    expect(getPreviewMock).not.toHaveBeenCalled()
  })
})
