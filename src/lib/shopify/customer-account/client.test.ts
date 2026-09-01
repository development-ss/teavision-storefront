import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { customerAccountFetch } from './client'

type FetchCall = {
  body?: {
    query?: string
  }
  headers: Headers
  url: string
}

function createCustomerFetchMock() {
  const calls: FetchCall[] = []
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        body: init?.body
          ? (JSON.parse(String(init.body)) as FetchCall['body'])
          : undefined,
        headers: new Headers(init?.headers),
        url: String(input),
      })

      if (String(input).endsWith('/.well-known/openid-configuration')) {
        return Response.json({
          authorization_endpoint: 'http://127.0.0.1:9011/auth',
          end_session_endpoint: 'http://127.0.0.1:9011/logout',
          issuer: 'http://127.0.0.1:9011',
          jwks_uri: 'http://127.0.0.1:9011/jwks',
          token_endpoint: 'http://127.0.0.1:9011/token',
        })
      }

      if (String(input).endsWith('/.well-known/customer-account-api')) {
        return Response.json({
          customer_account_api_endpoint: 'http://127.0.0.1:9011/graphql',
        })
      }

      return Response.json({
        data: { ok: false },
        errors: [
          {
            message:
              'GraphQL failed with customer-access-token-secret still inside',
          },
        ],
      })
    },
  )
  vi.stubGlobal('fetch', fetchMock)

  return { calls }
}

function createFailedCustomerFetchMock() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('/.well-known/openid-configuration')) {
        return Response.json({
          authorization_endpoint: 'http://127.0.0.1:9011/auth',
          end_session_endpoint: 'http://127.0.0.1:9011/logout',
          issuer: 'http://127.0.0.1:9011',
          jwks_uri: 'http://127.0.0.1:9011/jwks',
          token_endpoint: 'http://127.0.0.1:9011/token',
        })
      }

      if (String(input).endsWith('/.well-known/customer-account-api')) {
        return Response.json({
          customer_account_api_endpoint: 'http://127.0.0.1:9011/graphql',
        })
      }

      return Response.json(
        {
          errors: [
            {
              message:
                'Field provinceCode does not exist for customer-access-token-secret',
            },
          ],
        },
        { status: 400, statusText: 'Bad Request' },
      )
    }),
  )
}

describe('customerAccountFetch', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE', 'true')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', 'http://127.0.0.1:9011')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  test('sends customer account token auth and redacts token-like values from GraphQL errors', async () => {
    const { calls } = createCustomerFetchMock()

    await expect(
      customerAccountFetch<{ ok: boolean }>({
        accessToken: 'customer-access-token-secret',
        query: 'query Test { ok }',
      }),
    ).rejects.toThrow('GraphQL failed with [redacted] still inside')

    expect(calls[2]?.headers.get('Authorization')).toBe(
      'customer-access-token-secret',
    )
    expect(calls[2]?.headers.get('Origin')).toBe('https://example.test')
    expect(calls[2]?.headers.get('User-Agent')).toBe('Teavision Storefront')
    expect(calls[2]?.body?.query).toBe('query Test { ok }')
  })

  test('includes redacted Shopify error body for failed HTTP responses', async () => {
    createFailedCustomerFetchMock()

    await expect(
      customerAccountFetch<{ ok: boolean }>({
        accessToken: 'customer-access-token-secret',
        query: 'query Test { ok }',
      }),
    ).rejects.toThrow(
      'Shopify Customer Account API error: 400 Bad Request: {"errors":[{"message":"Field provinceCode does not exist for [redacted]"}]}',
    )
  })
})
