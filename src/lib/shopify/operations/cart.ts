import { parse } from 'graphql'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'

import { shopifyFetch } from '@/lib/shopify/client'
import {
  CartBuyerIdentityUpdateDocument,
  CartCreateDocument,
  CartLinesAddDocument,
  CartLinesRemoveDocument,
  CartLinesUpdateDocument,
  type CartBuyerIdentityInput,
  GetCartDocument,
  type Cart,
  type GetCartQuery,
} from '@/lib/shopify/types'

import { reshapeImage, reshapeMoney } from './mappers'

type ShopifyCart = NonNullable<GetCartQuery['cart']>

type ShopifyCartLineNode = ShopifyCart['lines']['edges'][number]['node']

type ShopifyProductVariant = ShopifyCartLineNode['merchandise']

type ShopifyProduct = ShopifyProductVariant['product']

type ShopifyCartLine = Cart['lines'][number]

type ShopifyQuantityPriceBreak =
  ShopifyProductVariant['quantityPriceBreaks']['nodes'][number]

type ShopifyCartLineDiscountAllocation =
  ShopifyCartLineNode['discountAllocations'][number]

type ShopifyUserError = {
  field?: string[] | null
  message: string
}

type CartNoteUpdateMutationVariables = {
  cartId: string
  note: string
}

type CartNoteUpdateMutation = {
  cartNoteUpdate?: {
    cart?: { checkoutUrl: string } | null
    userErrors: ShopifyUserError[]
  } | null
}

const CartNoteUpdateDocument = parse(`
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`) as unknown as TypedDocumentNode<
  CartNoteUpdateMutation,
  CartNoteUpdateMutationVariables
>

export type CartBuyerIdentity = {
  customerAccessToken?: string
  email?: string
  phone?: string
  countryCode?: string
  companyLocationId?: string
}

function toStorefrontBuyerIdentity(
  buyerIdentity: CartBuyerIdentity,
): CartBuyerIdentityInput {
  const input: CartBuyerIdentityInput = {}

  if (buyerIdentity.customerAccessToken) {
    input.customerAccessToken = buyerIdentity.customerAccessToken
  }
  if (buyerIdentity.email) {
    input.email = buyerIdentity.email
  }
  if (buyerIdentity.phone) {
    input.phone = buyerIdentity.phone
  }
  if (buyerIdentity.countryCode) {
    input.countryCode =
      buyerIdentity.countryCode as CartBuyerIdentityInput['countryCode']
  }
  if (buyerIdentity.companyLocationId) {
    input.companyLocationId = buyerIdentity.companyLocationId
  }

  return input
}

function reshapeProduct(
  product: ShopifyProduct,
): ShopifyCartLine['merchandise']['product'] {
  return {
    handle: product.handle,
    title: product.title,
    featuredImage: product.featuredImage
      ? reshapeImage(product.featuredImage)
      : null,
  }
}

function getDiscountAllocationTitle(
  discountAllocation: ShopifyCartLineDiscountAllocation,
): string | null {
  if (discountAllocation.__typename === 'CartCodeDiscountAllocation') {
    return discountAllocation.code
  }

  if (
    discountAllocation.__typename === 'CartAutomaticDiscountAllocation' ||
    discountAllocation.__typename === 'CartCustomDiscountAllocation'
  ) {
    return discountAllocation.title
  }

  return null
}

function reshapeDiscountAllocation(
  discountAllocation: ShopifyCartLineDiscountAllocation,
): ShopifyCartLine['discountAllocations'][number] {
  return {
    title: getDiscountAllocationTitle(discountAllocation),
    discountedAmount: reshapeMoney(discountAllocation.discountedAmount),
  }
}

function reshapeMerchandise(
  merchandise: ShopifyProductVariant,
): ShopifyCartLine['merchandise'] {
  const quantityPriceBreaks: ShopifyCartLine['merchandise']['quantityPriceBreaks'] =
    merchandise.quantityPriceBreaks.nodes.map(
      (priceBreak: ShopifyQuantityPriceBreak) => ({
        minimumQuantity: priceBreak.minimumQuantity,
        price: reshapeMoney(priceBreak.price),
      }),
    )

  return {
    id: merchandise.id,
    title: merchandise.title,
    currentlyNotInStock: merchandise.currentlyNotInStock,
    price: reshapeMoney(merchandise.price),
    quantityRule: {
      minimum: merchandise.quantityRule.minimum,
      maximum: merchandise.quantityRule.maximum ?? null,
      increment: merchandise.quantityRule.increment,
    },
    quantityPriceBreaks: quantityPriceBreaks.sort(
      (a, b) => a.minimumQuantity - b.minimumQuantity,
    ),
    product: reshapeProduct(merchandise.product),
  }
}

function reshapeCart(cart: ShopifyCart): Cart {
  return {
    id: cart.id,
    checkoutUrl: String(cart.checkoutUrl),
    totalQuantity: cart.totalQuantity,
    cost: {
      totalAmount: reshapeMoney(cart.cost.totalAmount),
      subtotalAmount: reshapeMoney(cart.cost.subtotalAmount),
    },
    lines: cart.lines.edges.map((e) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      cost: {
        amountPerQuantity: reshapeMoney(e.node.cost.amountPerQuantity),
        compareAtAmountPerQuantity: e.node.cost.compareAtAmountPerQuantity
          ? reshapeMoney(e.node.cost.compareAtAmountPerQuantity)
          : null,
        subtotalAmount: reshapeMoney(e.node.cost.subtotalAmount),
        totalAmount: reshapeMoney(e.node.cost.totalAmount),
      },
      discountAllocations: e.node.discountAllocations.map(
        reshapeDiscountAllocation,
      ),
      merchandise: reshapeMerchandise(e.node.merchandise),
    })),
  }
}

function handleUserErrors(errors: ShopifyUserError[]): void {
  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join('\n'))
  }
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const data = await shopifyFetch({
    query: GetCartDocument,
    variables: { cartId },
    cache: 'no-store',
  })
  return data.cart ? reshapeCart(data.cart) : null
}

export async function createCart(input?: {
  buyerIdentity?: CartBuyerIdentity
}): Promise<Cart> {
  const data = await shopifyFetch({
    query: CartCreateDocument,
    variables: {
      input: input?.buyerIdentity
        ? { buyerIdentity: toStorefrontBuyerIdentity(input.buyerIdentity) }
        : {},
    },
    cache: 'no-store',
  })
  handleUserErrors(data.cartCreate?.userErrors ?? [])
  if (!data.cartCreate?.cart) throw new Error('Unable to create cart')
  return reshapeCart(data.cartCreate.cart)
}

export async function syncCartBuyerIdentity(
  cartId: string,
  buyerIdentity: CartBuyerIdentity,
): Promise<Cart> {
  const data = await shopifyFetch({
    query: CartBuyerIdentityUpdateDocument,
    variables: {
      cartId,
      buyerIdentity: toStorefrontBuyerIdentity(buyerIdentity),
    },
    cache: 'no-store',
  })
  handleUserErrors(data.cartBuyerIdentityUpdate?.userErrors ?? [])
  if (!data.cartBuyerIdentityUpdate?.cart)
    throw new Error('Unable to update cart buyer identity')

  return reshapeCart(data.cartBuyerIdentityUpdate.cart)
}

export async function tryClearCartBuyerIdentity(
  cartId: string,
): Promise<'cleared' | 'unsupported'> {
  try {
    await syncCartBuyerIdentity(cartId, {})
    return 'cleared'
  } catch {
    return 'unsupported'
  }
}

export async function addCartLines(
  cartId: string,
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<Cart> {
  const data = await shopifyFetch({
    query: CartLinesAddDocument,
    variables: { cartId, lines },
    cache: 'no-store',
  })
  handleUserErrors(data.cartLinesAdd?.userErrors ?? [])
  if (!data.cartLinesAdd?.cart) throw new Error('Unable to add cart lines')
  return reshapeCart(data.cartLinesAdd.cart)
}

export async function updateCartLines(
  cartId: string,
  lines: Array<{ id: string; quantity: number }>,
): Promise<Cart> {
  const data = await shopifyFetch({
    query: CartLinesUpdateDocument,
    variables: { cartId, lines },
    cache: 'no-store',
  })
  handleUserErrors(data.cartLinesUpdate?.userErrors ?? [])
  if (!data.cartLinesUpdate?.cart)
    throw new Error('Unable to update cart lines')
  return reshapeCart(data.cartLinesUpdate.cart)
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<Cart> {
  const data = await shopifyFetch({
    query: CartLinesRemoveDocument,
    variables: { cartId, lineIds },
    cache: 'no-store',
  })
  handleUserErrors(data.cartLinesRemove?.userErrors ?? [])
  if (!data.cartLinesRemove?.cart)
    throw new Error('Unable to remove cart lines')
  return reshapeCart(data.cartLinesRemove.cart)
}

export async function updateCartNote(
  cartId: string,
  note: string,
): Promise<Pick<Cart, 'checkoutUrl'>> {
  const data = await shopifyFetch<
    CartNoteUpdateMutation,
    CartNoteUpdateMutationVariables
  >({
    query: CartNoteUpdateDocument,
    variables: { cartId, note },
    cache: 'no-store',
  })
  handleUserErrors(data.cartNoteUpdate?.userErrors ?? [])
  if (!data.cartNoteUpdate?.cart) throw new Error('Unable to update cart note')
  return data.cartNoteUpdate.cart
}
