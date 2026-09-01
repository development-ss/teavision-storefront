import { customerAccountFetch } from './client'
import type {
  CustomerAccountAddress,
  CustomerAccountAddressInput,
  CustomerAccountConnection,
  CustomerAccountDashboard,
  CustomerAccountMutationResult,
  CustomerAccountOrder,
  CustomerAccountPageInfo,
  CustomerAccountPaginatedResult,
  CustomerAccountProfile,
  CustomerAccountProfileInput,
  CustomerAccountSession,
  CustomerAccountUserError,
  NormalizedCustomerAccountUserErrors,
} from './types'

const CUSTOMER_ACCOUNT_ADDRESS_FIELDS = /* GraphQL */ `
  fragment CustomerAccountAddressFields on CustomerAddress {
    id
    firstName
    lastName
    address1
    address2
    city
    provinceCode: zoneCode
    zip
    countryCodeV2: territoryCode
    phone: phoneNumber
    formatted
  }
`

const CUSTOMER_ACCOUNT_VIEWER_QUERY = /* GraphQL */ `
  query CustomerAccountViewer {
    customer {
      id
      emailAddress {
        emailAddress
      }
      firstName
      lastName
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        provinceCode: zoneCode
        zip
        countryCodeV2: territoryCode
        phone: phoneNumber
        formatted
      }
      addresses(first: 20) {
        nodes {
          id
          firstName
          lastName
          address1
          address2
          city
          provinceCode: zoneCode
          zip
          countryCodeV2: territoryCode
          phone: phoneNumber
          formatted
        }
      }
      orders(first: 5) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          statusPageUrl
        }
      }
    }
  }
`

const CUSTOMER_ACCOUNT_IDENTITY_QUERY = /* GraphQL */ `
  query CustomerAccountIdentity {
    customer {
      id
      emailAddress {
        emailAddress
      }
    }
  }
`

const CUSTOMER_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        emailAddress {
          emailAddress
        }
        firstName
        lastName
        defaultAddress {
          ...CustomerAccountAddressFields
        }
        addresses(first: 20) {
          nodes {
            ...CustomerAccountAddressFields
          }
        }
        orders(first: 5) {
          nodes {
            id
            name
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            statusPageUrl
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }

  ${CUSTOMER_ACCOUNT_ADDRESS_FIELDS}
`

const CUSTOMER_ADDRESS_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressCreate(
    $address: CustomerAddressInput!
    $defaultAddress: Boolean
  ) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        ...CustomerAccountAddressFields
      }
      userErrors {
        field
        message
      }
    }
  }

  ${CUSTOMER_ACCOUNT_ADDRESS_FIELDS}
`

const CUSTOMER_ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(
      addressId: $addressId
      address: $address
      defaultAddress: $defaultAddress
    ) {
      customerAddress {
        ...CustomerAccountAddressFields
      }
      userErrors {
        field
        message
      }
    }
  }

  ${CUSTOMER_ACCOUNT_ADDRESS_FIELDS}
`

const CUSTOMER_ADDRESS_DELETE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors {
        field
        message
      }
    }
  }
`

const CUSTOMER_ACCOUNT_ORDERS_QUERY = /* GraphQL */ `
  query CustomerAccountOrders(
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    customer {
      orders(first: $first, after: $after, last: $last, before: $before) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
          statusPageUrl
        }
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`

const CUSTOMER_ACCOUNT_ORDER_QUERY = /* GraphQL */ `
  query CustomerAccountOrder($orderId: ID!) {
    order(id: $orderId) {
      id
      name
      processedAt
      financialStatus
      fulfillmentStatus
      totalPrice {
        amount
        currencyCode
      }
      lineItems(first: 100) {
        nodes {
          title
          quantity
          unitPrice: price {
            amount
            currencyCode
          }
          totalPrice {
            amount
            currencyCode
          }
        }
      }
      shippingAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        provinceCode: zoneCode
        zip
        countryCodeV2: territoryCode
        phone: phoneNumber
        formatted
      }
      fulfillments(first: 10) {
        nodes {
          trackingInformation {
            company
            number
            url
          }
        }
      }
      statusPageUrl
    }
  }
`

type RawConnection<T> = CustomerAccountConnection<T> | T[] | null | undefined

type RawCustomerAccountAddress = CustomerAccountAddress

type RawCustomerAccountEmailAddress = {
  emailAddress?: string | null
}

type RawCustomer = Omit<
  CustomerAccountProfile,
  'addresses' | 'defaultAddress' | 'emailAddress' | 'orders'
> & {
  addresses?: RawConnection<RawCustomerAccountAddress>
  defaultAddress?: RawCustomerAccountAddress | null
  emailAddress?: RawCustomerAccountEmailAddress | null
  orders?: RawConnection<CustomerAccountOrder>
}

type ViewerResponse = {
  customer: RawCustomer | null
}

type IdentityResponse = {
  customer: {
    id: string
    emailAddress?: RawCustomerAccountEmailAddress | null
  } | null
}

type OrdersResponse = {
  customer: {
    orders: RawConnection<CustomerAccountOrder>
  } | null
}

type OrderResponse = {
  order: RawCustomerAccountOrder | null
}

type CustomerUpdateResponse = {
  customerUpdate: {
    customer: RawCustomer | null
    userErrors: CustomerAccountUserError[]
  }
}

type AddressMutationResponse = {
  customerAddressCreate?: {
    customerAddress: CustomerAccountAddress | null
    userErrors: CustomerAccountUserError[]
  }
  customerAddressUpdate?: {
    customerAddress: CustomerAccountAddress | null
    userErrors: CustomerAccountUserError[]
  }
}

type AddressDeleteResponse = {
  customerAddressDelete: {
    deletedAddressId: string | null
    userErrors: CustomerAccountUserError[]
  }
}

type RawCustomerAccountFulfillment = {
  trackingInformation?: Array<{
    company: string | null
    number: string | null
    url: string | null
  }>
}

type RawCustomerAccountOrder = Omit<
  CustomerAccountOrder,
  'fulfillments' | 'lineItems'
> & {
  fulfillments?: RawConnection<RawCustomerAccountFulfillment>
  lineItems?: RawConnection<CustomerAccountOrder['lineItems'][number]>
}

type CustomerAccountAddressApiInput = {
  address1?: string | null
  address2?: string | null
  city?: string | null
  firstName?: string | null
  lastName?: string | null
  phoneNumber?: string | null
  territoryCode?: string | null
  zip?: string | null
  zoneCode?: string | null
}

type CustomerAccountAddressVariables = {
  address: CustomerAccountAddressApiInput
  defaultAddress?: boolean
}

function emptyPageInfo(): CustomerAccountPageInfo {
  return {
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: null,
  }
}

function connectionNodes<T>(connection: RawConnection<T>): T[] {
  if (!connection) return []
  if (Array.isArray(connection)) return connection
  if (Array.isArray(connection.nodes)) return connection.nodes
  if (Array.isArray(connection.edges))
    return connection.edges.map((edge) => edge.node)

  return []
}

function connectionPageInfo<T>(
  connection: RawConnection<T>,
): CustomerAccountPageInfo {
  if (Array.isArray(connection)) return emptyPageInfo()

  const pageInfo = connection?.pageInfo

  return {
    endCursor: pageInfo?.endCursor ?? null,
    hasNextPage: pageInfo?.hasNextPage ?? false,
    hasPreviousPage: pageInfo?.hasPreviousPage ?? false,
    startCursor: pageInfo?.startCursor ?? null,
  }
}

function reshapeCustomer(customer: RawCustomer): CustomerAccountProfile {
  return {
    ...customer,
    addresses: connectionNodes(customer.addresses),
    defaultAddress: customer.defaultAddress ?? null,
    emailAddress: customer.emailAddress?.emailAddress ?? null,
    orders: connectionNodes(customer.orders),
  }
}

function reshapeOrder(order: RawCustomerAccountOrder): CustomerAccountOrder {
  const fulfillments = connectionNodes(order.fulfillments).map(
    (fulfillment) => {
      const trackingInfo =
        fulfillment.trackingInformation?.map((tracking) => ({
          number: tracking.number,
          url: tracking.url,
        })) ?? []

      return {
        trackingCompany: fulfillment.trackingInformation?.[0]?.company ?? null,
        trackingInfo,
      }
    },
  )

  return {
    ...order,
    fulfillments,
    lineItems: connectionNodes(order.lineItems),
  }
}

function fieldKeyFromUserError(error: CustomerAccountUserError): string | null {
  const field = error.field?.filter(Boolean)
  if (!field?.length) return null

  return field[field.length - 1] ?? null
}

function toCustomerAddressApiInput(
  input: CustomerAccountAddressInput,
): CustomerAccountAddressVariables {
  return {
    address: {
      address1: input.address1,
      address2: input.address2,
      city: input.city,
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phone,
      territoryCode: input.countryCodeV2,
      zip: input.zip,
      zoneCode: input.provinceCode,
    },
    defaultAddress: input.defaultAddress,
  }
}

export function normalizeCustomerAccountUserErrors(
  errors: CustomerAccountUserError[],
): NormalizedCustomerAccountUserErrors {
  const fieldErrors: Record<string, string> = {}
  let formError: string | null = null

  errors.forEach((error) => {
    const fieldKey = fieldKeyFromUserError(error)

    if (fieldKey) {
      fieldErrors[fieldKey] ??= error.message
      return
    }

    formError ??= error.message
  })

  return { fieldErrors, formError }
}

export async function getCustomerAccountDashboard(
  session: CustomerAccountSession,
): Promise<CustomerAccountDashboard> {
  const data = await customerAccountFetch<ViewerResponse>({
    query: CUSTOMER_ACCOUNT_VIEWER_QUERY,
    session,
  })

  if (!data.customer) {
    return {
      defaultAddress: null,
      profile: null,
      recentOrders: [],
      sectionErrors: { profile: 'We could not load this account section.' },
    }
  }

  const sectionErrors: CustomerAccountDashboard['sectionErrors'] = {}
  if (!data.customer.addresses) {
    sectionErrors.addresses = 'We could not load saved addresses.'
  }
  if (!data.customer.orders) {
    sectionErrors.orders = 'We could not load recent orders.'
  }

  const profile = reshapeCustomer(data.customer)

  return {
    defaultAddress: profile.defaultAddress,
    profile,
    recentOrders: profile.orders,
    sectionErrors,
  }
}

export async function getCustomerAccountIdentity(
  session: Pick<CustomerAccountSession, 'accessToken'>,
): Promise<{ customerId: string; email: string | null } | null> {
  const data = await customerAccountFetch<IdentityResponse>({
    query: CUSTOMER_ACCOUNT_IDENTITY_QUERY,
    session,
  })

  if (!data.customer) return null

  return {
    customerId: data.customer.id,
    email: data.customer.emailAddress?.emailAddress ?? null,
  }
}

export async function getCustomerAccountOrders(
  session: CustomerAccountSession,
  variables: {
    after?: string
    before?: string
    first?: number
    last?: number
  },
): Promise<CustomerAccountPaginatedResult<CustomerAccountOrder>> {
  const data = await customerAccountFetch<OrdersResponse, typeof variables>({
    query: CUSTOMER_ACCOUNT_ORDERS_QUERY,
    session,
    variables,
  })
  const orders = data.customer?.orders

  return {
    items: connectionNodes(orders),
    pageInfo: connectionPageInfo(orders),
  }
}

export async function getCustomerAccountOrder(
  session: CustomerAccountSession,
  orderId: string,
): Promise<CustomerAccountOrder | null> {
  const data = await customerAccountFetch<OrderResponse, { orderId: string }>({
    query: CUSTOMER_ACCOUNT_ORDER_QUERY,
    session,
    variables: { orderId },
  })

  return data.order ? reshapeOrder(data.order) : null
}

export async function updateCustomerProfile(
  session: CustomerAccountSession,
  input: CustomerAccountProfileInput,
): Promise<CustomerAccountMutationResult<CustomerAccountProfile>> {
  const customerInput = {
    firstName: input.firstName,
    lastName: input.lastName,
  }
  const data = await customerAccountFetch<
    CustomerUpdateResponse,
    { input: typeof customerInput }
  >({
    query: CUSTOMER_UPDATE_MUTATION,
    session,
    variables: { input: customerInput },
  })

  return {
    data: data.customerUpdate.customer
      ? reshapeCustomer(data.customerUpdate.customer)
      : null,
    userErrors: data.customerUpdate.userErrors,
  }
}

export async function createCustomerAddress(
  session: CustomerAccountSession,
  input: CustomerAccountAddressInput,
): Promise<CustomerAccountMutationResult<CustomerAccountAddress>> {
  const variables = toCustomerAddressApiInput(input)
  const data = await customerAccountFetch<
    AddressMutationResponse,
    CustomerAccountAddressVariables
  >({
    query: CUSTOMER_ADDRESS_CREATE_MUTATION,
    session,
    variables,
  })
  const result = data.customerAddressCreate

  return {
    data: result?.customerAddress ?? null,
    userErrors: result?.userErrors ?? [],
  }
}

export async function updateCustomerAddress(
  session: CustomerAccountSession,
  addressId: string,
  input: CustomerAccountAddressInput,
): Promise<CustomerAccountMutationResult<CustomerAccountAddress>> {
  const variables = toCustomerAddressApiInput(input)
  const data = await customerAccountFetch<
    AddressMutationResponse,
    {
      address: CustomerAccountAddressApiInput
      addressId: string
      defaultAddress?: boolean
    }
  >({
    query: CUSTOMER_ADDRESS_UPDATE_MUTATION,
    session,
    variables: { addressId, ...variables },
  })
  const result = data.customerAddressUpdate

  return {
    data: result?.customerAddress ?? null,
    userErrors: result?.userErrors ?? [],
  }
}

export async function deleteCustomerAddress(
  session: CustomerAccountSession,
  addressId: string,
): Promise<CustomerAccountMutationResult<string>> {
  const data = await customerAccountFetch<
    AddressDeleteResponse,
    { addressId: string }
  >({
    query: CUSTOMER_ADDRESS_DELETE_MUTATION,
    session,
    variables: { addressId },
  })

  return {
    data: data.customerAddressDelete.deletedAddressId,
    userErrors: data.customerAddressDelete.userErrors,
  }
}

export async function setDefaultCustomerAddress(
  session: CustomerAccountSession,
  addressId: string,
): Promise<CustomerAccountMutationResult<CustomerAccountAddress>> {
  const data = await customerAccountFetch<
    AddressMutationResponse,
    { addressId: string; defaultAddress: boolean }
  >({
    query: CUSTOMER_ADDRESS_UPDATE_MUTATION,
    session,
    variables: { addressId, defaultAddress: true },
  })
  const result = data.customerAddressUpdate

  return {
    data: result?.customerAddress ?? null,
    userErrors: result?.userErrors ?? [],
  }
}
