import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { cookies } from 'next/headers'

import { getShopifyProductPreviewSecret } from '@/lib/env/server'

export const SHOPIFY_PRODUCT_PREVIEW_COOKIE = 'teavision_product_preview'
export const SHOPIFY_PRODUCT_PREVIEW_TTL_SECONDS = 30 * 60

export type ProductPreviewSession = {
  productId: string
  expiresAt: number
}

type ProductPreviewPayload = ProductPreviewSession

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decode(value: string): string | null {
  try {
    return Buffer.from(value, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(received)
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

function isProductId(value: unknown): value is string {
  return typeof value === 'string' && /^\d+$/.test(value)
}

// Matches Shopify Liquid's hmac_sha256 filter in headless-product-preview.liquid.
// Keep this purpose separate from the signed browser-session payload.
export function verifyThemeProductPreview(
  productId: string | null,
  timestamp: string | null,
  signature: string | null,
  now = Date.now(),
  secret = getShopifyProductPreviewSecret(),
): productId is string {
  if (
    !secret ||
    secret.length < 32 ||
    !isProductId(productId) ||
    !timestamp ||
    !/^\d{10}$/.test(timestamp) ||
    !signature ||
    !/^[a-f0-9]{64}$/.test(signature)
  )
    return false

  const age = Math.floor(now / 1000) - Number(timestamp)
  if (age < -30 || age >= 300) return false

  const expected = createHmac('sha256', secret)
    .update(`shopify-theme-preview:v1:${productId}:${timestamp}`)
    .digest('hex')
  return signaturesMatch(expected, signature)
}

function isPayload(value: unknown): value is ProductPreviewPayload {
  if (!value || typeof value !== 'object') return false

  const payload = value as Record<string, unknown>
  return (
    isProductId(payload.productId) &&
    typeof payload.expiresAt === 'number' &&
    Number.isSafeInteger(payload.expiresAt)
  )
}

export function createProductPreviewCookieValue(
  productId: string,
  now = Date.now(),
  secret = getShopifyProductPreviewSecret(),
): string | null {
  if (!isProductId(productId) || !secret) return null

  const payload: ProductPreviewPayload = {
    productId,
    expiresAt: now + SHOPIFY_PRODUCT_PREVIEW_TTL_SECONDS * 1000,
  }
  const encodedPayload = encode(JSON.stringify(payload))
  return `${encodedPayload}.${sign(encodedPayload, secret)}`
}

export function readProductPreviewCookieValue(
  value: string | undefined,
  now = Date.now(),
  secret = getShopifyProductPreviewSecret(),
): ProductPreviewSession | null {
  if (!value || !secret) return null

  const [encodedPayload, receivedSignature, ...extra] = value.split('.')
  if (!encodedPayload || !receivedSignature || extra.length > 0) return null

  const expectedSignature = sign(encodedPayload, secret)
  if (!signaturesMatch(expectedSignature, receivedSignature)) return null

  const decodedPayload = decode(encodedPayload)
  if (!decodedPayload) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(decodedPayload)
  } catch {
    return null
  }

  if (!isPayload(parsed) || parsed.expiresAt <= now) return null
  return parsed
}

export async function getProductPreviewSession(): Promise<ProductPreviewSession | null> {
  const cookieStore = await cookies()
  return readProductPreviewCookieValue(
    cookieStore.get(SHOPIFY_PRODUCT_PREVIEW_COOKIE)?.value,
  )
}

export async function setProductPreviewSession(
  productId: string,
): Promise<boolean> {
  const value = createProductPreviewCookieValue(productId)
  if (!value) return false

  const cookieStore = await cookies()
  cookieStore.set(SHOPIFY_PRODUCT_PREVIEW_COOKIE, value, {
    httpOnly: true,
    maxAge: SHOPIFY_PRODUCT_PREVIEW_TTL_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return true
}

export async function clearProductPreviewSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SHOPIFY_PRODUCT_PREVIEW_COOKIE)
}
