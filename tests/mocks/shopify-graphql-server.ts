import { createServer, type Server, type ServerResponse } from 'node:http'

import type { Cart } from '@/lib/shopify/types'
import {
  makeCart,
  makeCartLine,
  makeShopifyCartPayload,
  type ShopifyCartPayload,
} from '@/tests/fixtures/shopify/cart'
import { makeProduct } from '@/tests/fixtures/shopify/product'

type GraphqlRequest = {
  operationName?: string
  query?: string
  variables?: Record<string, unknown>
}

type FakeNewsletterCustomer = {
  email: string
  id: string
  marketingState: 'SUBSCRIBED' | 'UNSUBSCRIBED'
}

type FakeShopifyServer = {
  buyerIdentity: ShopifyCartPayload['buyerIdentity']
  cart: Cart
  close: () => Promise<void>
  newsletterCustomers: FakeNewsletterCustomer[]
  requests: GraphqlRequest[]
  reset: () => void
  url: string
}

type FakeShopifyServerOptions = {
  initialCart?: Cart
  initialNewsletterCustomers?: FakeNewsletterCustomer[]
  port?: number
}

const fakeVariantQuantityRule = {
  minimum: 5,
  maximum: 20,
  increment: 5,
}

const fakeProductImage = {
  url: '/images/homepage/bulk-wholesale-lcp.avif',
  altText: 'Loose tea in bulk packaging',
  width: 800,
  height: 534,
}

const fakeBannerCollectionHandle = 'test-banner'

function readRequestBody(request: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => {
      body += chunk
    })
    request.on('end', () => resolve(body))
    request.on('error', reject)
  })
}

function getOperationName(request: GraphqlRequest): string {
  if (request.operationName) return request.operationName

  const match = request.query?.match(/\b(query|mutation)\s+([A-Za-z0-9_]+)/)
  return match?.[2] ?? 'UnknownOperation'
}

function writeJson(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
  })
  response.end(JSON.stringify(value))
}

function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function toBuyerIdentityPayload(
  input: Record<string, unknown>,
): ShopifyCartPayload['buyerIdentity'] {
  const customerAccessToken = readString(input.customerAccessToken)

  return {
    countryCode: readString(input.countryCode),
    customer: customerAccessToken
      ? {
          id:
            customerAccessToken === 'customer-access-token-b'
              ? 'gid://shopify/Customer/test-customer-2'
              : 'gid://shopify/Customer/test-customer-1',
        }
      : null,
    email: readString(input.email),
    phone: readString(input.phone),
  }
}

function shouldFailBuyerIdentityUpdate(
  input: Record<string, unknown>,
): boolean {
  return readString(input.customerAccessToken) === 'force-identity-sync-failure'
}

function setLineTotals(cart: Cart): Cart {
  const lines = cart.lines.map((line) => {
    const lineAmount = (
      Number(line.cost.amountPerQuantity.amount) * line.quantity
    ).toFixed(2)

    return {
      ...line,
      cost: {
        ...line.cost,
        subtotalAmount: {
          amount: lineAmount,
          currencyCode: line.cost.amountPerQuantity.currencyCode,
        },
        totalAmount: {
          amount: lineAmount,
          currencyCode: line.cost.amountPerQuantity.currencyCode,
        },
      },
    }
  })
  const totalAmount = lines
    .reduce((total, line) => total + Number(line.cost.totalAmount.amount), 0)
    .toFixed(2)

  return {
    ...cart,
    lines,
    totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
    cost: {
      subtotalAmount: {
        amount: totalAmount,
        currencyCode: 'AUD',
      },
      totalAmount: {
        amount: totalAmount,
        currencyCode: 'AUD',
      },
    },
  }
}

function makeRawProduct() {
  const product = makeProduct()
  const variant = product.variants[0]

  if (!variant) {
    throw new Error('Fake product requires at least one variant')
  }

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    tags: product.tags,
    images: {
      edges: [{ node: fakeProductImage }],
    },
    priceRange: product.priceRange,
    options: product.options,
    ratingMetafield: { value: JSON.stringify({ value: '4.8' }) },
    ratingCountMetafield: { value: '24' },
    variants: {
      pageInfo: { hasNextPage: false, endCursor: null },
      edges: [
        {
          node: {
            ...variant,
            currentlyNotInStock: false,
            image: fakeProductImage,
            quantityRule: fakeVariantQuantityRule,
            quantityPriceBreaks: { nodes: [] },
          },
        },
      ],
    },
  }
}

function makeCollectionSummary() {
  return {
    id: 'gid://shopify/Collection/all',
    handle: 'all',
    title: 'All products',
    description: 'All test products',
    updatedAt: '2026-06-04T00:00:00Z',
    image: null,
    seo: { title: null, description: null },
  }
}

function makeCollection(handle: string) {
  if (handle === fakeBannerCollectionHandle) {
    return {
      ...makeCollectionSummary(),
      id: 'gid://shopify/Collection/test-banner',
      handle: fakeBannerCollectionHandle,
      title: 'Test Banner Collection',
      description: 'Representative collection banner performance fixture.',
      descriptionHtml:
        '<img src="/images/homepage/homepage-hero-tea-harvest-lcp.avif" alt="Test Banner Collection" width="1440" height="650"><h2>Test Banner Collection</h2><p>Representative collection banner performance fixture.</p>',
    }
  }

  return {
    ...makeCollectionSummary(),
    descriptionHtml: '<p>All test products.</p>',
  }
}

function isFakeCollectionHandle(handle: string | null): handle is string {
  return handle === 'all' || handle === fakeBannerCollectionHandle
}

function makeCollectionProductNode() {
  const product = makeRawProduct()

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    availableForSale: true,
    productType: 'Tea',
    tags: product.tags,
    featuredImage: fakeProductImage,
    priceRange: product.priceRange,
    variants: {
      edges: product.variants.edges.map((edge) => ({
        node: {
          id: edge.node.id,
          title: edge.node.title,
          availableForSale: edge.node.availableForSale,
          currentlyNotInStock: edge.node.currentlyNotInStock,
          quantityRule: edge.node.quantityRule,
          price: edge.node.price,
          image: fakeProductImage,
        },
      })),
    },
    ratingMetafield: product.ratingMetafield,
    ratingCountMetafield: product.ratingCountMetafield,
  }
}

function makePageSummary() {
  return {
    id: 'gid://shopify/Page/fake-production-e2e-page',
    handle: 'fake-production-e2e-page',
    title: 'Fake production e2e page',
    bodySummary: 'Fake page for production e2e prerendering.',
    updatedAt: '2026-06-04T00:00:00Z',
    seo: { title: null, description: null },
  }
}

function makePage() {
  return {
    ...makePageSummary(),
    body: '<p>Fake page for production e2e prerendering.</p>',
  }
}

export async function createFakeShopifyServer({
  initialCart = makeCart({ lines: [] }),
  initialNewsletterCustomers = [],
  port = 0,
}: FakeShopifyServerOptions = {}): Promise<FakeShopifyServer> {
  let cart = setLineTotals(initialCart)
  let newsletterCustomers = initialNewsletterCustomers.map((customer) => ({
    ...customer,
  }))
  let buyerIdentity: ShopifyCartPayload['buyerIdentity'] = {
    countryCode: null,
    customer: null,
    email: null,
    phone: null,
  }
  let cartNote = ''
  let lineSequence = cart.lines.length + 1
  const requests: GraphqlRequest[] = []

  function cartPayload() {
    return makeShopifyCartPayload(cart, buyerIdentity)
  }

  const server = createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
      writeJson(response, 200, { ok: true })
      return
    }

    if (
      request.method === 'GET' &&
      request.url === '/test/newsletter-customers'
    ) {
      writeJson(response, 200, { customers: newsletterCustomers })
      return
    }

    if (request.method === 'GET' && request.url === '/test/cart-note') {
      writeJson(response, 200, { note: cartNote })
      return
    }

    if (request.method !== 'POST') {
      writeJson(response, 405, { errors: [{ message: 'Method not allowed' }] })
      return
    }

    const body = await readRequestBody(request)
    const graphqlRequest = JSON.parse(body) as GraphqlRequest
    const operationName = getOperationName(graphqlRequest)
    requests.push({ ...graphqlRequest, operationName })

    if (operationName === 'FindNewsletterCustomer') {
      const identifier = readRecord(graphqlRequest.variables?.identifier)
      const email = readString(identifier.emailAddress)?.toLowerCase()
      const found = newsletterCustomers.find(
        (customer) => customer.email === email,
      )

      writeJson(response, 200, {
        data: {
          customer: found
            ? {
                id: found.id,
                defaultEmailAddress: {
                  emailAddress: found.email,
                  marketingState: found.marketingState,
                },
              }
            : null,
        },
      })
      return
    }

    if (operationName === 'CreateNewsletterCustomer') {
      const input = readRecord(graphqlRequest.variables?.input)
      const email = readString(input.email)?.toLowerCase()
      const consent = readRecord(input.emailMarketingConsent)
      const marketingState = readString(consent.marketingState)

      if (!email || marketingState !== 'SUBSCRIBED') {
        writeJson(response, 200, {
          data: {
            customerCreate: {
              customer: null,
              userErrors: [
                { field: ['email'], message: 'Invalid newsletter customer' },
              ],
            },
          },
        })
        return
      }

      if (newsletterCustomers.some((customer) => customer.email === email)) {
        writeJson(response, 200, {
          data: {
            customerCreate: {
              customer: null,
              userErrors: [
                { field: ['email'], message: 'Email has already been taken' },
              ],
            },
          },
        })
        return
      }

      const customer = {
        email,
        id: `gid://shopify/Customer/fake-newsletter-${newsletterCustomers.length + 1}`,
        marketingState: 'SUBSCRIBED' as const,
      }
      newsletterCustomers.push(customer)
      writeJson(response, 200, {
        data: {
          customerCreate: {
            customer: { id: customer.id },
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'UpdateNewsletterCustomer') {
      const input = readRecord(graphqlRequest.variables?.input)
      const customerId = readString(input.customerId)
      const consent = readRecord(input.emailMarketingConsent)
      const customer = newsletterCustomers.find(
        (candidate) => candidate.id === customerId,
      )

      if (!customer || readString(consent.marketingState) !== 'SUBSCRIBED') {
        writeJson(response, 200, {
          data: {
            customerEmailMarketingConsentUpdate: {
              customer: null,
              userErrors: [
                {
                  field: ['customerId'],
                  message: 'Newsletter customer not found',
                },
              ],
            },
          },
        })
        return
      }

      customer.marketingState = 'SUBSCRIBED'
      writeJson(response, 200, {
        data: {
          customerEmailMarketingConsentUpdate: {
            customer: { id: customer.id },
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'GetProduct') {
      writeJson(response, 200, { data: { product: makeRawProduct() } })
      return
    }

    if (operationName === 'GetProductVariants') {
      writeJson(response, 200, {
        data: {
          product: {
            variants: {
              edges: [],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        },
      })
      return
    }

    if (operationName === 'GetProducts') {
      const product = makeRawProduct()
      writeJson(response, 200, {
        data: {
          products: {
            edges: [
              {
                node: {
                  id: product.id,
                  handle: product.handle,
                  title: product.title,
                  updatedAt: '2026-06-04T00:00:00Z',
                  featuredImage: null,
                  priceRange: product.priceRange,
                  ratingMetafield: product.ratingMetafield,
                  ratingCountMetafield: product.ratingCountMetafield,
                },
              },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      })
      return
    }

    if (operationName === 'SearchProducts') {
      const query =
        readString(graphqlRequest.variables?.query)?.toLowerCase() ?? ''
      const standardProduct = {
        ...makeCollectionProductNode(),
        tags: ['Tea', 'Wholesale'],
        description: 'A reliable test tea for search fallback coverage.',
        updatedAt: '2026-06-04T00:00:00Z',
      }
      const organicProduct = {
        ...standardProduct,
        id: 'gid://shopify/Product/organic-test-tea',
        handle: 'organic-test-tea',
        title: 'Organic Test Tea',
        productType: 'Green Tea',
        tags: ['Tea', 'Organic'],
      }
      const manyProducts = Array.from({ length: 25 }, (_, index) => ({
        ...standardProduct,
        id: `gid://shopify/Product/many-test-tea-${index + 1}`,
        handle: `many-test-tea-${index + 1}`,
        title: `Many Test Tea ${String(index + 1).padStart(2, '0')}`,
      }))
      const products = query.includes('nomatch')
        ? []
        : query.includes('many')
          ? manyProducts
          : query.includes('organic')
            ? [organicProduct]
            : [standardProduct, organicProduct]

      writeJson(response, 200, {
        data: {
          products: {
            edges: products.map((node) => ({ node })),
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      })
      return
    }

    if (operationName === 'GetPage') {
      const handle = readString(graphqlRequest.variables?.handle)
      writeJson(response, 200, {
        data: {
          page: handle === 'fake-production-e2e-page' ? makePage() : null,
        },
      })
      return
    }

    if (operationName === 'GetPages') {
      writeJson(response, 200, {
        data: {
          pages: {
            edges: [{ node: makePageSummary() }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      })
      return
    }

    if (operationName === 'GetCollection') {
      const handle = readString(graphqlRequest.variables?.handle)
      writeJson(response, 200, {
        data: {
          collection: isFakeCollectionHandle(handle)
            ? makeCollection(handle)
            : null,
        },
      })
      return
    }

    if (operationName === 'GetCollectionProducts') {
      const handle = readString(graphqlRequest.variables?.handle)
      writeJson(response, 200, {
        data: {
          collection: isFakeCollectionHandle(handle)
            ? {
                products: {
                  edges: [{ node: makeCollectionProductNode() }],
                  filters: [],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              }
            : null,
        },
      })
      return
    }

    if (operationName === 'GetCollectionCursorIndex') {
      const handle = readString(graphqlRequest.variables?.handle)
      writeJson(response, 200, {
        data: {
          collection: isFakeCollectionHandle(handle)
            ? {
                products: {
                  edges: [
                    {
                      cursor: 'fake-product-cursor',
                      node: { tags: makeCollectionProductNode().tags },
                    },
                  ],
                  pageInfo: { hasNextPage: false, endCursor: null },
                },
              }
            : null,
        },
      })
      return
    }

    if (
      operationName === 'GetCollections' ||
      operationName === 'GetCollectionSummaries'
    ) {
      const node =
        operationName === 'GetCollections'
          ? { handle: 'all' }
          : makeCollectionSummary()
      writeJson(response, 200, {
        data: {
          collections: {
            edges: [{ node }],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        },
      })
      return
    }

    if (operationName === 'GetProductRecommendations') {
      writeJson(response, 200, { data: { productRecommendations: [] } })
      return
    }

    if (operationName === 'GetCart') {
      writeJson(response, 200, { data: { cart: cartPayload() } })
      return
    }

    if (operationName === 'CartCreate') {
      const input = readRecord(graphqlRequest.variables?.input)
      const identityInput = readRecord(input.buyerIdentity)
      buyerIdentity = toBuyerIdentityPayload(identityInput)
      cart = setLineTotals(
        makeCart({
          id: 'gid://shopify/Cart/fake-cart',
          checkoutUrl: 'https://checkout.test/cart/fake-cart',
          lines: [],
        }),
      )
      writeJson(response, 200, {
        data: {
          cartCreate: {
            cart: cartPayload(),
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'CartBuyerIdentityUpdate') {
      const identityInput = readRecord(graphqlRequest.variables?.buyerIdentity)

      if (shouldFailBuyerIdentityUpdate(identityInput)) {
        writeJson(response, 200, {
          data: {
            cartBuyerIdentityUpdate: {
              cart: null,
              userErrors: [
                {
                  field: ['buyerIdentity'],
                  message: 'Unable to confirm customer identity',
                },
              ],
            },
          },
        })
        return
      }

      buyerIdentity = toBuyerIdentityPayload(identityInput)
      writeJson(response, 200, {
        data: {
          cartBuyerIdentityUpdate: {
            cart: cartPayload(),
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'CartNoteUpdate') {
      cartNote = readString(graphqlRequest.variables?.note) ?? ''
      writeJson(response, 200, {
        data: {
          cartNoteUpdate: {
            cart: { checkoutUrl: cart.checkoutUrl },
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'CartLinesAdd') {
      const lines = Array.isArray(graphqlRequest.variables?.lines)
        ? graphqlRequest.variables.lines
        : []
      const nextLines = lines.map((line) => {
        const lineRecord = line as Record<string, unknown>
        const quantity =
          typeof lineRecord.quantity === 'number' ? lineRecord.quantity : 1
        const merchandiseId =
          typeof lineRecord.merchandiseId === 'string'
            ? lineRecord.merchandiseId
            : 'gid://shopify/ProductVariant/test-variant-1'

        return makeCartLine({
          id: `gid://shopify/CartLine/fake-line-${lineSequence++}`,
          quantity,
          merchandise: {
            ...makeCartLine().merchandise,
            id: merchandiseId,
            quantityRule: fakeVariantQuantityRule,
            product: {
              ...makeCartLine().merchandise.product,
              featuredImage: null,
            },
          },
        })
      })
      cart = setLineTotals({ ...cart, lines: [...cart.lines, ...nextLines] })
      writeJson(response, 200, {
        data: {
          cartLinesAdd: {
            cart: cartPayload(),
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'CartLinesUpdate') {
      const updates = Array.isArray(graphqlRequest.variables?.lines)
        ? graphqlRequest.variables.lines
        : []
      cart = setLineTotals({
        ...cart,
        lines: cart.lines.map((line) => {
          const update = updates.find(
            (value) =>
              typeof value === 'object' &&
              value !== null &&
              'id' in value &&
              value.id === line.id,
          )

          if (
            typeof update === 'object' &&
            update !== null &&
            'quantity' in update &&
            typeof update.quantity === 'number'
          ) {
            return { ...line, quantity: update.quantity }
          }

          return line
        }),
      })
      writeJson(response, 200, {
        data: {
          cartLinesUpdate: {
            cart: cartPayload(),
            userErrors: [],
          },
        },
      })
      return
    }

    if (operationName === 'CartLinesRemove') {
      const lineIds = Array.isArray(graphqlRequest.variables?.lineIds)
        ? graphqlRequest.variables.lineIds
        : []
      cart = setLineTotals({
        ...cart,
        lines: cart.lines.filter((line) => !lineIds.includes(line.id)),
      })
      writeJson(response, 200, {
        data: {
          cartLinesRemove: {
            cart: cartPayload(),
            userErrors: [],
          },
        },
      })
      return
    }

    writeJson(response, 500, {
      errors: [
        {
          message: `Unhandled fake Shopify operation: ${operationName}`,
        },
      ],
    })
  })

  await new Promise<void>((resolve) => {
    server.listen(port, '127.0.0.1', resolve)
  })

  const address = server.address()
  if (typeof address === 'string' || address === null) {
    throw new Error('Unable to start fake Shopify server')
  }

  return {
    get buyerIdentity() {
      return buyerIdentity
    },
    get cart() {
      return cart
    },
    close: () => closeServer(server),
    get newsletterCustomers() {
      return newsletterCustomers
    },
    get requests() {
      return requests
    },
    reset: () => {
      cart = setLineTotals(initialCart)
      newsletterCustomers = initialNewsletterCustomers.map((customer) => ({
        ...customer,
      }))
      buyerIdentity = {
        countryCode: null,
        customer: null,
        email: null,
        phone: null,
      }
      cartNote = ''
      lineSequence = cart.lines.length + 1
      requests.length = 0
    },
    url: `http://127.0.0.1:${address.port}/graphql`,
  }
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
