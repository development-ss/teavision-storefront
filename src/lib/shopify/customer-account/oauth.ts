import { createHash, randomBytes } from 'node:crypto'

import { logEvent } from '@/lib/observability/logger'

import { getCustomerAccountConfig } from './env'

const SAFE_RETURN_PREFIXES = ['/account', '/cart', '/checkout']

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64url')
}

export function generateCodeVerifier(): string {
  return base64Url(randomBytes(64))
}

export function generateCodeChallenge(verifier: string): string {
  return base64Url(createHash('sha256').update(verifier).digest())
}

export function generateState(): string {
  return base64Url(randomBytes(32))
}

export function generateNonce(): string {
  return base64Url(randomBytes(32))
}

export function normalizeReturnTo(value: string | null): string {
  if (!value) return '/account'

  let decoded = value.trim()
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    return '/account'
  }

  if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/account'
  if (decoded.includes('{{') || decoded.includes('}}')) return '/account'

  return SAFE_RETURN_PREFIXES.some(
    (prefix) => decoded === prefix || decoded.startsWith(`${prefix}/`),
  )
    ? decoded
    : '/account'
}

export type BuildAuthorizationUrlInput = {
  authorizationEndpoint: string
  codeChallenge: string
  nonce: string
  returnTo: string
  state: string
}

export function buildAuthorizationUrl({
  authorizationEndpoint,
  codeChallenge,
  nonce,
  returnTo,
  state,
}: BuildAuthorizationUrlInput): URL {
  const config = getCustomerAccountConfig()
  const url = new URL(authorizationEndpoint)

  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('nonce', nonce)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email customer-account-api:full')
  url.searchParams.set('state', state)
  url.searchParams.set('return_to', normalizeReturnTo(returnTo))

  return url
}

export type CustomerAccountTokenExchange = {
  accessToken: string
  expiresIn: number
  idToken: string
  refreshToken: string
}

type CustomerAccountTokenResponse = {
  access_token?: string
  expires_in?: number
  id_token?: string
  refresh_token?: string
}

export type IdTokenClaims = {
  nonce?: string
  sub?: string
}

export function decodeIdTokenClaims(idToken: string): IdTokenClaims | null {
  const [, payload] = idToken.split('.')
  if (!payload) {
    logEvent('error', 'account_oauth_failed', {
      status: 'missing-id-token-payload',
    })

    return null
  }

  try {
    const claims = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Record<string, unknown>

    return {
      nonce: typeof claims.nonce === 'string' ? claims.nonce : undefined,
      sub: typeof claims.sub === 'string' ? claims.sub : undefined,
    }
  } catch {
    logEvent('error', 'account_oauth_failed', {
      status: 'invalid-id-token-payload',
    })

    return null
  }
}

export async function exchangeCustomerAccountCode(input: {
  code: string
  codeVerifier: string
  tokenEndpoint: string
}): Promise<CustomerAccountTokenExchange> {
  const config = getCustomerAccountConfig()
  const response = await fetch(input.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: new URL(config.redirectUri).origin,
      'User-Agent': 'Teavision Storefront',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    logEvent('error', 'account_oauth_failed', {
      status: response.status,
      statusText: response.statusText,
      step: 'token-exchange',
    })

    throw new Error('Customer Account token exchange failed')
  }

  const payload = (await response.json()) as CustomerAccountTokenResponse
  if (
    !payload.access_token ||
    !payload.refresh_token ||
    !payload.id_token ||
    typeof payload.expires_in !== 'number'
  ) {
    logEvent('error', 'account_oauth_failed', {
      status: 'invalid-token-response',
      step: 'token-exchange',
    })

    throw new Error('Customer Account token exchange returned invalid tokens')
  }

  return {
    accessToken: payload.access_token,
    expiresIn: payload.expires_in,
    idToken: payload.id_token,
    refreshToken: payload.refresh_token,
  }
}
