import 'server-only'

import { logEvent } from '@/lib/observability/logger'

import { shopifyAdminFetch } from './admin-client'

type NewsletterCustomer = {
  defaultEmailAddress: {
    emailAddress: string
    marketingState:
      | 'INVALID'
      | 'NOT_SUBSCRIBED'
      | 'PENDING'
      | 'REDACTED'
      | 'SUBSCRIBED'
      | 'UNSUBSCRIBED'
  } | null
  id: string
}

type ShopifyUserError = {
  field: string[] | null
  message: string
}

type FindCustomerData = {
  customer: NewsletterCustomer | null
}

type FindCustomerVariables = {
  identifier: {
    emailAddress: string
  }
}

type CustomerMutationPayload = {
  customer: { id: string } | null
  userErrors: ShopifyUserError[]
}

type CreateCustomerData = {
  customerCreate: CustomerMutationPayload
}

type CreateCustomerVariables = {
  input: {
    email: string
    emailMarketingConsent: {
      consentUpdatedAt: string
      marketingOptInLevel: 'SINGLE_OPT_IN'
      marketingState: 'SUBSCRIBED'
    }
  }
}

type UpdateCustomerData = {
  customerEmailMarketingConsentUpdate: CustomerMutationPayload
}

type UpdateCustomerVariables = {
  input: {
    customerId: string
    emailMarketingConsent: {
      consentUpdatedAt: string
      marketingOptInLevel: 'SINGLE_OPT_IN'
      marketingState: 'SUBSCRIBED'
    }
  }
}

const FIND_CUSTOMER_QUERY = `
  query FindNewsletterCustomer($identifier: CustomerIdentifierInput!) {
    customer: customerByIdentifier(identifier: $identifier) {
      id
      defaultEmailAddress {
        emailAddress
        marketingState
      }
    }
  }
`

const CREATE_CUSTOMER_MUTATION = `
  mutation CreateNewsletterCustomer($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`

const UPDATE_CUSTOMER_MUTATION = `
  mutation UpdateNewsletterCustomer($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`

function logMutationUserErrors(operation: string, errors: ShopifyUserError[]) {
  logEvent('error', 'shopify_admin_failed', {
    errorCount: errors.length,
    operation,
    status: 'user-errors',
  })
}

function logMissingMutationCustomer(operation: string) {
  logEvent('error', 'shopify_admin_failed', {
    operation,
    status: 'missing-customer',
  })
}

async function findCustomer(email: string): Promise<NewsletterCustomer | null> {
  const data = await shopifyAdminFetch<FindCustomerData, FindCustomerVariables>(
    {
      query: FIND_CUSTOMER_QUERY,
      variables: { identifier: { emailAddress: email } },
    },
  )

  return data.customer
}

async function updateCustomerConsent(
  customerId: string,
  consentUpdatedAt: string,
): Promise<void> {
  const data = await shopifyAdminFetch<
    UpdateCustomerData,
    UpdateCustomerVariables
  >({
    query: UPDATE_CUSTOMER_MUTATION,
    variables: {
      input: {
        customerId,
        emailMarketingConsent: {
          consentUpdatedAt,
          marketingOptInLevel: 'SINGLE_OPT_IN',
          marketingState: 'SUBSCRIBED',
        },
      },
    },
  })

  const result = data.customerEmailMarketingConsentUpdate
  const errors = result.userErrors
  if (errors.length) {
    logMutationUserErrors('UpdateNewsletterCustomer', errors)
    throw new Error('Shopify newsletter subscription failed')
  }

  if (!result.customer) {
    logMissingMutationCustomer('UpdateNewsletterCustomer')
    throw new Error('Shopify newsletter subscription failed')
  }
}

async function createCustomer(
  email: string,
  consentUpdatedAt: string,
): Promise<ShopifyUserError[]> {
  const data = await shopifyAdminFetch<
    CreateCustomerData,
    CreateCustomerVariables
  >({
    query: CREATE_CUSTOMER_MUTATION,
    variables: {
      input: {
        email,
        emailMarketingConsent: {
          consentUpdatedAt,
          marketingOptInLevel: 'SINGLE_OPT_IN',
          marketingState: 'SUBSCRIBED',
        },
      },
    },
  })

  const result = data.customerCreate
  if (result.userErrors.length) {
    return result.userErrors
  }

  if (!result.customer) {
    logMissingMutationCustomer('CreateNewsletterCustomer')
    throw new Error('Shopify newsletter subscription failed')
  }

  return []
}

export async function subscribeNewsletterEmail(
  email: string,
  consentUpdatedAt = new Date().toISOString(),
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase()
  const existingCustomer = await findCustomer(normalizedEmail)

  if (existingCustomer) {
    if (existingCustomer.defaultEmailAddress?.marketingState === 'SUBSCRIBED') {
      return
    }

    await updateCustomerConsent(existingCustomer.id, consentUpdatedAt)
    return
  }

  const createErrors = await createCustomer(normalizedEmail, consentUpdatedAt)
  if (!createErrors.length) {
    return
  }

  logMutationUserErrors('CreateNewsletterCustomer', createErrors)

  // A concurrent signup can win the create race. Re-read once and update the
  // customer rather than surfacing a duplicate-email error to the subscriber.
  const racedCustomer = await findCustomer(normalizedEmail)
  if (racedCustomer) {
    if (racedCustomer.defaultEmailAddress?.marketingState === 'SUBSCRIBED') {
      return
    }

    await updateCustomerConsent(racedCustomer.id, consentUpdatedAt)
    return
  }

  throw new Error('Shopify newsletter subscription failed')
}
