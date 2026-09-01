import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { sealCustomerSession } from '../../src/lib/shopify/customer-account/session'
import { blockThirdPartyRequests } from '../mocks/third-party-network'

const customerSessionSecret = 'test-session-secret-with-at-least-32-characters'
const localBaseUrl = `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '4173'}`
const fakeShopifyBaseUrl = `http://127.0.0.1:${process.env.FAKE_SHOPIFY_PORT ?? '4517'}`
const hostedShopifyCheckoutPattern =
  /myshopify\.com\/checkouts|checkout\.shopify\.com/

test.beforeEach(async ({ page }) => {
  await blockThirdPartyRequests(page)
})

async function setCustomerSession(
  page: Page,
  accessToken: string,
  customerId = 'gid://shopify/Customer/test-customer-1',
) {
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET = customerSessionSecret
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE = 'true'
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID = 'test-client-id'
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI = `${localBaseUrl}/account/login`
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI = `${localBaseUrl}/account/callback`
  process.env.SHOPIFY_STORE_DOMAIN = 'fake-shopify.test'

  await page.context().addCookies([
    {
      httpOnly: true,
      name: 'teavision_customer_session',
      sameSite: 'Lax',
      url: localBaseUrl,
      value: sealCustomerSession({
        accessToken,
        customerId,
        expiresAt: Date.now() + 60 * 60 * 1000,
        idToken: 'id-token',
        refreshToken: 'refresh-token',
      }),
    },
  ])
}

test('adds a product to cart, updates the cart, removes it, and exposes only fake checkout handoff', async ({
  page,
}) => {
  await page.goto('/products/test-standard-tea')

  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText('5 added to cart')).toBeVisible()
  await expect(page.getByText('5 items in cart')).toBeAttached()

  await page.goto('/cart')
  await expect(page.getByRole('list', { name: 'Cart items' })).toContainText(
    'Test Standard Tea',
  )
  await expect(page.getByRole('list', { name: 'Cart items' })).toContainText(
    '$120.00',
  )
  await expect(page.getByText('$120.00').last()).toBeVisible()
  await expect(page.getByText('$105.00')).toHaveCount(0)
  await expect(page.locator('form#cart-checkout-form')).toHaveAttribute(
    'action',
    /\/cart\/checkout$/,
  )
  await page.getByLabel('I have read and agree to the Terms of Service').click()
  await expect(page.getByText(/Checking out as a guest/)).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Sign in to use saved addresses' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Proceed to checkout' }),
  ).toBeEnabled()

  await page
    .getByRole('button', { name: 'Increase quantity of Test Standard Tea' })
    .click()
  await expect(
    page.getByRole('spinbutton', { name: 'Quantity of Test Standard Tea' }),
  ).toHaveValue('10')
  await page.reload()
  await expect(page.getByText('10 items', { exact: true }).last()).toBeVisible()
  await expect(page.getByRole('list', { name: 'Cart items' })).toContainText(
    '$240.00',
  )
  await expect(page.getByText('$240.00').last()).toBeVisible()
  await expect(page.getByText('$210.00')).toHaveCount(0)

  await page
    .getByRole('button', { name: 'Remove Test Standard Tea from cart' })
    .click()
  await expect(page.getByText('Your cart is empty')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Proceed to checkout' }),
  ).toHaveCount(0)
})

test('signed-in customer reaches only the fake checkout handoff', async ({
  page,
}) => {
  const observedBrowserUrls: string[] = []
  page.on('response', (response) => {
    observedBrowserUrls.push(response.url())
  })
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      observedBrowserUrls.push(frame.url())
    }
  })

  await setCustomerSession(page, 'customer-access-token')
  await page.goto('/products/test-standard-tea')

  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText('5 added to cart')).toBeVisible()

  await page.goto('/cart')
  await expect(
    page.getByText('Checking out with your Teavision account'),
  ).toBeVisible()
  await page.getByLabel('Order notes').fill('Keep this shipment dry')
  await page.getByLabel('I have read and agree to the Terms of Service').click()

  const checkoutResponse = page.waitForResponse((response) =>
    response.url().endsWith('/cart/checkout'),
  )
  await page.getByRole('button', { name: 'Proceed to checkout' }).click()
  const response = await checkoutResponse

  expect(response.headers().location).toBe(
    'https://checkout.test/cart/fake-cart',
  )
  expect(
    observedBrowserUrls.some((url) => hostedShopifyCheckoutPattern.test(url)),
  ).toBe(false)
  expect(hostedShopifyCheckoutPattern.test(page.url())).toBe(false)

  const noteResponse = await page.request.get(
    `${fakeShopifyBaseUrl}/test/cart-note`,
  )
  expect(noteResponse.ok()).toBe(true)
  await expect(noteResponse.json()).resolves.toEqual({
    note: 'Keep this shipment dry',
  })
})

test('buyer identity sync failure blocks checkout with recovery actions', async ({
  page,
}) => {
  await setCustomerSession(page, 'force-identity-sync-failure')
  await page.goto('/products/test-standard-tea')

  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText('5 added to cart')).toBeVisible()

  await page.goto('/cart')
  await page.getByLabel('I have read and agree to the Terms of Service').click()
  await page.getByRole('button', { name: 'Proceed to checkout' }).click()
  await page.waitForURL('**/cart?checkout=identity-sync-failed')

  await expect(
    page.getByText(
      'We could not confirm your account for checkout. Retry checkout or sign in again before continuing.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Retry checkout' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign in again' })).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Contact support' }),
  ).toBeVisible()

  expect(hostedShopifyCheckoutPattern.test(page.url())).toBe(false)
})

test('switching Teavision accounts starts a fresh cart instead of transferring items', async ({
  page,
}) => {
  await setCustomerSession(
    page,
    'customer-access-token-a',
    'gid://shopify/Customer/test-customer-1',
  )
  await page.goto('/products/test-standard-tea')
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText('5 added to cart')).toBeVisible()

  await setCustomerSession(
    page,
    'customer-access-token-b',
    'gid://shopify/Customer/test-customer-2',
  )
  await page.goto('/cart')

  await expect(page.getByText('Your cart is empty')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Cart items' })).toHaveCount(0)

  await page.goto('/products/test-standard-tea')
  await page.getByRole('button', { name: 'Add to Cart' }).click()
  await expect(page.getByText('5 added to cart')).toBeVisible()
  await page.goto('/cart')
  await expect(page.getByRole('list', { name: 'Cart items' })).toContainText(
    'Test Standard Tea',
  )
})

test('account migration links and legacy routes use the modern bridge', async ({
  page,
}) => {
  await page.goto('/products/test-standard-tea')

  await expect(page.getByRole('link', { name: 'Account' })).toHaveAttribute(
    'href',
    '/account',
  )
  await expect(
    page.getByRole('contentinfo').getByRole('link', { name: 'Login' }),
  ).toHaveAttribute('href', '/account')

  await page.goto('/account/register?returnTo=%2Fcart')
  await expect(
    page.getByText('Shopify-hosted Customer Account sign-in'),
  ).toBeVisible()
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: 'Create account with Shopify' }),
  ).toHaveAttribute('href', '/account/login/start?returnTo=%2Fcart')

  await page.goto('/account/classic/bookmark?redirect=https%3A%2F%2Fevil.test')
  await expect(page.getByText('This classic account link')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Sign in with Shopify' }),
  ).toHaveAttribute('href', '/account/login/start?returnTo=%2Faccount')
})
