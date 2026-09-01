import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'
import { prepareCheckoutHandoff } from '@/lib/cart/actions'
import { getCustomerAccountSession } from '@/lib/shopify/customer-account/session'

import { POST } from './route'

vi.mock('@/lib/cart/actions', () => ({
  prepareCheckoutHandoff: vi.fn(),
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

vi.mock('@/lib/shopify/customer-account/session', () => ({
  getCustomerAccountSession: vi.fn(async () => ({
    accessToken: 'token',
    refreshToken: 'refresh',
    idToken: 'id',
    expiresAt: Date.now() + 60_000,
    customerId: 'customer-1',
  })),
}))

const prepareCheckoutHandoffMock = prepareCheckoutHandoff as unknown as Mock<
  typeof prepareCheckoutHandoff
>
const logEventMock = logEvent as unknown as Mock<typeof logEvent>
const getCustomerAccountSessionMock =
  getCustomerAccountSession as unknown as Mock<typeof getCustomerAccountSession>

function makeCheckoutRequest(terms = 'accepted', note?: string): Request {
  const formData = new FormData()
  if (terms) formData.set('terms', terms)
  if (note !== undefined) formData.set('note', note)

  return new Request('https://teavision.test/cart/checkout', {
    body: formData,
    method: 'POST',
  })
}

describe('cart checkout route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCustomerAccountSessionMock.mockResolvedValue({
      accessToken: 'token',
      refreshToken: 'refresh',
      idToken: 'id',
      expiresAt: Date.now() + 60_000,
      customerId: 'customer-1',
    })
  })

  test('redirects missing carts back to cart recovery', async () => {
    prepareCheckoutHandoffMock.mockResolvedValue({ status: 'missing-cart' })

    const response = await POST(makeCheckoutRequest())

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/cart?checkout=missing-cart',
    )
  })

  test('redirects guests to sign in before checkout', async () => {
    getCustomerAccountSessionMock.mockResolvedValue(null)

    const response = await POST(makeCheckoutRequest())

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/account/login?returnTo=%2Fcart',
    )
    expect(prepareCheckoutHandoffMock).not.toHaveBeenCalled()
  })

  test('requires submitted checkout terms', async () => {
    prepareCheckoutHandoffMock.mockResolvedValue({ status: 'terms-required' })

    const response = await POST(makeCheckoutRequest(''))

    expect(prepareCheckoutHandoffMock).toHaveBeenCalledWith(false, '')
    expect(response.headers.get('location')).toBe(
      'https://teavision.test/cart?checkout=terms-required',
    )
  })

  test('redirects to blocked cart state when identity sync fails', async () => {
    prepareCheckoutHandoffMock.mockResolvedValue({
      cartIdHash: 'cart-hash',
      message:
        'We could not confirm your account for checkout. Retry checkout or sign in again before continuing.',
      status: 'identity-sync-failed',
    })

    const response = await POST(makeCheckoutRequest())

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/cart?checkout=identity-sync-failed',
    )
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'checkout_handoff_failed',
      {
        cartIdHash: 'cart-hash',
        status: 'identity-sync-failed',
      },
    )
  })

  test('redirects to fake checkout only after handoff is ready', async () => {
    prepareCheckoutHandoffMock.mockResolvedValue({
      cartIdHash: 'cart-hash',
      checkoutUrl: 'https://checkout.test/cart/fake-cart',
      status: 'ready',
    })

    const response = await POST(makeCheckoutRequest())

    expect(response.headers.get('location')).toBe(
      'https://checkout.test/cart/fake-cart',
    )
    expect(prepareCheckoutHandoffMock).toHaveBeenCalledWith(true, '')
    expect(logEventMock).toHaveBeenCalledWith(
      'info',
      'checkout_handoff_ready',
      {
        cartIdHash: 'cart-hash',
        status: 'ready',
      },
    )
    expect(JSON.stringify(logEventMock.mock.calls)).not.toContain(
      'https://checkout.test/cart/fake-cart',
    )
  })

  test('forwards a trimmed note to the checkout handoff', async () => {
    prepareCheckoutHandoffMock.mockResolvedValue({
      cartIdHash: 'cart-hash',
      checkoutUrl: 'https://checkout.test/cart/fake-cart',
      status: 'ready',
    })

    await POST(makeCheckoutRequest('accepted', '  Keep this dry  '))

    expect(prepareCheckoutHandoffMock).toHaveBeenCalledWith(
      true,
      'Keep this dry',
    )
  })

  test('redirects back when the cart note cannot be saved', async () => {
    prepareCheckoutHandoffMock.mockResolvedValue({
      cartIdHash: 'cart-hash',
      status: 'note-update-failed',
    })

    const response = await POST(makeCheckoutRequest('accepted', 'Keep dry'))

    expect(response.headers.get('location')).toBe(
      'https://teavision.test/cart?checkout=note-update-failed',
    )
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'checkout_handoff_failed',
      {
        cartIdHash: 'cart-hash',
        status: 'note-update-failed',
      },
    )
  })
})
