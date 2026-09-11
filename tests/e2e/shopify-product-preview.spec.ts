import { createHmac } from 'node:crypto'

import { test, expect } from '@playwright/test'

const PREVIEW_SECRET = 'test-preview-secret-with-at-least-32-characters'

test('previews a Shopify product without enabling purchase actions', async ({
  page,
  baseURL,
}) => {
  const browserOrigin = (baseURL ?? 'http://localhost:4173').replace(
    '127.0.0.1',
    'localhost',
  )
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = createHmac('sha256', PREVIEW_SECRET)
    .update(`shopify-theme-preview:v1:123:${timestamp}`)
    .digest('hex')
  await page.goto(
    `${browserOrigin}/api/shopify-preview?productId=123&timestamp=${timestamp}&signature=${signature}`,
  )

  await expect(page).toHaveURL(/\/preview\/products\/123$/)
  await expect(
    page.locator('[aria-label="Product preview status"]'),
  ).toContainText('Previewing the draft product version')
  await expect(
    page.getByRole('heading', { name: 'Test Standard Tea' }),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Preview only' }),
  ).toBeDisabled()
  await expect(
    page.getByText('Purchasing is disabled in preview.'),
  ).toBeVisible()
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    0,
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex.*nofollow/,
  )
  expect(
    (await page.context().cookies()).some(
      (cookie) => cookie.name === 'teavision_cart',
    ),
  ).toBe(false)

  await page.goto(`${browserOrigin}/preview/products/456`)
  await expect(
    page.getByRole('heading', { name: 'This page has gone cold' }),
  ).toBeVisible()
  await page.goto(`${browserOrigin}/preview/products/123`)
  await expect(
    page.getByRole('heading', { name: 'Test Standard Tea' }),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Exit preview' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto(`${browserOrigin}/preview/products/123`)
  await expect(
    page.getByRole('heading', { name: 'This page has gone cold' }),
  ).toBeVisible()
})
