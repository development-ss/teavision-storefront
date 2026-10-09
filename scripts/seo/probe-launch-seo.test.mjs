import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import assert from 'node:assert/strict'

const SCRIPT_PATH = 'scripts/seo/probe-launch-seo.mjs'
const REGISTER_PATH = 'docs/launch/seo-url-parity-register.md'

function runProbe(args, env = {}) {
  return spawnSync(process.execPath, [SCRIPT_PATH, ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  })
}

async function probeProductHtml({
  html,
  path = '/products/known-tea',
  source = 'cli',
  status = 200,
}) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () =>
    new Response(html, {
      headers: { 'content-type': 'text/html' },
      status,
    })

  try {
    const { probeProductStructuredData } =
      await import('./probe-launch-seo.mjs')

    return probeProductStructuredData(
      new URL('http://example.test'),
      path,
      source,
    )
  } finally {
    globalThis.fetch = originalFetch
  }
}

test('url-audit mode validates the URL parity register with warnings only for optional owner exports', () => {
  const result = runProbe(['--mode', 'url-audit'], {
    SEO_URL_MIGRATION_EXPORT: '',
  })

  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Two-source confirmation/)
  assert.match(result.stdout, /app-owned register rows/)
  assert.match(result.stdout, /Blog Listing URL audit item/)
  assert.match(result.stdout, /app-owned redirect; Implemented 2026-07-13/)
  assert.match(result.stdout, /WARN/)
  assert.match(result.stdout, /missing optional owner export/)
  assert.doesNotMatch(result.stdout, /FAIL/)
})

test('url-audit mode fails when a coded redirect lacks a register row', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seo-url-audit-'))
  const registerPath = join(directory, 'seo-url-parity-register.md')
  const register = readFileSync(REGISTER_PATH, 'utf8').replace(
    /^\| `\/collections\/:handle\/products\/:productHandle` .*\r?\n/m,
    '',
  )

  writeFileSync(registerPath, register)

  try {
    const result = runProbe(['--mode', 'url-audit'], {
      SEO_URL_PARITY_REGISTER_PATH: registerPath,
      SEO_URL_MIGRATION_EXPORT: '',
    })

    assert.equal(result.status, 1)
    assert.match(result.stdout, /coded redirect register row/)
    assert.match(result.stdout, /missing register row/)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

test('live SEO modes include Phase 18 language, robots, and tag sitemap checks', () => {
  const source = readFileSync(SCRIPT_PATH, 'utf8')

  for (const path of [
    '/api/',
    '/account',
    '/account/',
    '/account/login',
    '/account/callback',
    '/account/logout',
  ]) {
    assert.match(source, new RegExp(`'${path.replaceAll('/', '\\/')}'`))
  }

  assert.match(source, /root html language/)
  assert.match(source, /enabled robots account disallows/)
  assert.match(source, /disabled robots account disallows/)
  assert.match(source, /enabled sitemap tagged blog exclusion/)
})

test('structured data helpers parse Product schema inside arrays and graph objects', async () => {
  const {
    extractJsonLd,
    findSchemaNodes,
    hasProductAggregateRating,
    hasProductJsonLd,
    hasVisibleProductReviewSummary,
  } = await import('./probe-launch-seo.mjs')
  const html = `
    <script type="application/ld+json">
      [
        {
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "BreadcrumbList" },
            {
              "@type": "Product",
              "name": "Reviewed Tea",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": 4.7,
                "reviewCount": 12
              }
            }
          ]
        }
      ]
    </script>
    <div>4.7 · 12 reviews</div>
  `
  const values = extractJsonLd(html)

  assert.equal(hasProductJsonLd(values), true)
  assert.equal(hasProductAggregateRating(values), true)
  assert.equal(hasVisibleProductReviewSummary(html), true)
  assert.equal(findSchemaNodes(values, 'Product')[0].name, 'Reviewed Tea')
})

test('Product structured data probe passes when Product JSON-LD exists', async () => {
  const results = await probeProductHtml({
    html: `
      <h1>Known Tea</h1>
      <script type="application/ld+json">
        { "@context": "https://schema.org", "@type": "Product", "name": "Known Tea" }
      </script>
    `,
  })

  assert.equal(results[0].status, 'PASS')
  assert.equal(results[0].detail, 'Product JSON-LD parsed')
})

test('Product structured data probe fails when an existing product lacks Product JSON-LD', async () => {
  const results = await probeProductHtml({
    html: '<main><h1>Known Tea</h1><button>Add to Cart</button></main>',
  })

  assert.equal(results[0].status, 'FAIL')
  assert.equal(results[0].detail, 'Product JSON-LD not found')
})

test('Product structured data probe warns when the default fixture product is missing', async () => {
  const results = await probeProductHtml({
    html: '<main><h1>Product not found</h1></main>',
    path: '/products/test-standard-tea',
    source: 'default',
    status: 404,
  })

  assert.equal(results[0].status, 'WARN')
  assert.match(results[0].detail, /--product-path\/SEO_PROBE_PRODUCT_PATH/)
})

test('Product structured data probe fails when an explicit product path is missing', async () => {
  const results = await probeProductHtml({
    html: '<main><h1>Product not found</h1></main>',
    path: '/products/missing-tea',
    source: 'cli',
    status: 404,
  })

  assert.equal(results[0].status, 'FAIL')
  assert.match(
    results[0].detail,
    /product route not found for selected data source/,
  )
})

test('enabled mode defaults to a representative product path for Product JSON-LD checks', async () => {
  const { DEFAULT_PRODUCT_PATH, parseArgs } =
    await import('./probe-launch-seo.mjs')

  assert.equal(
    parseArgs(['--mode', 'enabled']).productPath,
    DEFAULT_PRODUCT_PATH,
  )
  assert.equal(DEFAULT_PRODUCT_PATH, '/products/test-standard-tea')
})

test('structured data route expectations cover audit-required supported schema types', async () => {
  const { STRUCTURED_DATA_ROUTE_EXPECTATIONS } =
    await import('./probe-launch-seo.mjs')
  const requiredTypes = new Set(
    STRUCTURED_DATA_ROUTE_EXPECTATIONS.flatMap(
      (expectation) => expectation.requiredSchemaTypes,
    ),
  )

  assert.equal(requiredTypes.has('Service'), true)
  assert.equal(requiredTypes.has('LocalBusiness'), true)
  assert.equal(requiredTypes.has('FAQPage'), true)
  assert.equal(requiredTypes.has('Review'), false)
  assert.equal(requiredTypes.has('AggregateRating'), false)
})

test('structured data helpers accept a ProductGroup for multi-size products', async () => {
  const { extractJsonLd, hasProductAggregateRating, hasProductJsonLd } =
    await import('./probe-launch-seo.mjs')
  const html = `
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "ProductGroup",
        "name": "Cat's Claw Cut",
        "hasVariant": [{ "@type": "Product", "sku": "CON-CAT-CLAW-50G" }],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 5,
          "reviewCount": 3
        }
      }
    </script>
  `
  const values = extractJsonLd(html)

  assert.equal(hasProductJsonLd(values), true)
  assert.equal(hasProductAggregateRating(values), true)
})
