import { createServer, type Server, type ServerResponse } from 'node:http'

import { parse, visit } from 'graphql'

import {
  makeCustomerAccountAddress,
  makeCustomerAccountProfile,
  makeCustomerAccountUserError,
} from '@/tests/fixtures/shopify/customer-account'
import type {
  CustomerAccountAddress,
  CustomerAccountOrder,
  CustomerAccountProfile,
} from '@/lib/shopify/customer-account/types'

type GraphqlRequest = {
  operationName?: string
  query?: string
  variables?: Record<string, unknown>
}

type FakeTokenRecord = {
  accessToken: string
  idToken: string
  refreshToken: string
}

type FakeCustomerAccountServerOptions = {
  initialProfile?: CustomerAccountProfile
  invalidTokenCode?: string
  omitViewerSections?: Array<'addresses' | 'orders'>
  port?: number
}

type FakeCustomerAccountServer = {
  close: () => Promise<void>
  profile: CustomerAccountProfile
  requests: GraphqlRequest[]
  reset: () => void
  tokens: FakeTokenRecord
  url: string
}

const FETCH_BLOCKED_PORTS = new Set([
  1, 7, 9, 11, 13, 15, 17, 19, 20, 21, 22, 23, 25, 37, 42, 43, 53, 69, 77, 79,
  87, 95, 101, 102, 103, 104, 109, 110, 111, 113, 115, 117, 119, 123, 135, 137,
  139, 143, 161, 179, 389, 427, 465, 512, 513, 514, 515, 526, 530, 531, 532,
  540, 548, 554, 556, 563, 587, 601, 636, 989, 990, 993, 995, 1719, 1720, 1723,
  2049, 3659, 4045, 4190, 5060, 5061, 6000, 6566, 6665, 6666, 6667, 6668, 6669,
  6697, 10080,
])

function isFetchBlockedPort(port: number): boolean {
  return FETCH_BLOCKED_PORTS.has(port)
}

function listenServer(server: Server, port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const handleError = (error: Error) => {
      server.off('listening', handleListening)
      reject(error)
    }
    const handleListening = () => {
      server.off('error', handleError)
      resolve()
    }

    server.once('error', handleError)
    server.once('listening', handleListening)
    server.listen(port, '127.0.0.1')
  })
}

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
  response.writeHead(status, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(value))
}

function writeNoContent(response: ServerResponse) {
  response.writeHead(204)
  response.end()
}

function encodeTokenSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

function makeIdToken(nonce: string, customerId: string): string {
  return [
    encodeTokenSegment({ alg: 'none', typ: 'JWT' }),
    encodeTokenSegment({
      aud: 'test-client-id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: 'https://customer-account.test',
      nonce,
      sub: customerId,
    }),
    'signature',
  ].join('.')
}

function toAddressConnection(addresses: CustomerAccountAddress[]) {
  return {
    nodes: addresses.map(toCustomerAddressApiPayload),
    edges: addresses.map((node) => ({
      node: toCustomerAddressApiPayload(node),
    })),
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  }
}

function toOrderConnection(orders: CustomerAccountOrder[]) {
  return {
    nodes: orders.map(toOrderApiPayload),
    edges: orders.map((node) => ({ node: toOrderApiPayload(node) })),
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
    },
  }
}

function toCustomerAddressApiPayload(address: CustomerAccountAddress) {
  return {
    ...address,
    phoneNumber: address.phone,
    territoryCode: address.countryCodeV2,
    zoneCode: address.provinceCode,
  }
}

function toFulfillmentApiPayload(
  fulfillment: CustomerAccountOrder['fulfillments'][number],
) {
  return {
    trackingInformation: fulfillment.trackingInfo.map((tracking) => ({
      company: fulfillment.trackingCompany,
      number: tracking.number,
      url: tracking.url,
    })),
  }
}

function toOrderApiPayload(order: CustomerAccountOrder) {
  return {
    ...order,
    fulfillments: {
      nodes: order.fulfillments.map(toFulfillmentApiPayload),
      edges: order.fulfillments.map((node) => ({
        node: toFulfillmentApiPayload(node),
      })),
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    },
    lineItems: {
      nodes: order.lineItems,
      edges: order.lineItems.map((node) => ({ node })),
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    },
    shippingAddress: order.shippingAddress
      ? toCustomerAddressApiPayload(order.shippingAddress)
      : null,
  }
}

function toCustomerPayload(
  profile: CustomerAccountProfile,
  omitSections: Array<'addresses' | 'orders'>,
) {
  const payload = {
    ...profile,
    defaultAddress: profile.defaultAddress
      ? toCustomerAddressApiPayload(profile.defaultAddress)
      : null,
    emailAddress: profile.emailAddress
      ? { emailAddress: profile.emailAddress }
      : null,
    addresses: omitSections.includes('addresses')
      ? undefined
      : toAddressConnection(profile.addresses),
    orders: omitSections.includes('orders')
      ? undefined
      : toOrderConnection(profile.orders),
  }

  return payload
}

function getParentFieldName(ancestors: readonly unknown[]): string | null {
  for (let index = ancestors.length - 1; index >= 0; index -= 1) {
    const ancestor = ancestors[index]
    if (
      typeof ancestor === 'object' &&
      ancestor !== null &&
      'kind' in ancestor &&
      ancestor.kind === 'Field' &&
      'name' in ancestor &&
      typeof ancestor.name === 'object' &&
      ancestor.name !== null &&
      'value' in ancestor.name &&
      typeof ancestor.name.value === 'string'
    ) {
      return ancestor.name.value
    }
  }

  return null
}

function hasLegacyCustomerAccountFields(query: string | undefined): boolean {
  if (!query) return false

  const legacyAliasedFields = new Set([
    'countryCodeV2',
    'phone',
    'provinceCode',
    'trackingCompany',
    'trackingInfo',
  ])
  const currentObjectFields = new Set(['emailAddress', 'phoneNumber'])
  let hasLegacySelection = false

  try {
    visit(parse(query), {
      Field(node, _key, _parent, _path, ancestors) {
        if (node.alias) return

        const fieldName = node.name.value
        if (legacyAliasedFields.has(fieldName)) {
          hasLegacySelection = true
          return false
        }

        if (
          currentObjectFields.has(fieldName) &&
          !node.selectionSet &&
          getParentFieldName(ancestors) !== fieldName
        ) {
          hasLegacySelection = true
          return false
        }
      },
    })
  } catch {
    return false
  }

  return hasLegacySelection
}

function findAddress(
  profile: CustomerAccountProfile,
  addressId: string,
): CustomerAccountAddress | null {
  return profile.addresses.find((address) => address.id === addressId) ?? null
}

function findOrder(
  profile: CustomerAccountProfile,
  orderId: string,
): CustomerAccountOrder | null {
  return profile.orders.find((order) => order.id === orderId) ?? null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function readRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function hasUnsupportedFields(
  value: Record<string, unknown>,
  supportedFields: Set<string>,
): boolean {
  return Object.keys(value).some((key) => !supportedFields.has(key))
}

export async function createFakeCustomerAccountApiServer(
  options: FakeCustomerAccountServerOptions = {},
): Promise<FakeCustomerAccountServer> {
  const {
    initialProfile = makeCustomerAccountProfile(),
    invalidTokenCode = 'invalid-code',
    omitViewerSections = [],
    port = 0,
  } = options
  let profile = initialProfile
  const requests: GraphqlRequest[] = []
  let tokens: FakeTokenRecord = {
    accessToken: 'customer-access-token',
    idToken: makeIdToken('test-nonce', profile.id),
    refreshToken: 'customer-refresh-token',
  }

  const server = createServer(async (request, response) => {
    const host = `http://${request.headers.host ?? '127.0.0.1'}`
    const requestUrl = new URL(request.url ?? '/', host)
    const origin = requestUrl.origin

    if (
      request.method === 'GET' &&
      requestUrl.pathname === '/.well-known/openid-configuration'
    ) {
      writeJson(response, 200, {
        authorization_endpoint: `${origin}/authentication/oauth/authorize`,
        end_session_endpoint: `${origin}/authentication/logout`,
        issuer: origin,
        jwks_uri: `${origin}/authentication/jwks`,
        token_endpoint: `${origin}/authentication/oauth/token`,
      })
      return
    }

    if (
      request.method === 'GET' &&
      requestUrl.pathname === '/.well-known/customer-account-api'
    ) {
      writeJson(response, 200, {
        customer_account_api_endpoint: `${origin}/customer-account/graphql`,
      })
      return
    }

    if (
      request.method === 'POST' &&
      requestUrl.pathname === '/authentication/oauth/token'
    ) {
      const form = new URLSearchParams(await readRequestBody(request))
      const code = form.get('code')
      const codeVerifier = form.get('code_verifier')
      const nonce = form.get('nonce') ?? 'test-nonce'

      if (!code || code === invalidTokenCode || !codeVerifier) {
        writeJson(response, 400, {
          error: 'invalid_grant',
          error_description: 'Invalid authorization code or verifier',
        })
        return
      }

      tokens = {
        accessToken: `customer-access-token-${code}`,
        idToken: makeIdToken(nonce, profile.id),
        refreshToken: `customer-refresh-token-${code}`,
      }

      writeJson(response, 200, {
        access_token: tokens.accessToken,
        expires_in: 3600,
        id_token: tokens.idToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
      })
      return
    }

    if (
      request.method === 'POST' &&
      requestUrl.pathname === '/authentication/logout'
    ) {
      writeNoContent(response)
      return
    }

    if (
      request.method === 'POST' &&
      requestUrl.pathname === '/customer-account/graphql'
    ) {
      const body = await readRequestBody(request)
      const graphqlRequest = JSON.parse(body) as GraphqlRequest
      const operationName = getOperationName(graphqlRequest)
      requests.push({ ...graphqlRequest, operationName })

      if (hasLegacyCustomerAccountFields(graphqlRequest.query)) {
        writeJson(response, 400, {
          errors: [
            { message: 'Query includes fields outside Customer Account API' },
          ],
        })
        return
      }

      if (operationName === 'CustomerAccountViewer') {
        writeJson(response, 200, {
          data: { customer: toCustomerPayload(profile, omitViewerSections) },
        })
        return
      }

      if (operationName === 'CustomerAccountIdentity') {
        writeJson(response, 200, {
          data: {
            customer: {
              id: profile.id,
              emailAddress: { emailAddress: profile.emailAddress },
            },
          },
        })
        return
      }

      if (operationName === 'CustomerAccountOrders') {
        writeJson(response, 200, {
          data: { customer: { orders: toOrderConnection(profile.orders) } },
        })
        return
      }

      if (operationName === 'CustomerAccountOrder') {
        const orderId = readString(graphqlRequest.variables?.orderId)
        const order = orderId ? findOrder(profile, orderId) : null

        writeJson(response, 200, {
          data: {
            order: order ? toOrderApiPayload(order) : null,
          },
        })
        return
      }

      if (operationName === 'CustomerUpdate') {
        const input = readRecord(graphqlRequest.variables?.input)

        if (hasUnsupportedFields(input, new Set(['firstName', 'lastName']))) {
          writeJson(response, 400, {
            errors: [
              {
                message:
                  'CustomerUpdateInput supports firstName and lastName only',
              },
            ],
          })
          return
        }

        profile = {
          ...profile,
          firstName: readString(input.firstName) ?? profile.firstName,
          lastName: readString(input.lastName) ?? profile.lastName,
        }
        writeJson(response, 200, {
          data: {
            customerUpdate: {
              customer: toCustomerPayload(profile, omitViewerSections),
              userErrors: [],
            },
          },
        })
        return
      }

      if (operationName === 'CustomerAddressCreate') {
        const input = readRecord(graphqlRequest.variables?.address)

        if (
          hasUnsupportedFields(
            input,
            new Set([
              'address1',
              'address2',
              'city',
              'firstName',
              'lastName',
              'phoneNumber',
              'territoryCode',
              'zip',
              'zoneCode',
            ]),
          )
        ) {
          writeJson(response, 400, {
            errors: [
              {
                message:
                  'CustomerAddressInput uses phoneNumber, territoryCode, and zoneCode',
              },
            ],
          })
          return
        }

        const address = makeCustomerAccountAddress({
          id: `gid://shopify/CustomerAddress/test-address-${profile.addresses.length + 1}`,
          address1: readString(input.address1) ?? 'New address',
          countryCodeV2: readString(input.territoryCode) ?? 'AU',
          phone: readString(input.phoneNumber),
          provinceCode: readString(input.zoneCode),
        })
        profile = { ...profile, addresses: [...profile.addresses, address] }
        writeJson(response, 200, {
          data: {
            customerAddressCreate: {
              customerAddress: toCustomerAddressApiPayload(address),
              userErrors: [],
            },
          },
        })
        return
      }

      if (operationName === 'CustomerAddressUpdate') {
        const addressId = readString(graphqlRequest.variables?.addressId)
        const input = readRecord(graphqlRequest.variables?.address)
        const existing = addressId ? findAddress(profile, addressId) : null

        if (
          hasUnsupportedFields(
            input,
            new Set([
              'address1',
              'address2',
              'city',
              'firstName',
              'lastName',
              'phoneNumber',
              'territoryCode',
              'zip',
              'zoneCode',
            ]),
          )
        ) {
          writeJson(response, 400, {
            errors: [
              {
                message:
                  'CustomerAddressInput uses phoneNumber, territoryCode, and zoneCode',
              },
            ],
          })
          return
        }

        if (!addressId || !existing) {
          writeJson(response, 200, {
            data: {
              customerAddressUpdate: {
                customerAddress: null,
                userErrors: [
                  makeCustomerAccountUserError(
                    ['id'],
                    'Address could not be found',
                  ),
                ],
              },
            },
          })
          return
        }

        const defaultAddress = graphqlRequest.variables?.defaultAddress === true
        const updated = {
          ...existing,
          address1: readString(input.address1) ?? existing.address1,
          phone: readString(input.phoneNumber) ?? existing.phone,
          provinceCode: readString(input.zoneCode) ?? existing.provinceCode,
          countryCodeV2:
            readString(input.territoryCode) ?? existing.countryCodeV2,
        }
        profile = {
          ...profile,
          defaultAddress: defaultAddress ? updated : profile.defaultAddress,
          addresses: profile.addresses.map((address) =>
            address.id === addressId ? updated : address,
          ),
        }
        writeJson(response, 200, {
          data: {
            customerAddressUpdate: {
              customerAddress: toCustomerAddressApiPayload(updated),
              userErrors: [],
            },
          },
        })
        return
      }

      if (operationName === 'CustomerAddressDelete') {
        const addressId = readString(graphqlRequest.variables?.addressId)
        profile = {
          ...profile,
          addresses: profile.addresses.filter(
            (address) => address.id !== addressId,
          ),
        }
        writeJson(response, 200, {
          data: {
            customerAddressDelete: {
              deletedAddressId: addressId,
              userErrors: [],
            },
          },
        })
        return
      }

      writeJson(response, 500, {
        errors: [
          { message: `Unhandled Customer Account operation: ${operationName}` },
        ],
      })
      return
    }

    writeJson(response, 404, { message: 'Not found' })
  })

  await listenServer(server, isFetchBlockedPort(port) ? 0 : port)

  const address = server.address()
  if (typeof address === 'string' || address === null) {
    throw new Error('Unable to start fake Customer Account API server')
  }

  if (isFetchBlockedPort(address.port)) {
    await closeServer(server)
    return createFakeCustomerAccountApiServer({ ...options, port: 0 })
  }

  return {
    close: () => closeServer(server),
    get profile() {
      return profile
    },
    get requests() {
      return requests
    },
    reset: () => {
      profile = initialProfile
      requests.length = 0
    },
    get tokens() {
      return tokens
    },
    url: `http://127.0.0.1:${address.port}`,
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
