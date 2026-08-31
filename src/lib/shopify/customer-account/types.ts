import type { Money } from '@/lib/shopify/types'

export type CustomerAccountAddress = {
  id: string
  firstName: string | null
  lastName: string | null
  address1: string | null
  address2: string | null
  city: string | null
  provinceCode: string | null
  zip: string | null
  countryCodeV2: string | null
  phone: string | null
  formatted: string[]
}

export type CustomerAccountOrderLineItem = {
  title: string
  quantity: number
  unitPrice: Money
  totalPrice: Money
}

export type CustomerAccountTrackingInfo = {
  number: string | null
  url: string | null
}

export type CustomerAccountFulfillment = {
  trackingCompany: string | null
  trackingInfo: CustomerAccountTrackingInfo[]
}

export type CustomerAccountOrder = {
  id: string
  name: string
  processedAt: string | null
  financialStatus: string | null
  fulfillmentStatus: string | null
  totalPrice: Money
  lineItems: CustomerAccountOrderLineItem[]
  shippingAddress: CustomerAccountAddress | null
  fulfillments: CustomerAccountFulfillment[]
  statusPageUrl: string | null
}

export type CustomerAccountProfile = {
  id: string
  emailAddress: string | null
  firstName: string | null
  lastName: string | null
  defaultAddress: CustomerAccountAddress | null
  addresses: CustomerAccountAddress[]
  orders: CustomerAccountOrder[]
}

export type CustomerAccountProfileInput = {
  firstName?: string | null
  lastName?: string | null
}

export type CustomerAccountAddressInput = {
  firstName?: string | null
  lastName?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  provinceCode?: string | null
  zip?: string | null
  countryCodeV2?: string | null
  phone?: string | null
  defaultAddress?: boolean
}

export type CustomerAccountPageInfo = {
  endCursor: string | null
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
}

export type CustomerAccountConnection<T> = {
  nodes?: T[]
  edges?: Array<{ node: T }>
  pageInfo?: Partial<CustomerAccountPageInfo>
}

export type CustomerAccountPaginatedResult<T> = {
  items: T[]
  pageInfo: CustomerAccountPageInfo
}

export type CustomerAccountSectionErrors = {
  addresses?: string
  orders?: string
  profile?: string
}

export type CustomerAccountDashboard = {
  defaultAddress: CustomerAccountAddress | null
  profile: CustomerAccountProfile | null
  recentOrders: CustomerAccountOrder[]
  sectionErrors: CustomerAccountSectionErrors
}

export type CustomerAccountUserError = {
  field: string[] | null
  message: string
}

export type NormalizedCustomerAccountUserErrors = {
  fieldErrors: Record<string, string>
  formError: string | null
}

export type CustomerAccountMutationResult<T> = {
  data: T | null
  userErrors: CustomerAccountUserError[]
}

export type CustomerAccountFormState = {
  fieldErrors: Record<string, string>
  message: string | null
  status: 'idle' | 'success' | 'error'
}

export type CustomerAccountSession = {
  accessToken: string
  refreshToken: string
  idToken: string
  expiresAt: number
  customerId: string
}

export type PendingCustomerAccountAuth = {
  codeVerifier: string
  createdAt: number
  nonce: string
  returnTo: string
  state: string
}

export type CustomerAccountEndpoints = {
  authorizationEndpoint: string
  graphqlEndpoint: string
  issuer: string
  jwksUri: string
  logoutEndpoint: string
  tokenEndpoint: string
}
