import { beforeEach, describe, expect, test, vi } from 'vitest'

import { logEvent } from '@/lib/observability/logger'

import { subscribeNewsletterEmail } from './newsletter-subscription'

const { shopifyAdminFetchMock } = vi.hoisted(() => ({
  shopifyAdminFetchMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/observability/logger', () => ({
  logEvent: vi.fn(),
}))

vi.mock('./admin-client', () => ({
  shopifyAdminFetch: shopifyAdminFetchMock,
}))

const logEventMock = vi.mocked(logEvent)

const SUBMITTED_AT = '2026-08-28T02:30:00.000Z'

function customer(
  marketingState:
    | 'INVALID'
    | 'NOT_SUBSCRIBED'
    | 'PENDING'
    | 'REDACTED'
    | 'SUBSCRIBED'
    | 'UNSUBSCRIBED',
) {
  return {
    customer: {
      defaultEmailAddress: {
        emailAddress: 'buyer@example.com',
        marketingState,
      },
      id: 'gid://shopify/Customer/123',
    },
  }
}

describe('subscribeNewsletterEmail', () => {
  beforeEach(() => {
    shopifyAdminFetchMock.mockReset()
    logEventMock.mockClear()
  })

  test('creates a new subscribed customer', async () => {
    shopifyAdminFetchMock
      .mockResolvedValueOnce({ customer: null })
      .mockResolvedValueOnce({
        customerCreate: {
          customer: { id: 'gid://shopify/Customer/123' },
          userErrors: [],
        },
      })

    await expect(
      subscribeNewsletterEmail(' Buyer@Example.com ', SUBMITTED_AT),
    ).resolves.toBeUndefined()

    expect(shopifyAdminFetchMock).toHaveBeenCalledTimes(2)
    expect(shopifyAdminFetchMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variables: { identifier: { emailAddress: 'buyer@example.com' } },
      }),
    )
    expect(shopifyAdminFetchMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: {
          input: {
            email: 'buyer@example.com',
            emailMarketingConsent: {
              consentUpdatedAt: SUBMITTED_AT,
              marketingOptInLevel: 'SINGLE_OPT_IN',
              marketingState: 'SUBSCRIBED',
            },
          },
        },
      }),
    )
  })

  test('updates an existing unsubscribed customer', async () => {
    shopifyAdminFetchMock
      .mockResolvedValueOnce(customer('UNSUBSCRIBED'))
      .mockResolvedValueOnce({
        customerEmailMarketingConsentUpdate: {
          customer: { id: 'gid://shopify/Customer/123' },
          userErrors: [],
        },
      })

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).resolves.toBeUndefined()

    expect(shopifyAdminFetchMock).toHaveBeenCalledTimes(2)
    expect(shopifyAdminFetchMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: {
          input: {
            customerId: 'gid://shopify/Customer/123',
            emailMarketingConsent: {
              consentUpdatedAt: SUBMITTED_AT,
              marketingOptInLevel: 'SINGLE_OPT_IN',
              marketingState: 'SUBSCRIBED',
            },
          },
        },
      }),
    )
  })

  test('fails when updating an existing customer returns user errors', async () => {
    shopifyAdminFetchMock
      .mockResolvedValueOnce(customer('UNSUBSCRIBED'))
      .mockResolvedValueOnce({
        customerEmailMarketingConsentUpdate: {
          customer: null,
          userErrors: [{ field: ['emailMarketingConsent'], message: 'Denied' }],
        },
      })

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).rejects.toThrow('Shopify newsletter subscription failed')
    expect(logEventMock).toHaveBeenCalledWith('error', 'shopify_admin_failed', {
      errorCount: 1,
      operation: 'UpdateNewsletterCustomer',
      status: 'user-errors',
    })
  })

  test('fails when creation returns no customer and no user errors', async () => {
    shopifyAdminFetchMock
      .mockResolvedValueOnce({ customer: null })
      .mockResolvedValueOnce({
        customerCreate: { customer: null, userErrors: [] },
      })

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).rejects.toThrow('Shopify newsletter subscription failed')
  })

  test('does not issue a mutation for an already subscribed customer', async () => {
    shopifyAdminFetchMock.mockResolvedValueOnce(customer('SUBSCRIBED'))

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).resolves.toBeUndefined()

    expect(shopifyAdminFetchMock).toHaveBeenCalledTimes(1)
  })

  test('updates a customer found after a concurrent create race', async () => {
    shopifyAdminFetchMock
      .mockResolvedValueOnce({ customer: null })
      .mockResolvedValueOnce({
        customerCreate: {
          customer: null,
          userErrors: [
            { field: ['email'], message: 'Email has already been taken' },
          ],
        },
      })
      .mockResolvedValueOnce(customer('UNSUBSCRIBED'))
      .mockResolvedValueOnce({
        customerEmailMarketingConsentUpdate: {
          customer: { id: 'gid://shopify/Customer/123' },
          userErrors: [],
        },
      })

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).resolves.toBeUndefined()

    expect(shopifyAdminFetchMock).toHaveBeenCalledTimes(4)
    expect(logEventMock).toHaveBeenCalledWith('error', 'shopify_admin_failed', {
      errorCount: 1,
      operation: 'CreateNewsletterCustomer',
      status: 'user-errors',
    })
  })

  test('fails when customer creation returns errors and no customer exists', async () => {
    shopifyAdminFetchMock
      .mockResolvedValueOnce({ customer: null })
      .mockResolvedValueOnce({
        customerCreate: {
          customer: null,
          userErrors: [{ field: ['email'], message: 'Creation failed' }],
        },
      })
      .mockResolvedValueOnce({ customer: null })

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).rejects.toThrow('Shopify newsletter subscription failed')
  })

  test('propagates Admin transport failures', async () => {
    shopifyAdminFetchMock.mockRejectedValueOnce(
      new Error('Shopify unavailable'),
    )

    await expect(
      subscribeNewsletterEmail('buyer@example.com', SUBMITTED_AT),
    ).rejects.toThrow('Shopify unavailable')
  })
})
