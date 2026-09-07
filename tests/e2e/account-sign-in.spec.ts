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

test('logs out through a document navigation and clears storefront and provider sessions', async ({
  page,
  context,
  baseURL,
}) => {
  const browserErrors: string[] = []
  const logoutRequests: Array<{
    pathname: string
    headers: Record<string, string>
    resourceType: string
  }> = []

  await blockThirdPartyRequests(page)
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('request', (request) => {
    const pathname = new URL(request.url()).pathname
    if (
      pathname === '/account/logout' ||
      pathname === '/authentication/logout'
    ) {
      logoutRequests.push({
        pathname,
        headers: request.headers(),
        resourceType: request.resourceType(),
      })
    }
  })

  await page.goto('/account/login')
  await page.getByRole('link', { name: 'Sign in with Shopify' }).click()
  await expect(page.getByText('avery@example.test')).toBeVisible()
  const signedInCookies = (await context.cookies()).map(({ name }) => name)
  expect(signedInCookies).toContain('teavision_customer_session')
  expect(signedInCookies).toContain('fake_customer_session')
  if (!baseURL) throw new Error('Playwright baseURL is required')
  await context.addCookies([
    { name: 'teavision_cart', value: 'previous-account-cart', url: baseURL },
  ])

  await page.getByRole('link', { name: 'Log out', exact: true }).click()
  await expect(page).toHaveURL(`${baseURL}/account/login`)
  await expect(
    page.getByRole('link', { name: 'Sign in with Shopify' }),
  ).toBeVisible()

  expect(logoutRequests.map(({ pathname }) => pathname)).toEqual([
    '/account/logout',
    '/authentication/logout',
  ])
  for (const request of logoutRequests) {
    expect(request.resourceType).toBe('document')
    expect(request.headers.rsc).toBeUndefined()
  }
  const remainingCookies = (await context.cookies()).map(({ name }) => name)
  expect(remainingCookies).not.toContain('teavision_customer_session')
  expect(remainingCookies).not.toContain('teavision_cart')
  expect(remainingCookies).not.toContain('fake_customer_session')
  expect(
    browserErrors.filter((message) =>
      /failed to fetch|networkerror when attempting to fetch/i.test(message),
    ),
  ).toEqual([])

  // A protected page must not restore the locally cleared account.
  await page.goto('/account')
  await expect(
    page.getByRole('link', { name: 'Sign in with Shopify' }),
  ).toBeVisible()
})
