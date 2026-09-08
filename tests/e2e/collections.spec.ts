import { expect, test } from '@playwright/test'

for (const path of [
  '/collections/missing-collection',
  '/collections/wholesale-pagination/categories_missing-category',
]) {
  test(`${path} resolves to the not-found page`, async ({ page }) => {
    await page.goto(path)
    await expect(
      page.getByRole('heading', { level: 1, name: 'This page has gone cold' }),
    ).toBeVisible()
    await expect(page.getByTestId('collection-hero')).toHaveCount(0)
    await expect(
      page.getByText('Loading collection', { exact: true }),
    ).toHaveCount(0)
  })
}

for (const handle of [
  'all',
  'test-banner',
  'test-rich',
  'test-poster',
  'test-masters',
  'test-empty',
  'test-explicit',
]) {
  test(`${handle} has one visible semantic hero and complete metadata`, async ({
    page,
  }) => {
    const response = await page.goto(`/collections/${handle}`)
    expect(response?.status()).toBe(200)
    const hero = page.getByTestId('collection-hero')
    await expect(hero).toHaveCount(1)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(hero.locator('h1')).toBeVisible()
    await expect(page.locator('nav h1')).toHaveCount(0)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /\S/,
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/collections/${handle}$`),
    )
    if (handle === 'test-poster') {
      await expect(hero.locator('img')).toHaveAttribute(
        'src',
        /wholesale-tea-hero/,
      )
      await expect(page.locator('img[src*="wholesale_tea.png"]')).toHaveCount(0)
    }
    if (handle === 'test-masters') {
      await expect(hero.locator('img')).toHaveAttribute(
        'src',
        /tea-masters-hero/,
      )
      await expect(hero.locator('img')).toHaveAttribute(
        'alt',
        /Black cast-iron teapot/,
      )
    }
    if (handle === 'test-explicit') {
      await expect(hero.locator('h1')).toHaveText('Custom Collection Heading')
      await expect(hero).toContainText('An explicit hero introduction.')
    }
    if (handle === 'test-empty')
      await expect(hero.locator('img')).toHaveCount(0)
  })
}

test('tea-bag actions wrap on narrow screens and retain the story', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/collections/test-rich')
  const hero = page.getByTestId('collection-hero')
  for (const name of [
    'View our Tea Bag Manufacturing Catalogue',
    'Speak to Our Team About Custom Tea Bags',
    'Create Your Own White Label Tea Bag',
  ]) {
    const action = hero.getByRole('link', { name })
    await expect(action).toBeVisible()
    const bounds = await action.boundingBox()
    expect(bounds?.x).toBeGreaterThanOrEqual(0)
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320)
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320)
  await page.getByText('Read more about Bulk Tea Bags', { exact: true }).click()
  await expect(
    page.getByRole('heading', { level: 2, name: 'How we manufacture' }),
  ).toBeVisible()
  await expect(page.getByText('Retained ordering story.')).toBeVisible()
})

test('pagination is self-canonical and category pages retain their H1', async ({
  page,
}) => {
  await page.goto('/collections/wholesale-pagination?page=2')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/collections\/wholesale-pagination\?page=2$/,
  )
  // React may briefly retain both the hidden streamed tree and its fallback.
  await expect(page.locator('#product-grid')).toHaveCount(1)
  await expect(page.locator('#product-grid')).toContainText('Pagination Tea 25')
  const list = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  expect(list.join('')).toContain('"position":25')
  await page.goto('/collections/wholesale-pagination/categories_organic-tea')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByTestId('collection-hero')).toContainText('Organic Tea')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/collections\/wholesale-pagination$/,
  )
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
})

test('filtered pages and test URLs remain noindex, and the spelling redirect resolves', async ({
  page,
  request,
}) => {
  await page.goto('/collections/wholesale-pagination?q=25&page=2')
  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/collections\/wholesale-pagination$/,
  )
  await page.goto('/collections/test-empty')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
  const redirect = await request.get('/collections/scullcap', {
    maxRedirects: 0,
  })
  expect(redirect.status()).toBe(308)
  expect(redirect.headers().location).toBe('/collections/skullcap')
})
