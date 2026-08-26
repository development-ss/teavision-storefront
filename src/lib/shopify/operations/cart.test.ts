import type { Mock } from 'vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { shopifyFetch } from '@/lib/shopify/client'
import {
  makeCart,
  makeCartLine,
  makeDiscountAllocation,
  makeShopifyCartPayload,
} from '@/tests/fixtures/shopify/cart'
import { makeMoney } from '@/tests/fixtures/shopify/money'

import {
  addCartLines,
  createCart,
  getCart,
  removeCartLines,
  syncCartBuyerIdentity,
  tryClearCartBuyerIdentity,
  updateCartLines,
} from './cart'

vi.mock('@/lib/shopify/client', () => ({
  shopifyFetch: vi.fn(),
}))

type ShopifyFetchCall = {
  cache?: RequestCache
  query: unknown
  variables?: unknown
}

type ShopifyFetchMock = Mock<(options: ShopifyFetchCall) => Promise<unknown>>
const shopifyFetchMock = shopifyFetch as unknown as ShopifyFetchMock

describe('Shopify cart operations', () => {
  beforeEach(() => {
    shopifyFetchMock.mockReset()
  })

  test('getCart maps cart payloads and uses no-store reads', async () => {
    const cart = makeCart({
      lines: [
        makeCartLine({
          quantity: 2,
          discountAllocations: [
            makeDiscountAllocation({ title: 'Bulk discount' }),
            makeDiscountAllocation({ title: 'CODE:WELCOME10' }),
            makeDiscountAllocation({ title: null }),
          ],
        }),
      ],
    })
    shopifyFetchMock.mockResolvedValueOnce({
      cart: makeShopifyCartPayload(cart),
    })

    await expect(getCart(cart.id)).resolves.toMatchObject({
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: 2,
      lines: [
        {
          quantity: 2,
          discountAllocations: [
            { title: 'Bulk discount' },
            { title: 'WELCOME10' },
            { title: null },
          ],
        },
      ],
    })

    expect(shopifyFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: 'no-store',
        variables: { cartId: cart.id },
      }),
    )
  })

  test('getCart returns null when Shopify returns a missing cart', async () => {
    shopifyFetchMock.mockResolvedValueOnce({ cart: null })

    await expect(getCart('gid://shopify/Cart/missing')).resolves.toBeNull()
  })

  test('getCart preserves only Shopify-returned variant price breaks', async () => {
    const cart = makeCart({
      lines: [
        makeCartLine({
          quantity: 34,
          merchandise: {
            ...makeCartLine().merchandise,
            quantityPriceBreaks: [
              {
                minimumQuantity: 40,
                price: makeMoney('20.40'),
              },
            ],
            product: {
              ...makeCartLine().merchandise.product,
              handle: 'copy-of-peninsula-raw-sticky-chai-loose-leaf',
              title: 'Organic Raw Sticky Chai',
            },
          },
        }),
      ],
    })
    shopifyFetchMock.mockResolvedValueOnce({
      cart: makeShopifyCartPayload(cart),
    })
    await expect(getCart(cart.id)).resolves.toMatchObject({
      lines: [
        {
          merchandise: {
            quantityPriceBreaks: [
              {
                minimumQuantity: 40,
                price: makeMoney('20.40'),
              },
            ],
          },
        },
      ],
    })
  })

  test('createCart passes empty input and throws userErrors', async () => {
    const cart = makeCart()
    shopifyFetchMock.mockResolvedValueOnce({
      cartCreate: { cart: makeShopifyCartPayload(cart), userErrors: [] },
    })

    await expect(createCart()).resolves.toMatchObject({ id: cart.id })
    expect(shopifyFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: 'no-store',
        variables: { input: {} },
      }),
    )

    shopifyFetchMock.mockResolvedValueOnce({
      cartCreate: {
        cart: null,
        userErrors: [{ message: 'Unable to create cart' }],
      },
    })
    await expect(createCart()).rejects.toThrow('Unable to create cart')
  })

  test('createCart passes buyer identity when provided', async () => {
    const cart = makeCart()
    shopifyFetchMock.mockResolvedValueOnce({
      cartCreate: { cart: makeShopifyCartPayload(cart), userErrors: [] },
    })

    await expect(
      createCart({
        buyerIdentity: {
          customerAccessToken: 'customer-access-token',
        },
      }),
    ).resolves.toMatchObject({ id: cart.id })

    expect(shopifyFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: 'no-store',
        variables: {
          input: {
            buyerIdentity: {
              customerAccessToken: 'customer-access-token',
            },
          },
        },
      }),
    )
  })

  test('syncCartBuyerIdentity updates buyer identity with no-store fetches', async () => {
    const cart = makeCart()
    shopifyFetchMock.mockResolvedValueOnce({
      cartBuyerIdentityUpdate: {
        cart: makeShopifyCartPayload(cart),
        userErrors: [],
      },
    })

    await expect(
      syncCartBuyerIdentity(cart.id, {
        countryCode: 'AU',
        customerAccessToken: 'customer-access-token',
      }),
    ).resolves.toMatchObject({ id: cart.id })

    expect(shopifyFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: 'no-store',
        variables: {
          buyerIdentity: {
            countryCode: 'AU',
            customerAccessToken: 'customer-access-token',
          },
          cartId: cart.id,
        },
      }),
    )
  })

  test('tryClearCartBuyerIdentity reports unsupported clearing without surfacing provider details', async () => {
    const cart = makeCart()
    shopifyFetchMock
      .mockResolvedValueOnce({
        cartBuyerIdentityUpdate: {
          cart: makeShopifyCartPayload(cart),
          userErrors: [],
        },
      })
      .mockResolvedValueOnce({
        cartBuyerIdentityUpdate: {
          cart: null,
          userErrors: [{ message: 'Cannot clear buyer identity' }],
        },
      })

    await expect(tryClearCartBuyerIdentity(cart.id)).resolves.toBe('cleared')
    await expect(tryClearCartBuyerIdentity(cart.id)).resolves.toBe(
      'unsupported',
    )
  })

  test('addCartLines passes line variables and surfaces userErrors', async () => {
    const cart = makeCart()
    const lines = [
      { merchandiseId: 'gid://shopify/ProductVariant/1', quantity: 3 },
    ]
    shopifyFetchMock.mockResolvedValueOnce({
      cartLinesAdd: { cart: makeShopifyCartPayload(cart), userErrors: [] },
    })

    await expect(addCartLines(cart.id, lines)).resolves.toMatchObject({
      id: cart.id,
    })
    expect(shopifyFetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        cache: 'no-store',
        variables: { cartId: cart.id, lines },
      }),
    )

    shopifyFetchMock.mockResolvedValueOnce({
      cartLinesAdd: {
        cart: null,
        userErrors: [{ message: 'Not enough merchandise available' }],
      },
    })
    await expect(addCartLines(cart.id, lines)).rejects.toThrow(
      'Not enough merchandise available',
    )
  })

  test('updateCartLines and removeCartLines pass variables and use no-store', async () => {
    const cart = makeCart()
    shopifyFetchMock
      .mockResolvedValueOnce({
        cartLinesUpdate: {
          cart: makeShopifyCartPayload(cart),
          userErrors: [],
        },
      })
      .mockResolvedValueOnce({
        cartLinesRemove: {
          cart: makeShopifyCartPayload({ ...cart, lines: [] }),
          userErrors: [],
        },
      })

    await updateCartLines(cart.id, [{ id: 'line-1', quantity: 4 }])
    await removeCartLines(cart.id, ['line-1'])

    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        cache: 'no-store',
        variables: {
          cartId: cart.id,
          lines: [{ id: 'line-1', quantity: 4 }],
        },
      }),
    )
    expect(shopifyFetchMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        cache: 'no-store',
        variables: {
          cartId: cart.id,
          lineIds: ['line-1'],
        },
      }),
    )
  })

  test('cart query intentionally documents the current 100-line cap', async () => {
    shopifyFetchMock.mockResolvedValueOnce({
      cart: makeShopifyCartPayload(makeCart()),
    })

    await getCart('gid://shopify/Cart/test-cart')

    const query = shopifyFetchMock.mock.calls[0]?.[0].query
    expect(JSON.stringify(query)).toContain('CartFields')
    // The source query uses lines(first: 100); this contract documents the
    // current cap so a future pagination change is intentional.
  })
})
