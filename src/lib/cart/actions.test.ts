import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  syncCartBuyerIdentity,
  updateCartNote,
  updateCartLines,
} from '@/lib/shopify/operations/cart'
import { getCustomerAccountSession } from '@/lib/shopify/customer-account/session'
import { logEvent } from '@/lib/observability/logger'
import { hashIdentifier } from '@/lib/observability/redact'
import { makeCart } from '@/tests/fixtures/shopify/cart'

import {
  addToCartAction,
  cartLineFormAction,
  getCartIdFromCookie,
  prepareCheckoutHandoff,
  removeCartLineAction,
  syncCartBuyerIdentityForCurrentSession,
  updateCartLineAction,
} from './actions'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/shopify/operations/cart', () => ({
  addCartLines: vi.fn(),
  createCart: vi.fn(),
  getCart: vi.fn(),
  removeCartLines: vi.fn(),
  syncCartBuyerIdentity: vi.fn(),
  updateCartNote: vi.fn(),
  updateCartLines: vi.fn(),
}))

vi.mock('@/lib/shopify/customer-account/session', () => ({
  getCustomerAccountSession: vi.fn(),
}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

type CookieStore = {
  delete: Mock<(name: string) => void>
  get: Mock<(name: string) => { value: string } | undefined>
  set: Mock<
    (
      name: string,
      value: string,
      options: {
        httpOnly: boolean
        path: string
        sameSite: 'lax'
        secure: boolean
      },
    ) => void
  >
}

function makeCookieStore(cartId?: string): CookieStore {
  return {
    delete: vi.fn(),
    get: vi.fn((name) =>
      name === 'teavision_cart' && cartId ? { value: cartId } : undefined,
    ),
    set: vi.fn(),
  }
}

const cookiesMock = cookies as unknown as Mock<() => Promise<CookieStore>>
const revalidatePathMock = revalidatePath as unknown as Mock<
  (path: string) => void
>
const getCartMock = getCart as unknown as Mock<
  (cartId: string) => Promise<ReturnType<typeof makeCart> | null>
>
const createCartMock = createCart as unknown as Mock<typeof createCart>
const addCartLinesMock = addCartLines as unknown as Mock<
  (
    cartId: string,
    lines: Array<{ merchandiseId: string; quantity: number }>,
  ) => Promise<ReturnType<typeof makeCart>>
>
const updateCartLinesMock = updateCartLines as unknown as Mock<
  (
    cartId: string,
    lines: Array<{ id: string; quantity: number }>,
  ) => Promise<ReturnType<typeof makeCart>>
>
const removeCartLinesMock = removeCartLines as unknown as Mock<
  (cartId: string, lineIds: string[]) => Promise<ReturnType<typeof makeCart>>
>
const syncCartBuyerIdentityMock = syncCartBuyerIdentity as unknown as Mock<
  typeof syncCartBuyerIdentity
>
const updateCartNoteMock = updateCartNote as unknown as Mock<
  typeof updateCartNote
>
const getCustomerAccountSessionMock =
  getCustomerAccountSession as unknown as Mock<typeof getCustomerAccountSession>
const logEventMock = logEvent as unknown as Mock<typeof logEvent>

describe('cart Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NODE_ENV', 'test')
    getCustomerAccountSessionMock.mockResolvedValue(null)
    updateCartNoteMock.mockResolvedValue(makeCart())
  })

  test('addToCartAction creates a cart, sets the cookie, adds a line, and revalidates cart', async () => {
    const cookieStore = makeCookieStore()
    const createdCart = makeCart({ id: 'gid://shopify/Cart/new-cart' })
    const nextCart = makeCart({ id: createdCart.id, totalQuantity: 2 })
    cookiesMock.mockResolvedValue(cookieStore)
    createCartMock.mockResolvedValue(createdCart)
    addCartLinesMock.mockResolvedValue(nextCart)

    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', 2),
    ).resolves.toBe(nextCart)

    expect(createCartMock).toHaveBeenCalledTimes(1)
    expect(cookieStore.set).toHaveBeenCalledWith(
      'teavision_cart',
      createdCart.id,
      {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    )
    expect(addCartLinesMock).toHaveBeenCalledWith(createdCart.id, [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 2 },
    ])
    expect(revalidatePathMock).toHaveBeenCalledWith('/cart')
  })

  test('addToCartAction creates a signed-in cart with buyer identity', async () => {
    const cookieStore = makeCookieStore()
    const createdCart = makeCart({ id: 'gid://shopify/Cart/new-cart' })
    const nextCart = makeCart({ id: createdCart.id, totalQuantity: 2 })
    cookiesMock.mockResolvedValue(cookieStore)
    getCustomerAccountSessionMock.mockResolvedValue({
      accessToken: 'customer-access-token',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    })
    createCartMock.mockResolvedValue(createdCart)
    addCartLinesMock.mockResolvedValue(nextCart)

    await addToCartAction('gid://shopify/ProductVariant/1', 2)

    expect(createCartMock).toHaveBeenCalledWith({
      buyerIdentity: { customerAccessToken: 'customer-access-token' },
    })
  })

  test('addToCartAction reuses an existing cart cookie', async () => {
    const cookieStore = makeCookieStore('gid://shopify/Cart/existing')
    const existingCart = makeCart({ id: 'gid://shopify/Cart/existing' })
    cookiesMock.mockResolvedValue(cookieStore)
    getCartMock.mockResolvedValue(existingCart)
    addCartLinesMock.mockResolvedValue(makeCart({ id: existingCart.id }))

    await addToCartAction('gid://shopify/ProductVariant/1', 1)

    expect(createCartMock).not.toHaveBeenCalled()
    expect(addCartLinesMock).toHaveBeenCalledWith(existingCart.id, [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])
  })

  test('getCartIdFromCookie reads only the cart cookie', async () => {
    cookiesMock.mockResolvedValue(makeCookieStore('gid://shopify/Cart/current'))

    await expect(getCartIdFromCookie()).resolves.toBe(
      'gid://shopify/Cart/current',
    )
  })

  test('syncCartBuyerIdentityForCurrentSession does not create an empty cart without a cart cookie', async () => {
    cookiesMock.mockResolvedValue(makeCookieStore())
    getCustomerAccountSessionMock.mockResolvedValue({
      accessToken: 'customer-access-token',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    })

    await expect(syncCartBuyerIdentityForCurrentSession()).resolves.toEqual({
      cart: null,
      message: null,
      synced: false,
    })
    expect(createCartMock).not.toHaveBeenCalled()
    expect(syncCartBuyerIdentityMock).not.toHaveBeenCalled()
  })

  test('syncCartBuyerIdentityForCurrentSession syncs an existing cart when signed in', async () => {
    const syncedCart = makeCart({
      checkoutUrl: 'https://checkout.test/cart/synced',
    })
    cookiesMock.mockResolvedValue(makeCookieStore('gid://shopify/Cart/current'))
    getCustomerAccountSessionMock.mockResolvedValue({
      accessToken: 'customer-access-token',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    })
    syncCartBuyerIdentityMock.mockResolvedValue(syncedCart)

    await expect(syncCartBuyerIdentityForCurrentSession()).resolves.toEqual({
      cart: syncedCart,
      message: null,
      synced: true,
    })
    expect(syncCartBuyerIdentityMock).toHaveBeenCalledWith(
      'gid://shopify/Cart/current',
      { customerAccessToken: 'customer-access-token' },
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/cart')
  })

  test('prepareCheckoutHandoff blocks checkout when identity sync fails', async () => {
    const cart = makeCart({ id: 'gid://shopify/Cart/current' })
    cookiesMock.mockResolvedValue(makeCookieStore(cart.id))
    getCartMock.mockResolvedValue(cart)
    getCustomerAccountSessionMock.mockResolvedValue({
      accessToken: 'customer-access-token',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    })
    syncCartBuyerIdentityMock.mockRejectedValue(new Error('sync failed'))

    await expect(prepareCheckoutHandoff(true)).resolves.toEqual({
      cartIdHash: hashIdentifier(cart.id),
      message:
        'We could not confirm your account for checkout. Retry checkout or sign in again before continuing.',
      status: 'identity-sync-failed',
    })
    expect(logEventMock).toHaveBeenCalledWith(
      'error',
      'cart_buyer_identity_sync_failed',
      {
        cartIdHash: hashIdentifier(cart.id),
      },
    )
    expect(JSON.stringify(logEventMock.mock.calls)).not.toContain(
      'customer-access-token',
    )
  })

  test('prepareCheckoutHandoff uses the refreshed checkout URL after buyer identity sync', async () => {
    const cart = makeCart({
      checkoutUrl: 'https://checkout.test/cart/original',
      id: 'gid://shopify/Cart/current',
    })
    const syncedCart = makeCart({
      checkoutUrl: 'https://checkout.test/cart/synced',
      id: cart.id,
    })
    cookiesMock.mockResolvedValue(makeCookieStore(cart.id))
    getCartMock.mockResolvedValue(cart)
    getCustomerAccountSessionMock.mockResolvedValue({
      accessToken: 'customer-access-token',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'refresh-token',
    })
    syncCartBuyerIdentityMock.mockResolvedValue(syncedCart)
    updateCartNoteMock.mockResolvedValue(syncedCart)

    await expect(prepareCheckoutHandoff(true)).resolves.toEqual({
      cartIdHash: hashIdentifier(cart.id),
      checkoutUrl: syncedCart.checkoutUrl,
      status: 'ready',
    })
    expect(updateCartNoteMock).toHaveBeenCalledWith(cart.id, '')
  })

  test('prepareCheckoutHandoff saves the note before returning the checkout URL', async () => {
    const cart = makeCart({ id: 'gid://shopify/Cart/current' })
    const updatedCart = makeCart({
      checkoutUrl: 'https://checkout.test/cart/note-saved',
      id: cart.id,
    })
    cookiesMock.mockResolvedValue(makeCookieStore(cart.id))
    getCartMock.mockResolvedValue(cart)
    updateCartNoteMock.mockResolvedValue(updatedCart)

    await expect(
      prepareCheckoutHandoff(true, '  Keep this separate  '),
    ).resolves.toEqual({
      cartIdHash: hashIdentifier(cart.id),
      checkoutUrl: updatedCart.checkoutUrl,
      status: 'ready',
    })
    expect(updateCartNoteMock).toHaveBeenCalledWith(
      cart.id,
      'Keep this separate',
    )
  })

  test('prepareCheckoutHandoff blocks checkout when the note cannot be saved', async () => {
    const cart = makeCart({ id: 'gid://shopify/Cart/current' })
    cookiesMock.mockResolvedValue(makeCookieStore(cart.id))
    getCartMock.mockResolvedValue(cart)
    updateCartNoteMock.mockRejectedValue(new Error('Note is too long'))

    await expect(
      prepareCheckoutHandoff(true, 'Keep this separate'),
    ).resolves.toEqual({
      cartIdHash: hashIdentifier(cart.id),
      status: 'note-update-failed',
    })
    expect(JSON.stringify(logEventMock.mock.calls)).not.toContain(
      'Keep this separate',
    )
  })

  test('prepareCheckoutHandoff redirects only after terms and cart are valid', async () => {
    const cart = makeCart({ id: 'gid://shopify/Cart/current' })
    cookiesMock.mockResolvedValue(makeCookieStore(cart.id))
    getCartMock.mockResolvedValue(cart)

    await expect(prepareCheckoutHandoff(false)).resolves.toEqual({
      status: 'terms-required',
    })
    await expect(prepareCheckoutHandoff(true)).resolves.toEqual({
      cartIdHash: hashIdentifier(cart.id),
      checkoutUrl: cart.checkoutUrl,
      status: 'ready',
    })
  })

  test('addToCartAction deletes stale null carts and creates a replacement', async () => {
    const cookieStore = makeCookieStore('gid://shopify/Cart/stale')
    const replacementCart = makeCart({ id: 'gid://shopify/Cart/replacement' })
    cookiesMock.mockResolvedValue(cookieStore)
    getCartMock.mockResolvedValue(null)
    createCartMock.mockResolvedValue(replacementCart)
    addCartLinesMock.mockResolvedValue(replacementCart)

    await addToCartAction('gid://shopify/ProductVariant/1', 1)

    expect(cookieStore.delete).toHaveBeenCalledWith('teavision_cart')
    expect(cookieStore.set).toHaveBeenCalledWith(
      'teavision_cart',
      replacementCart.id,
      expect.objectContaining({ httpOnly: true }),
    )
  })

  test('addToCartAction documents quantity normalization and safe max-quantity error mapping', async () => {
    const cookieStore = makeCookieStore()
    const cart = makeCart()
    cookiesMock.mockResolvedValue(cookieStore)
    createCartMock.mockResolvedValue(cart)
    addCartLinesMock.mockResolvedValue(cart)

    await addToCartAction('gid://shopify/ProductVariant/1', 1.9)
    expect(addCartLinesMock).toHaveBeenCalledWith(cart.id, [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 1 },
    ])

    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', 0),
    ).rejects.toThrow('Quantity must be at least 1.')
    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', -1),
    ).rejects.toThrow('Quantity must be at least 1.')
    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', Number.NaN),
    ).rejects.toThrow('Quantity must be a whole number.')
    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', Infinity),
    ).rejects.toThrow('Quantity must be a whole number.')

    addCartLinesMock.mockRejectedValueOnce(
      new Error('not enough merchandise available'),
    )
    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', 1),
    ).rejects.toThrow('Maximum quantity available reached.')
  })

  test('stale cart read errors are surfaced instead of hidden', async () => {
    const cookieStore = makeCookieStore('gid://shopify/Cart/stale')
    cookiesMock.mockResolvedValue(cookieStore)
    getCartMock.mockRejectedValue(new Error('Cart does not exist'))

    await expect(
      addToCartAction('gid://shopify/ProductVariant/1', 1),
    ).rejects.toThrow('Cart does not exist')
  })

  test('update and remove require a cart cookie and revalidate after mutation', async () => {
    const cookieStore = makeCookieStore('gid://shopify/Cart/existing')
    cookiesMock.mockResolvedValue(cookieStore)
    updateCartLinesMock.mockResolvedValue(makeCart())
    removeCartLinesMock.mockResolvedValue(makeCart())

    await updateCartLineAction('gid://shopify/CartLine/1', 3)
    await removeCartLineAction('gid://shopify/CartLine/1')

    expect(updateCartLinesMock).toHaveBeenCalledWith(
      'gid://shopify/Cart/existing',
      [{ id: 'gid://shopify/CartLine/1', quantity: 3 }],
    )
    expect(removeCartLinesMock).toHaveBeenCalledWith(
      'gid://shopify/Cart/existing',
      ['gid://shopify/CartLine/1'],
    )
    expect(revalidatePathMock).toHaveBeenCalledWith('/cart')

    cookiesMock.mockResolvedValue(makeCookieStore())
    await expect(
      updateCartLineAction('gid://shopify/CartLine/1', 2),
    ).rejects.toThrow('Your cart session has expired')
    await expect(
      removeCartLineAction('gid://shopify/CartLine/1'),
    ).rejects.toThrow('Your cart session has expired')
  })

  test('cartLineFormAction handles intents, invalid form data, and thrown errors safely', async () => {
    const cookieStore = makeCookieStore('gid://shopify/Cart/existing')
    cookiesMock.mockResolvedValue(cookieStore)
    updateCartLinesMock.mockResolvedValue(makeCart())
    removeCartLinesMock.mockResolvedValue(makeCart())

    const updateForm = new FormData()
    updateForm.set('intent', 'update')
    updateForm.set('lineId', 'gid://shopify/CartLine/1')
    updateForm.set('quantity', '2')
    await expect(
      cartLineFormAction({ message: 'old' }, updateForm),
    ).resolves.toEqual({ cartChanged: true, message: null })

    const removeForm = new FormData()
    removeForm.set('intent', 'remove')
    removeForm.set('lineId', 'gid://shopify/CartLine/1')
    await expect(
      cartLineFormAction({ message: null }, removeForm),
    ).resolves.toEqual({ cartChanged: true, message: null })

    const invalidForm = new FormData()
    invalidForm.set('intent', 'update')
    await expect(
      cartLineFormAction({ message: null }, invalidForm),
    ).resolves.toEqual({
      cartChanged: false,
      message:
        'We could not read that cart request. Refresh the page and try again.',
    })

    updateCartLinesMock.mockRejectedValueOnce(new Error('network down'))
    await expect(
      cartLineFormAction({ message: null }, updateForm),
    ).resolves.toEqual({
      cartChanged: false,
      message: 'We could not update your cart. Please try again.',
    })
  })
})
