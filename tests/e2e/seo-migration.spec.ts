import { expect, test, type APIRequestContext } from '@playwright/test'

import { LEGACY_CATALOG_REDIRECTS } from '../../src/lib/seo/legacy-redirects'

// Regression coverage for the post-migration SEO review (received 28 September
// 2026). Every check reads the raw server response, the way a crawler that
// does not run JavaScript sees the page.

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

const GSC_TOKENS = [
  'zuc6JgNhxfEuNOkQesHoVQ94s48QvRnQ6AQlv43E2Hw',
  'QT0PK9njH7ghSELI7aFl3uVvzdYA07K4wRHNtnUOSYo',
]

type JsonLdNode = Record<string, unknown> & { '@type'?: string }

async function getRawHtml(request: APIRequestContext, path: string) {
  const response = await request.get(path, {
    headers: { 'user-agent': BROWSER_USER_AGENT },
  })

  expect(response.status(), `${path} status`).toBe(200)

  const html = await response.text()
  const headEnd = html.indexOf('</head>')

  expect(headEnd, `${path} has a closing head tag`).toBeGreaterThan(0)

  return { head: html.slice(0, headEnd), body: html.slice(headEnd), html }
}

function pageTitles(markup: string) {
  // SVG icons carry their own <title>; only count document titles.
  const withoutSvg = markup.replace(/<svg\b[^]*?<\/svg>/g, '')

  return [...withoutSvg.matchAll(/<title(?:\s[^>]*)?>([^<]*)<\/title>/g)].map(
    (match) => match[1].trim(),
  )
}

function metaContent(markup: string, name: string) {
  return [
    ...markup.matchAll(
      new RegExp(`<meta name="${name}" content="([^"]*)"`, 'g'),
    ),
  ].map((match) => match[1])
}

function canonicalLinks(markup: string) {
  return [...markup.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(
    (match) => match[1],
  )
}

function jsonLdNodes(html: string): JsonLdNode[] {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json"[^>]*>([^]*?)<\/script>/g,
    ),
  ].flatMap((match) => {
    const parsed = JSON.parse(match[1]) as JsonLdNode & {
      '@graph'?: JsonLdNode[]
    }
    return parsed['@graph'] ?? [parsed]
  })
}

test.describe('collection metadata is in the initial HTML head', () => {
  for (const path of [
    '/collections/all',
    '/collections/test-rich',
    '/collections/wholesale-pagination?page=2',
  ]) {
    test(`${path} sends title, description and canonical up front`, async ({
      request,
    }) => {
      const { head, body } = await getRawHtml(request, path)
      const collectionPath = path.split('?')[0]

      expect(pageTitles(head)).toHaveLength(1)
      expect(pageTitles(head)[0]).not.toBe('')
      expect(metaContent(head, 'description')).toHaveLength(1)
      expect(metaContent(head, 'description')[0].length).toBeGreaterThan(40)
      expect(canonicalLinks(head)).toHaveLength(1)
      expect(new URL(canonicalLinks(head)[0]).pathname).toBe(collectionPath)

      // Nothing is streamed in late, so nothing can conflict with the head.
      expect(metaContent(body, 'description')).toEqual([])
      expect(canonicalLinks(body)).toEqual([])
    })
  }

  test('a sorted collection keeps its noindex and base canonical in the head', async ({
    request,
  }) => {
    const { head } = await getRawHtml(
      request,
      '/collections/all?sort=price-asc',
    )

    expect(new URL(canonicalLinks(head)[0]).pathname).toBe('/collections/all')
    expect(new URL(canonicalLinks(head)[0]).search).toBe('')
    expect(metaContent(head, 'robots').join(' ')).toContain('noindex')
  })
})

test.describe('out-of-range collection pages', () => {
  for (const { path, canonical } of [
    { path: '/collections/all?page=2', canonical: '/collections/all' },
    {
      path: '/collections/wholesale-pagination?page=9',
      canonical: '/collections/wholesale-pagination?page=2',
    },
  ]) {
    test(`${path} canonicalizes to the last real page`, async ({ request }) => {
      const { head } = await getRawHtml(request, path)
      const url = new URL(canonicalLinks(head)[0])

      expect(canonicalLinks(head)).toHaveLength(1)
      expect(`${url.pathname}${url.search}`).toBe(canonical)
    })
  }
})

test.describe('missing collections', () => {
  for (const path of [
    '/collections/missing-collection',
    '/collections/wholesale-pagination/categories_missing-category',
  ]) {
    test(`${path} answers with a real 404`, async ({ request }) => {
      const response = await request.get(path)

      expect(response.status()).toBe(404)
      expect(await response.text()).toContain('This page has gone cold')
    })
  }

  test('a real category page still answers 200', async ({ request }) => {
    const response = await request.get(
      '/collections/wholesale-pagination/categories_organic-tea',
    )

    expect(response.status()).toBe(200)
  })
})

test.describe('post-migration redirects', () => {
  async function expectRedirect(
    request: APIRequestContext,
    source: string,
    destination: string,
    status: number,
  ) {
    const response = await request.get(source, { maxRedirects: 0 })
    const location = response.headers()['location'] ?? ''

    expect(response.status(), `${source} status`).toBe(status)
    expect(new URL(location, 'http://localhost').pathname).toBe(destination)
  }

  test('/blogs is a single 301 to /blog', async ({ request }) => {
    await expectRedirect(request, '/blogs', '/blog', 301)
  })

  test('the existing /blogs/teavision-blogs redirect is unchanged', async ({
    request,
  }) => {
    await expectRedirect(request, '/blogs/teavision-blogs', '/blog', 308)
  })

  for (const { source, destination } of LEGACY_CATALOG_REDIRECTS) {
    test(`${source} is a single 301 to ${destination}`, async ({ request }) => {
      await expectRedirect(request, source, destination, 301)
    })
  }
})

test.describe('migrated tracking and schema codes', () => {
  for (const path of ['/', '/collections/all', '/products/test-standard-tea']) {
    test(`${path} carries both Search Console verification tags`, async ({
      request,
    }) => {
      const { head } = await getRawHtml(request, path)

      expect(metaContent(head, 'google-site-verification').sort()).toEqual(
        [...GSC_TOKENS].sort(),
      )
    })
  }

  test('every storefront page carries the full Organization schema', async ({
    request,
  }) => {
    for (const path of ['/', '/collections/all', '/pages/services']) {
      const { html } = await getRawHtml(request, path)
      const organizations = jsonLdNodes(html).filter(
        (node) =>
          node['@type'] === 'Organization' &&
          node['@id'] === 'https://www.teavision.com.au/#organization' &&
          'sameAs' in node,
      )

      expect(organizations, `${path} Organization`).toHaveLength(1)
      expect(organizations[0]).toMatchObject({
        foundingDate: '2014',
        contactPoint: { email: 'info@teavision.com.au' },
      })
    }
  })

  test('the homepage has WebSite and FAQPage schema', async ({ request }) => {
    const types = jsonLdNodes((await getRawHtml(request, '/')).html).map(
      (node) => node['@type'],
    )

    expect(types).toEqual(expect.arrayContaining(['WebSite', 'FAQPage']))
  })

  test('product pages have Product schema with brand and offer', async ({
    request,
  }) => {
    const { html } = await getRawHtml(request, '/products/test-standard-tea')
    const product = jsonLdNodes(html).find(
      (node) => node['@type'] === 'Product' || node['@type'] === 'ProductGroup',
    )

    expect(product).toMatchObject({
      name: 'Test Standard Tea',
      brand: { '@type': 'Brand', name: 'Teavision' },
    })

    const offers =
      product?.['@type'] === 'ProductGroup'
        ? (product.hasVariant as JsonLdNode[]).map((variant) => variant.offers)
        : [product?.offers]

    expect(offers.length).toBeGreaterThan(0)
    for (const offer of offers) {
      expect(offer).toMatchObject({
        '@type': 'Offer',
        itemCondition: 'https://schema.org/NewCondition',
      })
    }
  })

  test('the services page lists its services with Service schema', async ({
    request,
  }) => {
    const nodes = jsonLdNodes(
      (await getRawHtml(request, '/pages/services')).html,
    )
    const list = nodes.find((node) => node['@type'] === 'ItemList') as
      | { itemListElement: Array<{ item: JsonLdNode }> }
      | undefined

    expect(list?.itemListElement.map((entry) => entry.item['@type'])).toEqual([
      'Service',
      'Service',
      'Service',
      'Service',
    ])
  })
})
