import { createHmac } from 'node:crypto'

import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  createProductPreviewCookieValue,
  clearProductPreviewSession,
  getProductPreviewSession,
  readProductPreviewCookieValue,
  setProductPreviewSession,
  SHOPIFY_PRODUCT_PREVIEW_COOKIE,
  SHOPIFY_PRODUCT_PREVIEW_TTL_SECONDS,
  verifyThemeProductPreview,
} from './preview-session'

vi.mock('server-only', () => ({}))

const { cookiesMock, getPreviewSecretMock } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  getPreviewSecretMock: vi.fn(),
}))

const cookieStore = {
  delete: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: cookiesMock,
}))

vi.mock('@/lib/env/server', () => ({
  getShopifyProductPreviewSecret: getPreviewSecretMock,
}))

const SECRET = 'preview-secret-0123456789abcdef0123456789'
const NOW = 1_700_000_000_000

describe('Shopify Liquid preview signatures', () => {
  const timestamp = String(NOW / 1000)
  const signature = createHmac('sha256', SECRET)
    .update(`shopify-theme-preview:v1:123:${timestamp}`)
    .digest('hex')

  test('accepts a current product-bound Liquid HMAC', () => {
    expect(
      verifyThemeProductPreview('123', timestamp, signature, NOW, SECRET),
    ).toBe(true)
    expect(
      verifyThemeProductPreview(
        '123',
        timestamp,
        signature,
        NOW + 299_000,
        SECRET,
      ),
    ).toBe(true)
  })

  test('rejects expired and future-dated links', () => {
    expect(
      verifyThemeProductPreview(
        '123',
        timestamp,
        signature,
        NOW + 300_000,
        SECRET,
      ),
    ).toBe(false)
    expect(
      verifyThemeProductPreview(
        '123',
        timestamp,
        signature,
        NOW - 31_000,
        SECRET,
      ),
    ).toBe(false)
  })

  test('rejects tampered product, timestamp, signature, and secret', () => {
    expect(
      verifyThemeProductPreview('124', timestamp, signature, NOW, SECRET),
    ).toBe(false)
    expect(
      verifyThemeProductPreview(
        '123',
        String(Number(timestamp) + 1),
        signature,
        NOW,
        SECRET,
      ),
    ).toBe(false)
    expect(
      verifyThemeProductPreview('123', timestamp, '0'.repeat(64), NOW, SECRET),
    ).toBe(false)
    expect(
      verifyThemeProductPreview(
        '123',
        timestamp,
        signature,
        NOW,
        'different-secret'.repeat(3),
      ),
    ).toBe(false)
    expect(
      verifyThemeProductPreview('123', timestamp, signature, NOW, ''),
    ).toBe(false)
  })

  test.each([
    [null, timestamp, signature],
    ['../123', timestamp, signature],
    ['123', null, signature],
    ['123', '1e9', signature],
    ['123', timestamp, null],
    ['123', timestamp, 'invalid'],
  ])('rejects malformed inputs', (id, time, digest) => {
    expect(verifyThemeProductPreview(id, time, digest, NOW, SECRET)).toBe(false)
  })
})

describe('Shopify product preview session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getPreviewSecretMock.mockReturnValue(SECRET)
    cookiesMock.mockResolvedValue(cookieStore)
  })

  test('creates and validates a signed product session', () => {
    const value = createProductPreviewCookieValue('12345', NOW)

    expect(value).toBeTruthy()
    expect(readProductPreviewCookieValue(value ?? undefined, NOW)).toEqual({
      productId: '12345',
      expiresAt: NOW + SHOPIFY_PRODUCT_PREVIEW_TTL_SECONDS * 1000,
    })
  })

  test('rejects tampered, malformed, expired, and wrong-secret cookies', () => {
    const value = createProductPreviewCookieValue('12345', NOW)
    const [payload, signature] = value?.split('.') ?? []

    expect(
      readProductPreviewCookieValue(
        `${payload}.${signature?.slice(0, -1)}x`,
        NOW,
      ),
    ).toBeNull()
    expect(readProductPreviewCookieValue('not-a-token', NOW)).toBeNull()
    expect(
      readProductPreviewCookieValue(value ?? undefined, NOW + 30 * 60 * 1000),
    ).toBeNull()

    getPreviewSecretMock.mockReturnValue('different-secret')
    expect(readProductPreviewCookieValue(value ?? undefined, NOW)).toBeNull()
  })

  test('only accepts numeric Shopify product IDs', () => {
    expect(
      createProductPreviewCookieValue('gid://shopify/Product/123', NOW),
    ).toBeNull()
    expect(createProductPreviewCookieValue('', NOW)).toBeNull()
  })

  test('sets a secure, short-lived httpOnly cookie', async () => {
    await expect(setProductPreviewSession('123')).resolves.toBe(true)

    expect(cookieStore.set).toHaveBeenCalledWith(
      SHOPIFY_PRODUCT_PREVIEW_COOKIE,
      expect.any(String),
      {
        httpOnly: true,
        maxAge: SHOPIFY_PRODUCT_PREVIEW_TTL_SECONDS,
        path: '/',
        sameSite: 'lax',
        secure: false,
      },
    )
  })

  test('reads and clears the preview cookie through Next cookies()', async () => {
    const value = createProductPreviewCookieValue('123')
    cookieStore.get.mockReturnValue({ value })

    await expect(getProductPreviewSession()).resolves.toEqual({
      productId: '123',
      expiresAt: expect.any(Number),
    })
    await expect(clearProductPreviewSession()).resolves.toBeUndefined()
    expect(cookieStore.get).toHaveBeenCalledWith(SHOPIFY_PRODUCT_PREVIEW_COOKIE)
    expect(cookieStore.delete).toHaveBeenCalledWith(
      SHOPIFY_PRODUCT_PREVIEW_COOKIE,
    )
  })

  test('does not set a cookie when the secret or ID is invalid', async () => {
    getPreviewSecretMock.mockReturnValueOnce(undefined)
    await expect(setProductPreviewSession('123')).resolves.toBe(false)
    expect(cookieStore.set).not.toHaveBeenCalled()
  })
})
