import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  CUSTOMER_FLASH_COOKIE,
  sealPendingCustomerAuth,
  unsealCustomerSession,
} from '@/lib/shopify/customer-account/session'
import { syncCartBuyerIdentityForCurrentSession } from '@/lib/cart/actions'

import { GET } from './route'

const cookieState = vi.hoisted(() => ({
  values: new Map<string, string>(),
  delete: vi.fn((name: string) => {
    cookieState.values.delete(name)
  }),
  get: vi.fn((name: string) => {
    const value = cookieState.values.get(name)
    return value ? { value } : undefined
  }),
  set: vi.fn((name: string, value: string) => {
    cookieState.values.set(name, value)
  }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieState),
}))

vi.mock('@/lib/cart/actions', () => ({
  syncCartBuyerIdentityForCurrentSession: vi.fn(),
}))

const syncCartBuyerIdentityForCurrentSessionMock =
  syncCartBuyerIdentityForCurrentSession as unknown as Mock<
    typeof syncCartBuyerIdentityForCurrentSession
  >

function encodeTokenSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

function makeIdToken(nonce: string): string {
  return [
    encodeTokenSegment({ alg: 'none' }),
    encodeTokenSegment({ nonce, sub: 'gid://shopify/Customer/test' }),
    'signature',
  ].join('.')
}

describe('account OAuth callback route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookieState.values.clear()
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE', 'true')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', 'http://127.0.0.1:9013')
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET',
      'test-session-secret-with-at-least-32-characters',
    )
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI',
      'https://teavision.test/account/callback',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith('/.well-known/openid-configuration')) {
          return Response.json({
            authorization_endpoint: 'http://127.0.0.1:9013/auth',
            end_session_endpoint: 'http://127.0.0.1:9013/logout',
            issuer: 'http://127.0.0.1:9013',
            jwks_uri: 'http://127.0.0.1:9013/jwks',
            token_endpoint: 'http://127.0.0.1:9013/token',
          })
        }

        if (String(input).endsWith('/.well-known/customer-account-api')) {
          return Response.json({
            customer_account_api_endpoint: 'http://127.0.0.1:9013/graphql',
          })
        }

        return Response.json({
          access_token: 'customer-access-token',
          expires_in: 3600,
          id_token: makeIdToken('nonce-1'),
          refresh_token: 'customer-refresh-token',
        })
      }),
    )
    syncCartBuyerIdentityForCurrentSessionMock.mockResolvedValue({
      cart: null,
      message: null,
      synced: false,
    })
  })

  test('state mismatch prevents token exchange', async () => {
    cookieState.values.set(
      'teavision_customer_auth',
      sealPendingCustomerAuth({
        codeVerifier: 'verifier',
        createdAt: Date.now(),
        nonce: 'nonce-1',
        returnTo: '/account',
        state: 'state-1',
      }),
    )

    const response = await GET(
      new Request(
        'https://teavision.test/account/callback?code=abc&state=wrong',
      ),
    )

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/account/login?reason=verification-failed',
    )
    expect(fetch as unknown as Mock).not.toHaveBeenCalled()
  })

  test('failed callback redirects to the configured callback origin', async () => {
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI',
      'https://detonate-trickster-venus.ngrok-free.dev/account/callback',
    )

    const response = await GET(
      new Request(
        'https://localhost:3000/account/callback?code=abc&state=wrong',
      ),
    )

    expect(response.headers.get('location')).toBe(
      'https://detonate-trickster-venus.ngrok-free.dev/account/login?reason=verification-failed',
    )
    expect(fetch as unknown as Mock).not.toHaveBeenCalled()
  })

  test('successful callback sets session and clears pending auth', async () => {
    cookieState.values.set(
      'teavision_customer_auth',
      sealPendingCustomerAuth({
        codeVerifier: 'verifier',
        createdAt: Date.now(),
        nonce: 'nonce-1',
        returnTo: '/account/orders',
        state: 'state-1',
      }),
    )

    const response = await GET(
      new Request(
        'https://teavision.test/account/callback?code=abc&state=state-1',
      ),
    )
    const sessionCookie = cookieState.values.get('teavision_customer_session')

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/account/orders',
    )
    expect(sessionCookie).toEqual(expect.any(String))
    expect(unsealCustomerSession(sessionCookie ?? '')).toMatchObject({
      accessToken: 'customer-access-token',
    })
    expect(cookieState.delete).toHaveBeenCalledWith('teavision_customer_auth')

    const tokenRequest = (fetch as unknown as Mock).mock.calls.find(([input]) =>
      String(input).endsWith('/token'),
    )
    const tokenRequestInit = tokenRequest?.[1] as RequestInit | undefined
    const tokenRequestBody = new URLSearchParams(String(tokenRequestInit?.body))

    expect(tokenRequestInit?.headers).toMatchObject({
      Origin: 'https://teavision.test',
      'User-Agent': 'Teavision Storefront',
    })
    expect(tokenRequestBody.has('nonce')).toBe(false)
  })

  test('successful callback syncs an existing cart after session creation', async () => {
    cookieState.values.set('teavision_cart', 'gid://shopify/Cart/current')
    cookieState.values.set(
      'teavision_customer_auth',
      sealPendingCustomerAuth({
        codeVerifier: 'verifier',
        createdAt: Date.now(),
        nonce: 'nonce-1',
        returnTo: '/cart',
        state: 'state-1',
      }),
    )

    await GET(
      new Request(
        'https://teavision.test/account/callback?code=abc&state=state-1',
      ),
    )

    expect(syncCartBuyerIdentityForCurrentSessionMock).toHaveBeenCalledTimes(1)
    expect(cookieState.set.mock.invocationCallOrder[0]).toBeLessThan(
      syncCartBuyerIdentityForCurrentSessionMock.mock.invocationCallOrder[0] ??
        0,
    )
  })

  test('successful callback returns cart shoppers to blocked checkout state when cart identity sync fails', async () => {
    const syncFailureMessage =
      'We could not confirm your account for checkout. Retry checkout or sign in again before continuing.'
    cookieState.values.set('teavision_cart', 'gid://shopify/Cart/current')
    cookieState.values.set(
      'teavision_customer_auth',
      sealPendingCustomerAuth({
        codeVerifier: 'verifier',
        createdAt: Date.now(),
        nonce: 'nonce-1',
        returnTo: '/cart',
        state: 'state-1',
      }),
    )
    syncCartBuyerIdentityForCurrentSessionMock.mockResolvedValue({
      cart: null,
      message: syncFailureMessage,
      synced: false,
    })

    const response = await GET(
      new Request(
        'https://teavision.test/account/callback?code=abc&state=state-1',
      ),
    )

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/cart?checkout=identity-sync-failed',
    )
    expect(cookieState.values.get(CUSTOMER_FLASH_COOKIE)).toBe(
      syncFailureMessage,
    )
    expect(cookieState.delete).toHaveBeenCalledWith('teavision_customer_auth')
  })
})
