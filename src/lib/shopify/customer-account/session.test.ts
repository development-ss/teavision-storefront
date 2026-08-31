import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  sealCustomerSession,
  unsealCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  setCustomerAccountSession,
} from './session'

const cookieState = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => cookieState),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`redirect:${url}`)
  }),
}))

describe('Customer Account session sealing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE', 'true')
    vi.stubEnv(
      'SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET',
      'test-session-secret-with-at-least-32-characters',
    )
  })

  test('preserves expiresAt after sealing and unsealing', () => {
    const expiresAt = Date.now() + 60000
    const sealed = sealCustomerSession({
      accessToken: 'customer-access-token',
      customerId: 'gid://shopify/Customer/test-customer-1',
      expiresAt,
      idToken: 'id-token',
      refreshToken: 'customer-refresh-token',
    })

    expect(unsealCustomerSession(sealed)).toMatchObject({ expiresAt })
  })

  test('rejects tampered cookie strings', () => {
    const sealed = sealCustomerSession({
      accessToken: 'customer-access-token',
      customerId: 'gid://shopify/Customer/test-customer-1',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'customer-refresh-token',
    })

    expect(unsealCustomerSession(`${sealed}tampered`)).toBeNull()
  })

  test('rejects legacy sessions without a customer id', () => {
    const sealed = sealCustomerSession({
      accessToken: 'customer-access-token',
      customerId: '',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'customer-refresh-token',
    })

    expect(unsealCustomerSession(sealed)).toBeNull()
  })

  test('sets the sealed HttpOnly session cookie', async () => {
    await setCustomerAccountSession({
      accessToken: 'customer-access-token',
      customerId: 'gid://shopify/Customer/test-customer-1',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'customer-refresh-token',
    })

    const setCookie = cookieState.set as Mock
    expect(setCookie).toHaveBeenCalledWith(
      CUSTOMER_SESSION_COOKIE,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      }),
    )
  })
})
