import type {
  Cart,
  CartLine,
  CartLineDiscountAllocation,
  Money,
} from '@/lib/shopify/types'

import { makeMoney } from './money'

type ShopifyDiscountAllocation =
  | {
      __typename: 'CartAutomaticDiscountAllocation'
      title: string | null
      discountedAmount: Money
    }
  | {
      __typename: 'CartCustomDiscountAllocation'
      title: string | null
      discountedAmount: Money
    }
  | {
      __typename: 'CartCodeDiscountAllocation'
      code: string
      discountedAmount: Money
    }
  | {
      __typename: 'UnknownDiscountAllocation'
      discountedAmount: Money
    }

export type ShopifyCartPayload = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  buyerIdentity: {
    countryCode: string | null
    customer: { id: string } | null
    email: string | null
    phone: string | null
  }
  cost: {
    totalAmount: Money
    subtotalAmount: Money
  }
  lines: {
    edges: Array<{
      node: {
        id: string
        quantity: number
        cost: CartLine['cost']
        discountAllocations: ShopifyDiscountAllocation[]
        merchandise: {
          id: string
          title: string
          currentlyNotInStock?: boolean
          price: Money
          quantityAvailable?: number | null
          quantityRule?: CartLine['merchandise']['quantityRule']
          quantityPriceBreaks: {
            nodes: CartLine['merchandise']['quantityPriceBreaks']
          }
          product: {
            handle: string
            title: string
            featuredImage: CartLine['merchandise']['product']['featuredImage']
          }
        }
      }
    }>
  }
}

export function makeDiscountAllocation(
  overrides: Partial<CartLineDiscountAllocation> = {},
): CartLineDiscountAllocation {
  return {
    title: 'Bulk discount',
    discountedAmount: makeMoney('2.00'),
    ...overrides,
  }
}

export function makeCartLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: 'gid://shopify/CartLine/test-line-1',
    quantity: 1,
    cost: {
      amountPerQuantity: makeMoney('24.00'),
      compareAtAmountPerQuantity: null,
      subtotalAmount: makeMoney('24.00'),
      totalAmount: makeMoney('24.00'),
    },
    discountAllocations: [],
    merchandise: {
      id: 'gid://shopify/ProductVariant/test-variant-1',
      title: '1kg',
      currentlyNotInStock: false,
      price: makeMoney('24.00'),
      quantityAvailable: null,
      quantityRule: {
        minimum: 1,
        maximum: null,
        increment: 1,
      },
      quantityPriceBreaks: [],
      product: {
        handle: 'test-standard-tea',
        title: 'Test Standard Tea',
        featuredImage: {
          url: 'https://cdn.shopify.com/s/files/1/0000/0001/products/test-tea.jpg',
          altText: 'Loose tea',
          width: 800,
          height: 800,
        },
      },
    },
    ...overrides,
  }
}

export function makeCart(overrides: Partial<Cart> = {}): Cart {
  const lines = overrides.lines ?? [makeCartLine()]
  const totalQuantity =
    overrides.totalQuantity ??
    lines.reduce((total, line) => total + line.quantity, 0)

  return {
    id: 'gid://shopify/Cart/test-cart',
    checkoutUrl: 'https://checkout.test/cart/test-cart',
    totalQuantity,
    buyerIdentity: {
      customerId: null,
    },
    cost: {
      totalAmount: makeMoney('24.00'),
      subtotalAmount: makeMoney('24.00'),
    },
    lines,
    ...overrides,
  }
}

function makeShopifyDiscountAllocation(
  discount: CartLineDiscountAllocation,
): ShopifyDiscountAllocation {
  if (discount.title === null) {
    return {
      __typename: 'UnknownDiscountAllocation',
      discountedAmount: discount.discountedAmount,
    }
  }

  if (discount.title.startsWith('CODE:')) {
    return {
      __typename: 'CartCodeDiscountAllocation',
      code: discount.title.replace('CODE:', ''),
      discountedAmount: discount.discountedAmount,
    }
  }

  return {
    __typename: 'CartAutomaticDiscountAllocation',
    title: discount.title,
    discountedAmount: discount.discountedAmount,
  }
}

export function makeShopifyCartPayload(
  cart: Cart = makeCart(),
  buyerIdentity: ShopifyCartPayload['buyerIdentity'] = {
    countryCode: null,
    customer: null,
    email: null,
    phone: null,
  },
): ShopifyCartPayload {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    buyerIdentity,
    cost: cart.cost,
    lines: {
      edges: cart.lines.map((line) => ({
        node: {
          id: line.id,
          quantity: line.quantity,
          cost: line.cost,
          discountAllocations: line.discountAllocations.map(
            makeShopifyDiscountAllocation,
          ),
          merchandise: {
            ...line.merchandise,
            quantityPriceBreaks: {
              nodes: line.merchandise.quantityPriceBreaks,
            },
          },
        },
      })),
    },
  }
}
