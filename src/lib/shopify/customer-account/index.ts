export { customerAccountFetch } from './client'
export { discoverCustomerAccountEndpoints } from './discovery'
export {
  getCustomerAccountConfig,
  getCustomerAccountDiscoveryBaseUrl,
  getCustomerAccountRedirectOrigin,
} from './env'
export type { CustomerAccountConfig } from './env'
export {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  normalizeReturnTo,
  buildAuthorizationUrl,
  decodeIdTokenClaims,
  exchangeCustomerAccountCode,
} from './oauth'
export type {
  BuildAuthorizationUrlInput,
  CustomerAccountTokenExchange,
  IdTokenClaims,
} from './oauth'
export {
  normalizeCustomerAccountUserErrors,
  getCustomerAccountIdentity,
  getCustomerAccountDashboard,
  getCustomerAccountOrders,
  getCustomerAccountOrder,
  updateCustomerProfile,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from './operations'
export {
  sealCustomerSession,
  unsealCustomerSession,
  sealPendingCustomerAuth,
  unsealPendingCustomerAuth,
  getCustomerAccountSession,
  setCustomerAccountSession,
  setPendingCustomerAuth,
  getPendingCustomerAuth,
  requireCustomerAccountSession,
  clearCustomerAccountCookies,
  clearPendingCustomerAuth,
  clearCustomerSessionCookie,
  setCustomerFlash,
  consumeCustomerFlash,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_AUTH_COOKIE,
  CUSTOMER_FLASH_COOKIE,
} from './session'
export type {
  CustomerAccountAddress,
  CustomerAccountOrderLineItem,
  CustomerAccountTrackingInfo,
  CustomerAccountFulfillment,
  CustomerAccountOrder,
  CustomerAccountProfile,
  CustomerAccountProfileInput,
  CustomerAccountAddressInput,
  CustomerAccountPageInfo,
  CustomerAccountConnection,
  CustomerAccountPaginatedResult,
  CustomerAccountSectionErrors,
  CustomerAccountDashboard,
  CustomerAccountUserError,
  NormalizedCustomerAccountUserErrors,
  CustomerAccountMutationResult,
  CustomerAccountFormState,
  CustomerAccountSession,
  PendingCustomerAccountAuth,
  CustomerAccountEndpoints,
} from './types'
