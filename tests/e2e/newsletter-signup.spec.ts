import { expect, test } from '@playwright/test'

import { blockThirdPartyRequests } from '../mocks/third-party-network'

const fakeShopifyPort = process.env.FAKE_SHOPIFY_PORT ?? '4517'

test.beforeEach(async ({ page }) => {
  await blockThirdPartyRequests(page)
})

test('stores a footer newsletter signup as a Shopify subscriber', async ({
  page,
}) => {
  const email = 'newsletter-e2e@example.com'
  const footer = page.getByRole('contentinfo')

  await page.goto('/')
  await footer.getByLabel('Email').fill(email)
  await footer.getByRole('button', { name: 'Subscribe' }).click()

  await expect(footer.getByRole('status')).toHaveText('Thanks for signing up.')

  const customersResponse = await page.request.get(
    `http://127.0.0.1:${fakeShopifyPort}/test/newsletter-customers`,
  )
  expect(customersResponse.ok()).toBe(true)

  const payload = (await customersResponse.json()) as {
    customers: Array<{
      email: string
      marketingState: string
    }>
  }
  expect(payload.customers).toEqual([
    {
      email,
      id: 'gid://shopify/Customer/fake-newsletter-1',
      marketingState: 'SUBSCRIBED',
    },
  ])

  await footer.getByLabel('Email').fill(email)
  await footer.getByRole('button', { name: 'Subscribe' }).click()
  await expect(footer.getByRole('status')).toHaveText('Thanks for signing up.')

  const repeatedCustomersResponse = await page.request.get(
    `http://127.0.0.1:${fakeShopifyPort}/test/newsletter-customers`,
  )
  const repeatedPayload = (await repeatedCustomersResponse.json()) as {
    customers: unknown[]
  }
  expect(repeatedPayload.customers).toHaveLength(1)
})
