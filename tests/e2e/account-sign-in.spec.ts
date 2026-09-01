import { expect, test } from '@playwright/test'

import { blockThirdPartyRequests } from '../mocks/third-party-network'

test('completes sign-in through a document navigation without a fetch error', async ({
  page,
}) => {
  const browserErrors: string[] = []
  const signInRequests: Array<{
    headers: Record<string, string>
    resourceType: string
  }> = []

  await blockThirdPartyRequests(page)
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/account/login/start') {
      signInRequests.push({
        headers: request.headers(),
        resourceType: request.resourceType(),
      })
    }
  })

  await page.goto('/account/login')
  await page.getByRole('link', { name: 'Sign in with Shopify' }).click()

  await page.waitForURL('**/account')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Avery' }),
  ).toBeVisible()
  await expect(page.getByText('avery@example.test')).toBeVisible()
  expect(signInRequests).toHaveLength(1)
  expect(signInRequests[0]?.resourceType).toBe('document')
  expect(signInRequests[0]?.headers.rsc).toBeUndefined()
  expect(
    browserErrors.filter((message) =>
      /failed to fetch|networkerror when attempting to fetch/i.test(message),
    ),
  ).toEqual([])
})
