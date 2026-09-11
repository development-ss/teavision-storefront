import { timingSafeEqual } from 'node:crypto'

import { getShopifyProductPreviewSecret } from '@/lib/env/server'
import { logEvent } from '@/lib/observability/logger'
import { getProductPreview } from '@/lib/shopify/operations/product-preview'
import { setProductPreviewSession } from '@/lib/shopify/preview-session'

const MIN_PREVIEW_SECRET_LENGTH = 32

function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status })
}

function isValidSecret(candidate: string | null, expected: string): boolean {
  if (!candidate) return false
  const candidateBuffer = Buffer.from(candidate)
  const expectedBuffer = Buffer.from(expected)
  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  )
}

export async function GET(request: Request): Promise<Response> {
  const expectedSecret = getShopifyProductPreviewSecret()
  if (!expectedSecret || expectedSecret.length < MIN_PREVIEW_SECRET_LENGTH) {
    logEvent('error', 'shopify_product_preview_rejected', {
      reason: 'missing-secret',
    })
    return jsonError('Preview secret not configured', 500)
  }

  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  const productId = url.searchParams.get('productId')

  if (!isValidSecret(secret, expectedSecret)) {
    logEvent('warn', 'shopify_product_preview_rejected', {
      reason: 'invalid-secret',
      productIdPresent: Boolean(productId),
    })
    return jsonError('Invalid preview secret', 401)
  }

  if (!productId || !/^\d+$/.test(productId)) {
    logEvent('warn', 'shopify_product_preview_rejected', {
      reason: 'invalid-product-id',
    })
    return jsonError('Invalid product ID', 400)
  }

  try {
    const preview = await getProductPreview(productId)
    if (!preview) {
      logEvent('warn', 'shopify_product_preview_rejected', {
        reason: 'product-not-found',
      })
      return jsonError('Product not found', 404)
    }

    if (!(await setProductPreviewSession(productId))) {
      logEvent('error', 'shopify_product_preview_rejected', {
        reason: 'session-not-created',
      })
      return jsonError('Preview secret not configured', 500)
    }

    logEvent('info', 'shopify_product_preview_enabled', {
      productId,
      status: preview.status,
    })
    return Response.redirect(
      new URL(`/preview/products/${productId}`, request.url),
    )
  } catch {
    logEvent('error', 'shopify_product_preview_rejected', {
      reason: 'admin-fetch-failed',
    })
    return jsonError('Unable to load product preview', 502)
  }
}
