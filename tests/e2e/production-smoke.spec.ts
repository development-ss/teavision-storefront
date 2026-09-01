import { expect, test, type Page, type Response } from '@playwright/test'

import { blockThirdPartyRequests } from '../mocks/third-party-network'

const forbiddenLiveFlowPattern =
  /myshopify\.com\/checkouts|checkout\.shopify\.com|customer-account\.shopify\.com|shopify\.com\/.*oauth/i

test.beforeEach(async ({ page }) => {
  await blockThirdPartyRequests(page)
})

function observeForbiddenLiveFlowUrls(page: Page) {
  const observedUrls: string[] = []

  page.on('response', (response) => {
    observedUrls.push(response.url())
  })
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      observedUrls.push(frame.url())
    }
  })

  return () => {
    expect(
      observedUrls.filter((url) => forbiddenLiveFlowPattern.test(url)),
    ).toEqual([])
    expect(forbiddenLiveFlowPattern.test(page.url())).toBe(false)
  }
}

async function gotoWithoutServerError(
  page: Page,
  path: string,
): Promise<Response> {
  const response = await page.goto(path)

  expect(response, `Expected a navigation response for ${path}`).not.toBeNull()
  expect(
    response?.status(),
    `${path} returned ${response?.status() ?? 'no'} status`,
  ).toBeLessThan(500)

  return response as Response
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(
    widths.scrollWidth,
    `Expected page width ${widths.scrollWidth}px to fit viewport ${widths.clientWidth}px`,
  ).toBeLessThanOrEqual(widths.clientWidth)
}

test('home loads with Teavision navigation', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/')

  await expect(
    page.getByRole('link', { name: /Teavision/i }).first(),
  ).toBeVisible()
  assertNoLiveFlow()
})

test('home exposes a single keyboard-accessible skip link target', async ({
  page,
}) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/')

  const skipLink = page.getByRole('link', { name: 'Skip to main content' })

  await expect(skipLink).toHaveCount(1)
  await expect(page.locator('main#main-content')).toHaveCount(1)

  await page.keyboard.press('Tab')
  await expect(skipLink).toBeFocused()
  await expect(skipLink).toBeVisible()
  assertNoLiveFlow()
})

test('/collections/all loads without a 500 response', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/collections/all')

  await expect(
    page.getByRole('heading', { name: /All products/i }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Test Standard Tea/i }).first(),
  ).toBeVisible()
  assertNoLiveFlow()
})

test('collection banner is the only prioritized listing image', async ({
  page,
}) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/collections/test-banner')

  const banner = page.locator('img.w-full.object-cover').first()
  await expect(banner).toHaveAttribute('loading', 'eager')
  await expect(banner).toHaveAttribute('fetchpriority', 'high')
  await expect(
    page.locator('link[rel="preload"][as="image"][fetchpriority="high"]'),
  ).toHaveCount(1)
  await expect(
    page.locator('#product-grid img[fetchpriority="high"]'),
  ).toHaveCount(0)
  assertNoLiveFlow()
})

test('collection grid is crawlable in the served HTML before any streamed chunk', async ({
  request,
}) => {
  const response = await request.get('/collections/all')
  expect(response.status()).toBe(200)
  const html = await response.text()

  const productLinkIndex = html.indexOf('href="/products/')
  const firstStreamedChunkIndex = html.indexOf('<div hidden id="S:')

  expect(productLinkIndex).toBeGreaterThan(-1)
  if (firstStreamedChunkIndex !== -1) {
    expect(productLinkIndex).toBeLessThan(firstStreamedChunkIndex)
  }

  // The fallback and resolved copies preload the same LCP image — React must
  // dedupe them to a single tag.
  const preloads =
    html.match(/<link(?=[^>]*rel="preload")(?=[^>]*as="image")[^>]*>/g) ?? []
  expect(preloads).toHaveLength(1)
})

test('blog listing serves complete HTML with no pending stream boundaries', async ({
  request,
}) => {
  const response = await request.get('/blog')
  expect(response.status()).toBe(200)
  const html = await response.text()

  // A pending boundary here would reproduce the pre-render flash the SEO
  // team screenshotted — the listing must be fully server-rendered.
  expect(html).not.toContain('<!--$?-->')
  expect(html).toContain('href="/blogs/teavision-blogs/')
})

test('/products/test-standard-tea loads with Add to Cart', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/products/test-standard-tea')

  await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeVisible()
  assertNoLiveFlow()
})

test('/cart loads the cart shell or empty-cart state', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/cart')

  await expect(
    page.getByRole('heading', { name: 'Your Cart', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Your cart is empty')).toBeVisible()
  assertNoLiveFlow()
})

test('/search?q=tea loads search UI state', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/search?q=tea')

  await expect(
    page.getByRole('heading', { name: 'Results for "tea"' }),
  ).toBeVisible()
  await expect(
    page.getByText('2 results', { exact: true }).first(),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Quick View' }).first(),
  ).toBeVisible()
  assertNoLiveFlow()
})

test('search fallback supports filters, clearing, and sort changes', async ({
  page,
}) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/search?q=tea')
  const desktopFilters = page.locator('aside')

  await desktopFilters.getByRole('link', { name: /^Organic\s+1$/ }).click()
  await expect(page).toHaveURL(/filter=tag(?:%3A|:)Organic/)
  await expect(
    page.getByText('1 result', { exact: true }).first(),
  ).toBeVisible()
  await expect(
    desktopFilters.getByRole('link', { name: /^Organic\s+1$/ }),
  ).toHaveAttribute('aria-current', 'page')

  await desktopFilters.getByRole('link', { name: 'Clear' }).click()
  await expect(page).toHaveURL(/\/search\?q=tea$/)
  await expect(
    page.getByText('2 results', { exact: true }).first(),
  ).toBeVisible()

  await page.getByLabel('Sort').selectOption('title-desc')
  await expect(page).toHaveURL(/sort=title-desc/)
  await expect(
    page.getByRole('heading', { name: 'Results for "tea"' }),
  ).toBeVisible()
  assertNoLiveFlow()
})

test('search fallback preserves result pages', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/search?q=many')
  await expect(
    page.getByText('25 results', { exact: true }).first(),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Page 1' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  await page.getByRole('link', { name: 'Page 2' }).click()
  await expect(page).toHaveURL(/\/search\?q=many&page=2/)
  await expect(
    page.getByText('Many Test Tea 25', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Page 2' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  assertNoLiveFlow()
})

test('legacy Search Results links redirect to the canonical search route', async ({
  request,
}) => {
  const redirects = [
    {
      path: '/pages/search-results?query=tea&page=2',
      query: 'query=tea',
      state: 'page=2',
    },
    {
      path: '/pages/search-results-page?q=tea&sort=title-desc',
      query: 'q=tea',
      state: 'sort=title-desc',
    },
  ]

  for (const { path, query, state } of redirects) {
    const response = await request.get(path, { maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(response.headers().location).toMatch(/^\/search\?/)
    expect(response.headers().location).toContain(query)
    expect(response.headers().location).toContain(state)
  }
})

test('service CTAs are actionable', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/pages/private-label-packing')
  await expect(
    page.getByRole('link', { name: 'Private Label Now' }),
  ).toHaveAttribute('href', '/pages/contact')
  await expect(
    page.getByRole('link', { name: 'Start Private Label' }),
  ).toHaveAttribute('href', '/pages/contact')

  await gotoWithoutServerError(page, '/pages/certifications')
  await expect(
    page.getByRole('link', { name: 'Request Certifications' }),
  ).toHaveAttribute('href', '/pages/contact')

  assertNoLiveFlow()
})

test('custom blend flavour choices carry into the contact brief', async ({
  page,
}) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/pages/custom-tea-blends')
  await page.getByRole('checkbox', { name: 'Peach' }).check()
  await page.getByRole('link', { name: 'Continue to Brief' }).click()

  await expect(page).toHaveURL(/\/pages\/contact\?flavours=Peach#need-help/)
  await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue(
    'Custom blend flavour direction: Peach\n\n',
  )
  assertNoLiveFlow()
})

test('/account loads the local login bridge without live OAuth', async ({
  page,
}) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  await gotoWithoutServerError(page, '/account')

  await expect(
    page.getByRole('link', { name: 'Sign in with Shopify' }),
  ).toHaveAttribute('href', '/account/login/start?returnTo=%2Faccount')
  assertNoLiveFlow()
})

test('/pages/privacy-policy loads without 404', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  const response = await gotoWithoutServerError(page, '/pages/privacy-policy')

  expect(response.status()).not.toBe(404)
  await expect(
    page.getByRole('heading', { name: 'Privacy Policy', exact: true }),
  ).toBeVisible()
  assertNoLiveFlow()
})

test('/blog is the canonical Tea Journal listing', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  const response = await gotoWithoutServerError(page, '/blog')

  expect(response.status()).toBe(200)
  await expect(
    page.getByRole('heading', {
      name: 'Discover the Finest Teas for Your Business',
    }),
  ).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.teavision.com.au/blog',
  )
  assertNoLiveFlow()
})

test('legacy Tea Journal listings permanently redirect to /blog', async ({
  request,
}) => {
  for (const path of [
    '/blogs/teavision-blogs?source=legacy',
    '/blogs/journal?source=legacy',
  ]) {
    const response = await request.get(path, { maxRedirects: 0 })

    expect(response.status()).toBe(308)
    expect(response.headers().location).toBe('/blog?source=legacy')
  }
})

test('mobile launch routes do not create horizontal overflow', async ({
  page,
}) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)
  const longSearchQuery =
    'Organic ceremonial-grade green tea with a very long wholesale product title'

  await page.setViewportSize({ width: 375, height: 812 })

  await gotoWithoutServerError(page, '/cart')
  await expectNoHorizontalOverflow(page)

  await gotoWithoutServerError(
    page,
    `/search?q=${encodeURIComponent(longSearchQuery)}`,
  )
  await expectNoHorizontalOverflow(page)
  assertNoLiveFlow()
})

test('/api/health returns public service status', async ({ page }) => {
  const assertNoLiveFlow = observeForbiddenLiveFlowUrls(page)

  const response = await gotoWithoutServerError(page, '/api/health')
  const payload: unknown = await response.json()

  expect(response.status()).toBe(200)
  expect(payload).toMatchObject({
    service: 'teavision-storefront',
    status: 'ok',
  })
  assertNoLiveFlow()
})

test('serves the Teavision favicon icon', async ({ request }) => {
  const response = await request.get('/icon.svg')

  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('image/svg+xml')
  const icon = await response.text()
  expect(icon).toContain('Teavision')
  expect(icon).not.toContain('Vercel')
})
