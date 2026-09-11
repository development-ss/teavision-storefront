import crypto from 'crypto'

import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

import { getShopifyWebhookSecret } from '@/lib/env/server'
import { logEvent } from '@/lib/observability/logger'

export async function POST(request: NextRequest): Promise<Response> {
  // Read raw body as buffer for HMAC verification
  let rawBody: Buffer
  try {
    const arrayBuffer = await request.arrayBuffer()
    rawBody = Buffer.from(arrayBuffer)
  } catch {
    logEvent('warn', 'shopify_webhook_rejected', {
      reason: 'raw-body-read-failed',
    })

    return Response.json(
      { error: 'Failed to read request body' },
      { status: 400 },
    )
  }

  // Verify HMAC signature
  const secret = getShopifyWebhookSecret()
  if (!secret) {
    logEvent('error', 'shopify_webhook_rejected', {
      reason: 'missing-secret',
    })

    return Response.json(
      { error: 'Webhook secret not configured' },
      { status: 401 },
    )
  }

  const shopifyHmac = request.headers.get('x-shopify-hmac-sha256')
  if (!shopifyHmac) {
    logEvent('warn', 'shopify_webhook_rejected', {
      reason: 'missing-hmac',
    })

    return Response.json({ error: 'Missing HMAC header' }, { status: 401 })
  }

  const computedHmac = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64')

  const shopifyHmacBuffer = Buffer.from(shopifyHmac, 'base64')
  const computedHmacBuffer = Buffer.from(computedHmac, 'base64')

  if (
    shopifyHmacBuffer.length !== computedHmacBuffer.length ||
    !crypto.timingSafeEqual(shopifyHmacBuffer, computedHmacBuffer)
  ) {
    logEvent('warn', 'shopify_webhook_rejected', {
      reason: 'invalid-hmac',
    })

    return Response.json({ error: 'Invalid HMAC signature' }, { status: 401 })
  }

  // Route based on topic
  const topic = request.headers.get('x-shopify-topic') ?? ''

  switch (topic) {
    case 'products/create':
    case 'products/update':
    case 'products/delete':
      logEvent('info', 'shopify_webhook_received', {
        status: 'accepted',
        topic,
      })
      revalidateTag('product', { expire: 0 })
      revalidateTag('products', { expire: 0 })
      revalidateTag('collection', { expire: 0 })
      break

    case 'collections/create':
    case 'collections/update':
    case 'collections/delete':
      logEvent('info', 'shopify_webhook_received', {
        status: 'accepted',
        topic,
      })
      revalidateTag('collection', { expire: 0 })
      revalidateTag('collections', { expire: 0 })
      break

    case 'collections/products_add':
    case 'collections/products_remove':
      logEvent('info', 'shopify_webhook_received', {
        status: 'accepted',
        topic,
      })
      revalidateTag('collection', { expire: 0 })
      revalidateTag('product', { expire: 0 })
      break

    case 'pages/create':
    case 'pages/update':
    case 'pages/delete':
      logEvent('info', 'shopify_webhook_received', {
        status: 'accepted',
        topic,
      })
      revalidateTag('page', { expire: 0 })
      revalidateTag('pages', { expire: 0 })
      break

    default:
      // Unknown topics are accepted but ignored
      logEvent('info', 'shopify_webhook_received', {
        status: 'ignored',
        topic,
      })
      break
  }

  return Response.json({ revalidated: true }, { status: 200 })
}
