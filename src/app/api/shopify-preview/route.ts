import { getShopifyProductPreviewSecret } from '@/lib/env/server'
import { logEvent } from '@/lib/observability/logger'
import { getProductPreview } from '@/lib/shopify/operations/product-preview'
import {
  setProductPreviewSession,
  verifyThemeProductPreview,
} from '@/lib/shopify/preview-session'

const MIN_PREVIEW_SECRET_LENGTH = 32
const PREVIEW_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
}

function jsonError(error: string, status: number): Response {
  return Response.json(
    { error },
    {
      status,
      headers: PREVIEW_RESPONSE_HEADERS,
    },
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
  const productId = url.searchParams.get('productId')

  if (
    ['productId', 'timestamp', 'signature'].some(
      (key) => url.searchParams.getAll(key).length !== 1,
    ) ||
    !verifyThemeProductPreview(
      productId,
      url.searchParams.get('timestamp'),
      url.searchParams.get('signature'),
    )
  ) {
    logEvent('warn', 'shopify_product_preview_rejected', {
      reason: 'invalid-theme-signature',
      productIdPresent: Boolean(productId),
    })
    return jsonError(
      'Invalid or expired preview link. Open Preview again in Shopify.',
      401,
    )
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
    return new Response(null, {
      status: 302,
      headers: {
        Location: new URL(
          `/preview/products/${productId}`,
          request.url,
        ).toString(),
        ...PREVIEW_RESPONSE_HEADERS,
      },
    })
  } catch {
    logEvent('error', 'shopify_product_preview_rejected', {
      reason: 'admin-fetch-failed',
    })
    return jsonError('Unable to load product preview', 502)
  }
}
