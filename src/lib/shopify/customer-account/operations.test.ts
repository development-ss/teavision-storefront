import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest'

import { createFakeCustomerAccountApiServer } from '@/tests/mocks/customer-account-api-server'

import {
  createCustomerAddress,
  getCustomerAccountIdentity,
  getCustomerAccountDashboard,
  getCustomerAccountOrder,
  getCustomerAccountOrders,
  normalizeCustomerAccountUserErrors,
  setDefaultCustomerAddress,
  updateCustomerProfile,
} from './operations'
import type { CustomerAccountSession } from './types'

describe('Customer Account read operations', () => {
  let closeServer: (() => Promise<void>) | undefined
  let serverUrl = ''

  beforeAll(async () => {
    const server = await createFakeCustomerAccountApiServer()
    closeServer = server.close
    serverUrl = server.url
  })

  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE', 'true')
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', serverUrl)
  })

  afterAll(async () => {
    vi.unstubAllEnvs()
    await closeServer?.()
  })

  function makeSession(): CustomerAccountSession {
    return {
      accessToken: 'customer-access-token',
      customerId: 'gid://shopify/Customer/test-customer-1',
      expiresAt: Date.now() + 60000,
      idToken: 'id-token',
      refreshToken: 'customer-refresh-token',
    }
  }

  test('loads dashboard sections without accepting a customer id', async () => {
    const dashboard = await getCustomerAccountDashboard(makeSession())

    expect(dashboard.profile?.emailAddress).toBe('avery@example.test')
    expect(dashboard.defaultAddress?.countryCodeV2).toBe('AU')
    expect(dashboard.recentOrders[0]?.name).toBe('#TV1001')
    expect(dashboard.sectionErrors).toEqual({})
  })

  test('loads only the signed-in customer id and email for checkout context', async () => {
    await expect(getCustomerAccountIdentity(makeSession())).resolves.toEqual({
      customerId: 'gid://shopify/Customer/test-customer-1',
      email: 'avery@example.test',
    })
  })

  test('keeps loaded dashboard sections when recent orders are unavailable', async () => {
    const partialServer = await createFakeCustomerAccountApiServer({
      omitViewerSections: ['orders'],
    })
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', partialServer.url)

    try {
      const dashboard = await getCustomerAccountDashboard(makeSession())

      expect(dashboard.profile?.emailAddress).toBe('avery@example.test')
      expect(dashboard.defaultAddress?.city).toBe('Melbourne')
      expect(dashboard.recentOrders).toEqual([])
      expect(dashboard.sectionErrors.orders).toBe(
        'We could not load recent orders.',
      )
    } finally {
      await partialServer.close()
      vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', serverUrl)
    }
  })

  test('loads paginated orders and order detail by order id', async () => {
    const orders = await getCustomerAccountOrders(makeSession(), { first: 10 })
    const order = await getCustomerAccountOrder(
      makeSession(),
      'gid://shopify/Order/test-order-1',
    )

    expect(orders.items[0]?.name).toBe('#TV1001')
    expect(orders.pageInfo.hasNextPage).toBe(false)
    expect(order?.lineItems[0]?.title).toBe('Organic Sencha')
    expect(order?.fulfillments[0]?.trackingInfo[0]?.url).toBe(
      'https://tracking.test/TRACK123',
    )
  })

  test('order detail fetch sends no client-provided customer id variable', async () => {
    const requestServer = await createFakeCustomerAccountApiServer()
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', requestServer.url)

    try {
      await getCustomerAccountOrder(
        makeSession(),
        'gid://shopify/Order/test-order-1',
      )

      expect(
        requestServer.requests.find(
          (request) => request.operationName === 'CustomerAccountOrder',
        )?.variables,
      ).toEqual({ orderId: 'gid://shopify/Order/test-order-1' })
    } finally {
      await requestServer.close()
      vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', serverUrl)
    }
  })

  test('normalizes Shopify user errors to field and form messages', () => {
    expect(
      normalizeCustomerAccountUserErrors([
        { field: ['address1'], message: 'Enter an address.' },
        {
          field: ['address', 'phoneNumber'],
          message: 'Enter a valid phone number.',
        },
        { field: ['address', 'territoryCode'], message: 'Choose a country.' },
        { field: ['address', 'zoneCode'], message: 'Zone code must exist' },
        { field: null, message: 'We could not save this address.' },
      ]),
    ).toEqual({
      fieldErrors: {
        address1: 'Enter an address.',
        countryCodeV2: 'Choose a country.',
        phone: 'Enter a valid phone number.',
        provinceCode: 'Zone code must exist',
      },
      formError: 'We could not save this address.',
    })
  })

  test('sends supported profile and address mutation variables', async () => {
    const requestServer = await createFakeCustomerAccountApiServer()
    vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', requestServer.url)

    try {
      await updateCustomerProfile(makeSession(), {
        firstName: 'Mira',
        lastName: 'Patel',
      })
      await createCustomerAddress(makeSession(), {
        address1: '99 Tea Road',
        city: 'Brisbane',
        countryCodeV2: 'AU',
        firstName: 'Mira',
        lastName: 'Patel',
        phone: '+61 411 111 111',
        provinceCode: 'QLD',
        zip: '4000',
      })
      await setDefaultCustomerAddress(
        makeSession(),
        'gid://shopify/CustomerAddress/test-address-1',
      )

      expect(
        requestServer.requests.find(
          (request) => request.operationName === 'CustomerUpdate',
        )?.variables,
      ).toEqual({
        input: {
          firstName: 'Mira',
          lastName: 'Patel',
        },
      })
      expect(
        requestServer.requests.find(
          (request) => request.operationName === 'CustomerAddressCreate',
        )?.variables,
      ).toMatchObject({
        address: {
          address1: '99 Tea Road',
          phoneNumber: '+61 411 111 111',
          territoryCode: 'AU',
          zoneCode: 'QLD',
        },
      })
      expect(
        requestServer.requests.find(
          (request) => request.operationName === 'CustomerAddressUpdate',
        )?.variables,
      ).toEqual({
        addressId: 'gid://shopify/CustomerAddress/test-address-1',
        defaultAddress: true,
      })
      expect(requestServer.profile.defaultAddress?.id).toBe(
        'gid://shopify/CustomerAddress/test-address-1',
      )

      const viewerRequest = requestServer.requests.find(
        (request) => request.operationName === 'CustomerUpdate',
      )
      expect(viewerRequest?.query).toContain('emailAddress {')
      expect(viewerRequest?.query).not.toContain('phoneNumber {')
      expect(viewerRequest?.query).toContain('countryCodeV2: territoryCode')
      expect(viewerRequest?.query).toContain('provinceCode: zoneCode')
    } finally {
      await requestServer.close()
      vi.stubEnv('SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL', serverUrl)
    }
  })

  test('fake Customer Account API rejects stale schema field selections', async () => {
    const requestServer = await createFakeCustomerAccountApiServer()

    try {
      const response = await fetch(
        `${requestServer.url}/customer-account/graphql`,
        {
          method: 'POST',
          headers: { Authorization: 'customer-access-token' },
          body: JSON.stringify({
            operationName: 'CustomerAccountViewer',
            query: /* GraphQL */ `
              query CustomerAccountViewer {
                customer {
                  id
                  emailAddress
                  phoneNumber
                  defaultAddress {
                    provinceCode
                    countryCodeV2
                    phone
                  }
                }
              }
            `,
          }),
        },
      )

      await expect(response.json()).resolves.toMatchObject({
        errors: [
          { message: 'Query includes fields outside Customer Account API' },
        ],
      })
      expect(response.ok).toBe(false)
    } finally {
      await requestServer.close()
    }
  })
})
