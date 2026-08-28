import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'

import {
  ShopifyAdminConfigurationError,
  shopifyAdminFetch,
} from './admin-client'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

type FetchCall = {
  body: unknown
  cache?: RequestCache
  headers: Headers
  url: string
}

function parseRequestBody(body: BodyInit | null | undefined): unknown {
  const text = String(body ?? '')

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function createFetchMock(...responses: Response[]) {
  const calls: FetchCall[] = []
  let responseIndex = 0
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        body: parseRequestBody(init?.body),
        cache: init?.cache,
        headers: new Headers(init?.headers),
        url: String(input),
      })
      const response = responses[responseIndex] ?? responses.at(-1)
      responseIndex += 1
      if (!response) throw new Error('Missing fetch mock response')
      return response
    },
  )

  vi.stubGlobal('fetch', fetchMock)

  return { calls, fetchMock }
}

const logEventMock = vi.mocked(logEvent)

describe('shopifyAdminFetch', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', '')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', '')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_ID', '')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', '')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_URL', '')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_MODE', '')
    vi.stubEnv('PLAYWRIGHT_PRODUCTION_TEST_MODE', '')
    logEventMock.mockClear()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  test('fails fast when Admin credentials are missing', async () => {
    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toBeInstanceOf(ShopifyAdminConfigurationError)
  })

  test('uses the Admin endpoint, API version, token, and no-store cache', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-test.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', 'admin-token')
    const { calls } = createFetchMock(Response.json({ data: { ok: true } }))

    await expect(
      shopifyAdminFetch<{ ok: boolean }, { email: string }>({
        query: 'query Test($email: String!) { ok }',
        variables: { email: 'buyer@example.com' },
      }),
    ).resolves.toEqual({ ok: true })

    expect(calls[0]?.url).toBe(
      'https://teavision-test.myshopify.com/admin/api/2026-04/graphql.json',
    )
    expect(calls[0]?.headers.get('X-Shopify-Access-Token')).toBe('admin-token')
    expect(calls[0]?.cache).toBe('no-store')
    expect(calls[0]?.body).toEqual(
      expect.objectContaining({
        variables: { email: 'buyer@example.com' },
      }),
    )
  })

  test('exchanges client credentials once and reuses the token before expiry', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-client-a.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_ID', 'client-a')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', 'secret-a')
    const { calls } = createFetchMock(
      Response.json({
        access_token: 'short-lived-token',
        expires_in: 86_399,
        scope: 'read_customers,write_customers',
      }),
      Response.json({ data: { ok: true } }),
      Response.json({ data: { ok: true } }),
    )

    await shopifyAdminFetch<{ ok: boolean }>({ query: 'query First { ok }' })
    await shopifyAdminFetch<{ ok: boolean }>({ query: 'query Second { ok }' })

    expect(calls).toHaveLength(3)
    expect(calls[0]?.url).toBe(
      'https://teavision-client-a.myshopify.com/admin/oauth/access_token',
    )
    expect(new URLSearchParams(String(calls[0]?.body))).toEqual(
      new URLSearchParams({
        client_id: 'client-a',
        client_secret: 'secret-a',
        grant_type: 'client_credentials',
      }),
    )
    expect(calls[1]?.headers.get('X-Shopify-Access-Token')).toBe(
      'short-lived-token',
    )
    expect(calls[2]?.headers.get('X-Shopify-Access-Token')).toBe(
      'short-lived-token',
    )
  })

  test('rejects an unsuccessful client-credentials exchange safely', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-client-b.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_ID', 'client-b')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', 'secret-b')
    createFetchMock(new Response('{}', { status: 401, statusText: 'Denied' }))

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin authentication error: 401')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'AdminTokenExchange',
        status: 401,
      }),
    )
  })

  test('rejects an invalid client-credentials response safely', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-client-c.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_ID', 'client-c')
    vi.stubEnv('SHOPIFY_ADMIN_CLIENT_SECRET', 'secret-c')
    createFetchMock(Response.json({ access_token: '', expires_in: 0 }))

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin authentication returned invalid data')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'AdminTokenExchange',
        status: 'invalid-token-response',
      }),
    )
  })

  test('allows a local test endpoint with a test token in the test runtime', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_URL', 'http://127.0.0.1:4517/graphql')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_MODE', 'true')
    const { calls } = createFetchMock(Response.json({ data: { ok: true } }))

    await shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' })

    expect(calls[0]?.url).toBe('http://127.0.0.1:4517/graphql')
    expect(calls[0]?.headers.get('X-Shopify-Access-Token')).toBe('test-token')
  })

  test('rejects a test endpoint outside explicit test mode', async () => {
    vi.stubEnv('SHOPIFY_ADMIN_TEST_URL', 'http://127.0.0.1:4517/graphql')

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin test endpoint requires explicit test mode')
  })

  test('rejects a non-local test endpoint', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_URL', 'https://shopify.test/graphql')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_MODE', 'true')

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin test endpoint must be local')
  })

  test('rejects the local test endpoint in production without the explicit test flag', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_URL', 'http://127.0.0.1:4517/graphql')
    vi.stubEnv('SHOPIFY_ADMIN_TEST_MODE', 'true')

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow(
      'Shopify Admin test endpoint is not allowed in production',
    )
  })

  test('logs and rejects non-OK responses', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-test.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', 'admin-token')
    createFetchMock(new Response('{}', { status: 503, statusText: 'Down' }))

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin API error: 503')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'Test',
        status: 503,
      }),
    )
  })

  test('logs and rejects top-level GraphQL errors', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-test.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', 'admin-token')
    createFetchMock(
      Response.json({
        data: null,
        errors: [{ message: 'Forbidden' }],
      }),
    )

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin API returned GraphQL errors')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'Test',
        status: 'graphql-errors',
      }),
    )
  })

  test('logs and rejects a missing data payload', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-test.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', 'admin-token')
    createFetchMock(Response.json({}))

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin API returned no data')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'Test',
        status: 'missing-data',
      }),
    )
  })

  test('logs and rejects malformed JSON responses', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-test.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', 'admin-token')
    createFetchMock(new Response('not-json'))

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin API returned invalid JSON')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'Test',
        status: 'invalid-json',
      }),
    )
  })

  test('logs and rejects network failures', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'teavision-test.myshopify.com')
    vi.stubEnv('SHOPIFY_ADMIN_API_ACCESS_TOKEN', 'admin-token')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    await expect(
      shopifyAdminFetch<{ ok: boolean }>({ query: 'query Test { ok }' }),
    ).rejects.toThrow('Shopify Admin API request failed')
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'shopify_admin_failed',
      expect.objectContaining({
        operation: 'Test',
        status: 'network-error',
      }),
    )
  })
})
