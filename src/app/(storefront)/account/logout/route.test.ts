import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { sealCustomerSession } from '@/lib/shopify/customer-account/session'
import { clearCartCookie } from '@/lib/cart/actions'

import { GET, POST } from './route'

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
  clearCartCookie: vi.fn(),
}))

const clearCartCookieMock = clearCartCookie as unknown as Mock<
  typeof clearCartCookie
>

describe('account logout route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cookieState.values.clear()
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE', 'true')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', 'http://127.0.0.1:9014')
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET',
      'test-session-secret-with-at-least-32-characters',
    )
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI',
      'https://teavision.test/account/login',
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
            authorization_endpoint: 'http://127.0.0.1:9014/auth',
            end_session_endpoint: 'http://127.0.0.1:9014/logout',
            issuer: 'http://127.0.0.1:9014',
            jwks_uri: 'http://127.0.0.1:9014/jwks',
            token_endpoint: 'http://127.0.0.1:9014/token',
          })
        }

        return Response.json({
          customer_account_api_endpoint: 'http://127.0.0.1:9014/graphql',
        })
      }),
    )
    clearCartCookieMock.mockResolvedValue()
  })

  test('GET clears session and redirects through Shopify logout endpoint', async () => {
    cookieState.values.set(
      'teavision_customer_session',
      sealCustomerSession({
        accessToken: 'customer-access-token',
        customerId: 'gid://shopify/Customer/test-customer-1',
        expiresAt: Date.now() + 60000,
        idToken: 'id-token',
        refreshToken: 'customer-refresh-token',
      }),
    )

    const response = await GET()
    const location = response.headers.get('location')

    expect(location).toContain('http://127.0.0.1:9014/logout')
    expect(location).toContain('id_token_hint=id-token')
    expect(cookieState.delete).toHaveBeenCalledWith(
      'teavision_customer_session',
    )
  })

  test('POST clears the cart and local cookies when there is no session', async () => {
    cookieState.values.set('teavision_cart', 'gid://shopify/Cart/current')

    const response = await POST()

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/account/login?reason=logged-out',
    )
    expect(clearCartCookieMock).toHaveBeenCalledTimes(1)
    expect(cookieState.delete).toHaveBeenCalledWith(
      'teavision_customer_session',
    )
  })

  test('local logout fallback redirects to the configured account origin', async () => {
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI',
      'https://detonate-trickster-venus.ngrok-free.dev/account/login',
    )

    const response = await GET()

    expect(response.headers.get('location')).toBe(
      'https://detonate-trickster-venus.ngrok-free.dev/account/login?reason=logged-out',
    )
  })
})
