import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_COLLECTION_ROUTE,
  DEFAULT_PRODUCT_ROUTE,
  evaluateRouteHtml,
  findSchemaNodes,
  parseArgs,
  runProbe,
} from './probe-crawlable-html.mjs'

const collectionHtml = `
<!doctype html>
<html lang="en-AU">
  <head>
    <title>All products</title>
    <meta name="description" content="All products from Teavision.">
    <link rel="canonical" href="https://www.teavision.com.au/collections/all">
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "CollectionPage", "name": "All products" },
          { "@type": "ItemList", "name": "All products products" }
        ]
      }
    </script>
  </head>
  <body>
    <h1>All products</h1>
    <ul id="product-grid">
      <li><a href="/products/test-standard-tea">Test Standard Tea</a></li>
    </ul>
  </body>
</html>`

const productHtml = `
<!doctype html>
<html lang="en-AU">
  <head>
    <link rel="canonical" href="https://www.teavision.com.au/products/test-standard-tea">
    <script type="application/ld+json">
      { "@context": "https://schema.org", "@type": "Product", "name": "Test Standard Tea" }
    </script>
  </head>
  <body>
    <h1>Test Standard Tea</h1>
    <button>Add to Cart</button>
  </body>
</html>`

test('default arguments target representative collection and PDP routes', () => {
  const args = parseArgs([])

  assert.equal(args.collectionRoute, DEFAULT_COLLECTION_ROUTE)
  assert.equal(args.productRoute, DEFAULT_PRODUCT_ROUTE)
  assert.equal(args.startServer, false)
})

test('collection HTML passes with one H1, product grid content, canonical, and JSON-LD', () => {
  const rows = evaluateRouteHtml({
    expectedTitle: 'All products',
    html: collectionHtml,
    kind: 'collection',
    route: '/collections/all',
  })

  assert.equal(
    rows.every((row) => row.status === 'PASS'),
    true,
  )
})

test('collection HTML fails when SEO metadata appears after the head', () => {
  const lateMetadataHtml = collectionHtml
    .replace('    <title>All products</title>\n', '')
    .replace(
      '    <meta name="description" content="All products from Teavision.">\n',
      '',
    )
    .replace(
      '    <link rel="canonical" href="https://www.teavision.com.au/collections/all">\n',
      '',
    )
    .replace(
      '  </head>\n  <body>',
      '  </head>\n  <body>\n    <title>All products</title>\n    <meta name="description" content="All products from Teavision.">\n    <link rel="canonical" href="https://www.teavision.com.au/collections/all">',
    )
  const rows = evaluateRouteHtml({
    expectedTitle: 'All products',
    html: lateMetadataHtml,
    kind: 'collection',
    route: '/collections/all',
  })

  assert.equal(
    rows.find((row) => row.check === 'canonical link')?.status,
    'PASS',
  )
  assert.deepEqual(
    ['page title in head', 'meta description in head', 'canonical in head'].map(
      (name) => rows.find((row) => row.check === name)?.status,
    ),
    ['FAIL', 'FAIL', 'FAIL'],
  )
})

test('PDP HTML passes with one H1, product title, buy marker, canonical, and Product JSON-LD', () => {
  const rows = evaluateRouteHtml({
    expectedTitle: 'Test Standard Tea',
    html: productHtml,
    kind: 'product',
    route: '/products/test-standard-tea',
  })

  assert.equal(
    rows.every((row) => row.status === 'PASS'),
    true,
  )
})

test('skeleton-only collection HTML fails crawl-critical content checks', () => {
  const rows = evaluateRouteHtml({
    expectedTitle: 'All products',
    html: `
      <html>
        <head><link rel="canonical" href="/collections/all"></head>
        <body>
          <div role="status" aria-live="polite">
            <span>Loading collection</span>
          </div>
        </body>
      </html>
    `,
    kind: 'collection',
    route: '/collections/all',
  })
  const skeletonRow = rows.find((row) => row.check === 'skeleton-only shell')
  const contentRow = rows.find(
    (row) => row.check === 'collection product content',
  )

  assert.equal(skeletonRow?.status, 'FAIL')
  assert.equal(contentRow?.status, 'FAIL')
})

test('streamed collection HTML fails when skeleton arrives before crawl-critical content', async () => {
  const originalFetch = globalThis.fetch
  const encoder = new TextEncoder()
  globalThis.fetch = async () =>
    new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`
              <!doctype html>
              <html lang="en-AU">
                <head>
                  <link rel="canonical" href="https://www.teavision.com.au/collections/wholesale-bulk-tea">
                </head>
                <body>
                  <div role="status" aria-live="polite">
                    <span>Loading collection</span>
                  </div>
            `),
          )
          controller.enqueue(
            encoder.encode(`
                  <h1>Wholesale Tea</h1>
                  <ul id="product-grid">
                    <li><a href="/products/organic-masala-chai">Organic Masala Chai</a></li>
                  </ul>
                  <script type="application/ld+json">
                    { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Wholesale Tea" }
                  </script>
                </body>
              </html>
            `),
          )
          controller.close()
        },
      }),
      { status: 200 },
    )

  try {
    const rows = await runProbe({
      baseUrl: 'https://teavision-storefront.vercel.app',
      collectionRoute: '/collections/wholesale-bulk-tea',
      collectionTitle: 'Wholesale Tea',
      productRoute: '/products/organic-masala-chai',
      productTitle: 'Organic Masala Chai',
    })
    const streamRow = rows.find(
      (row) =>
        row.route === '/collections/wholesale-bulk-tea' &&
        row.check === 'content before skeleton',
    )

    assert.equal(streamRow?.status, 'FAIL')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('streamed PDP HTML fails when skeleton arrives before crawl-critical content', () => {
  const chunks = [
    `
      <!doctype html>
      <html lang="en-AU">
        <head>
          <link rel="canonical" href="https://www.teavision.com.au/products/organic-masala-chai">
        </head>
        <body>
          <div role="status" aria-live="polite">
            <span>Loading product</span>
          </div>
    `,
    `
          <h1>Organic Spicy Masala Chai</h1>
          <button>Add to Cart</button>
          <script type="application/ld+json">
            { "@context": "https://schema.org", "@type": "Product", "name": "Organic Spicy Masala Chai" }
          </script>
        </body>
      </html>
    `,
  ]
  const rows = evaluateRouteHtml({
    chunks,
    expectedTitle: 'Organic Spicy Masala Chai',
    html: chunks.join(''),
    kind: 'product',
    route: '/products/organic-masala-chai',
  })
  const streamRow = rows.find((row) => row.check === 'content before skeleton')

  assert.equal(streamRow?.status, 'FAIL')
})

test('JSON-LD traversal finds schema nodes inside @graph objects', () => {
  const nodes = findSchemaNodes(
    [
      {
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'BreadcrumbList' },
          { '@type': 'Product', name: 'Test Standard Tea' },
        ],
      },
    ],
    'Product',
  )

  assert.equal(nodes.length, 1)
  assert.equal(nodes[0].name, 'Test Standard Tea')
})
