import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { CUSTOMER_SESSION_COOKIE } from '@/lib/shopify/customer-account/session'

import { proxy } from './proxy'

function accountRequest(path: string, sessionCookie?: string): NextRequest {
  return new NextRequest(`https://www.teavision.com.au${path}`, {
    headers: sessionCookie
      ? { cookie: `${CUSTOMER_SESSION_COOKIE}=${sessionCookie}` }
      : undefined,
  })
}

describe('account proxy', () => {
  it.each([
    '/account',
    '/account/profile',
    '/account/orders/123',
    '/account/addresses/new',
  ])('redirects a guest request for %s before rendering', (path) => {
    const response = proxy(accountRequest(path))
    const location = response.headers.get('location')

    expect(response.status).toBe(307)
    expect(location).toBe(
      `https://www.teavision.com.au/account/login?returnTo=${encodeURIComponent(path)}`,
    )
  })

  it.each([
    '/account/login',
    '/account/register',
    '/account/recover',
    '/account/activate/123',
    '/account/reset/123',
    '/account/legacy-route',
  ])('allows the public account route %s', (path) => {
    const response = proxy(accountRequest(path))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('allows protected routes through when a session cookie exists', () => {
    const response = proxy(accountRequest('/account/orders', 'sealed-session'))

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('preserves the query string in the login return path', () => {
    const response = proxy(accountRequest('/account/orders?after=cursor'))
    const location = response.headers.get('location')

    expect(location).toBe(
      'https://www.teavision.com.au/account/login?returnTo=%2Faccount%2Forders%3Fafter%3Dcursor',
    )
  })
})
