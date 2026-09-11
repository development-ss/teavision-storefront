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
  await page.goto(
    `${browserOrigin}/api/shopify-preview?secret=${PREVIEW_SECRET}&productId=123`,
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

  await page.getByRole('link', { name: 'Exit preview' }).click()
  await expect(page).toHaveURL(/\/$/)
})
