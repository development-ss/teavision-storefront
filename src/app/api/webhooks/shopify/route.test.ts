import crypto from 'node:crypto'

import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'

import { POST } from './route'

const getSecretMock = vi.hoisted(() => vi.fn())

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/env/server', () => ({
  getShopifyWebhookSecret: getSecretMock,
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

const SECRET = 'shopify-webhook-test-secret'

function signedRequest(
  topic: string,
  body = '{}',
  secret = SECRET,
): NextRequest {
  const hmac = crypto.createHmac('sha256', secret).update(body).digest('base64')
  return new NextRequest('https://teavision.test/api/webhooks/shopify', {
    method: 'POST',
    headers: {
      'x-shopify-hmac-sha256': hmac,
      'x-shopify-topic': topic,
    },
    body,
  })
}

describe('Shopify webhook route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSecretMock.mockReturnValue(SECRET)
  })

  test('revalidates collection listings when a product changes', async () => {
    const response = await POST(signedRequest('products/update'))

    expect(response.status).toBe(200)
    expect(revalidateTag).toHaveBeenCalledWith('product', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('products', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('collection', { expire: 0 })
  })

  test('preserves collection membership invalidation', async () => {
    await POST(signedRequest('collections/products_add'))

    expect(revalidateTag).toHaveBeenCalledWith('collection', { expire: 0 })
    expect(revalidateTag).toHaveBeenCalledWith('product', { expire: 0 })
  })

  test('rejects an invalid signature without revalidation', async () => {
    const response = await POST(
      signedRequest('products/update', '{}', 'wrong-secret'),
    )

    expect(response.status).toBe(401)
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(logEvent).toHaveBeenCalledWith(
      'warn',
      'shopify_webhook_rejected',
      expect.objectContaining({ reason: 'invalid-hmac' }),
    )
  })
})
