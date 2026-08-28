import 'server-only'

import { isProductionRuntime, isTestRuntime } from '@/lib/env/runtime'
import {
  getShopifyAdminApiAccessToken,
  getShopifyAdminClientId,
  getShopifyAdminClientSecret,
} from '@/lib/env/server'
import { logEvent } from '@/lib/observability/logger'

import { getShopifyStoreDomain, SHOPIFY_API_VERSION } from './env'

const LOCAL_TEST_ENDPOINT_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])
const TOKEN_REFRESH_BUFFER_MS = 60_000

type AdminFetchOptions<TVariables> = {
  query: string
  variables?: TVariables
}

type ShopifyAdminResponse<T> = {
  data?: T
  errors?: Array<{ message: string }>
}

type ShopifyAdminTokenResponse = {
  access_token: string
  expires_in: number
}

type CachedAdminToken = {
  expiresAt: number
  key: string
  token: string
}

let cachedAdminToken: CachedAdminToken | undefined
let pendingAdminToken:
  | { key: string; promise: Promise<CachedAdminToken> }
  | undefined

export class ShopifyAdminConfigurationError extends Error {
  constructor() {
    super('Missing Shopify Admin credentials')
    this.name = 'ShopifyAdminConfigurationError'
  }
}

function getOperationName(query: string): string | undefined {
  return query.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)/)?.[1]
}

function isLocalTestEndpoint(url: string): boolean {
  try {
    return LOCAL_TEST_ENDPOINT_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

function isShopifyAdminTokenResponse(
  payload: unknown,
): payload is ShopifyAdminTokenResponse {
  if (!payload || typeof payload !== 'object') return false

  const response = payload as Record<string, unknown>
  return (
    typeof response.access_token === 'string' &&
    response.access_token.length > 0 &&
    typeof response.expires_in === 'number' &&
    Number.isFinite(response.expires_in) &&
    response.expires_in > 0
  )
}

async function requestClientCredentialsToken(
  domain: string,
  clientId: string,
  clientSecret: string,
  key: string,
): Promise<CachedAdminToken> {
  let response: Response
  try {
    response = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
      cache: 'no-store',
    })
  } catch {
    logEvent('error', 'shopify_admin_failed', {
      operation: 'AdminTokenExchange',
      status: 'network-error',
    })
    throw new Error('Shopify Admin authentication failed')
  }

  if (!response.ok) {
    logEvent('error', 'shopify_admin_failed', {
      operation: 'AdminTokenExchange',
      status: response.status,
      statusText: response.statusText,
    })
    throw new Error(`Shopify Admin authentication error: ${response.status}`)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!isShopifyAdminTokenResponse(payload)) {
    logEvent('error', 'shopify_admin_failed', {
      operation: 'AdminTokenExchange',
      status: 'invalid-token-response',
    })
    throw new Error('Shopify Admin authentication returned invalid data')
  }

  return {
    expiresAt: Date.now() + payload.expires_in * 1000,
    key,
    token: payload.access_token,
  }
}

async function getAdminAccessToken(domain: string): Promise<string> {
  const permanentToken = getShopifyAdminApiAccessToken()
  if (permanentToken) return permanentToken

  const clientId = getShopifyAdminClientId()
  const clientSecret = getShopifyAdminClientSecret()
  if (!clientId || !clientSecret) {
    throw new ShopifyAdminConfigurationError()
  }

  const key = `${domain}:${clientId}`
  if (
    cachedAdminToken?.key === key &&
    Date.now() < cachedAdminToken.expiresAt - TOKEN_REFRESH_BUFFER_MS
  ) {
    return cachedAdminToken.token
  }

  if (pendingAdminToken?.key === key) {
    return (await pendingAdminToken.promise).token
  }

  const promise = requestClientCredentialsToken(
    domain,
    clientId,
    clientSecret,
    key,
  )
  pendingAdminToken = { key, promise }

  try {
    cachedAdminToken = await promise
    return cachedAdminToken.token
  } finally {
    if (pendingAdminToken?.promise === promise) pendingAdminToken = undefined
  }
}

async function getAdminEndpoint(): Promise<{ token: string; url: string }> {
  const testUrl = process.env.SHOPIFY_ADMIN_TEST_URL?.trim()
  const testMode = process.env.SHOPIFY_ADMIN_TEST_MODE?.trim() === 'true'

  if (testUrl && testMode) {
    if (
      isProductionRuntime() &&
      process.env.PLAYWRIGHT_PRODUCTION_TEST_MODE?.trim() !== 'true'
    ) {
      throw new Error(
        'Shopify Admin test endpoint is not allowed in production',
      )
    }

    if (!isLocalTestEndpoint(testUrl)) {
      throw new Error('Shopify Admin test endpoint must be local')
    }

    const token = getShopifyAdminApiAccessToken()
    if (!token && !isTestRuntime()) {
      throw new ShopifyAdminConfigurationError()
    }

    return { token: token ?? 'test-token', url: testUrl }
  }

  if (testUrl && !testMode) {
    throw new Error('Shopify Admin test endpoint requires explicit test mode')
  }

  const domain = getShopifyStoreDomain()
  if (!domain) {
    throw new ShopifyAdminConfigurationError()
  }

  return {
    token: await getAdminAccessToken(domain),
    url: `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
  }
}

export async function shopifyAdminFetch<
  T,
  TVariables = Record<string, unknown>,
>({ query, variables }: AdminFetchOptions<TVariables>): Promise<T> {
  const operation = getOperationName(query)
  const endpoint = await getAdminEndpoint()

  let response: Response
  try {
    response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': endpoint.token,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })
  } catch {
    logEvent('error', 'shopify_admin_failed', {
      operation,
      status: 'network-error',
    })
    throw new Error('Shopify Admin API request failed')
  }

  if (!response.ok) {
    logEvent('error', 'shopify_admin_failed', {
      operation,
      status: response.status,
      statusText: response.statusText,
    })
    throw new Error(`Shopify Admin API error: ${response.status}`)
  }

  let json: ShopifyAdminResponse<T>
  try {
    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object') throw new Error('invalid-json')
    json = payload as ShopifyAdminResponse<T>
  } catch {
    logEvent('error', 'shopify_admin_failed', {
      operation,
      status: 'invalid-json',
    })
    throw new Error('Shopify Admin API returned invalid JSON')
  }

  if (Array.isArray(json.errors) && json.errors.length) {
    logEvent('error', 'shopify_admin_failed', {
      errorCount: json.errors.length,
      operation,
      status: 'graphql-errors',
    })
    throw new Error('Shopify Admin API returned GraphQL errors')
  }

  if (json.data === undefined || json.data === null) {
    logEvent('error', 'shopify_admin_failed', {
      operation,
      status: 'missing-data',
    })
    throw new Error('Shopify Admin API returned no data')
  }

  return json.data
}
