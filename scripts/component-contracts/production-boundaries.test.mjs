import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)

function sourcePath(...segments) {
  return path.join(repoRoot, ...segments)
}

test('Shopify webhooks invalidate page cache tags', async () => {
  const source = await readFile(
    sourcePath('src', 'app', 'api', 'webhooks', 'shopify', 'route.ts'),
    'utf8',
  )

  assert.match(source, /case 'pages\/create'/)
  assert.match(source, /case 'pages\/update'/)
  assert.match(source, /case 'pages\/delete'/)
  assert.match(source, /revalidateTag\('page'/)
  assert.match(source, /revalidateTag\('pages'/)
})

test('quick-view route returns stable JSON on product fetch failures', async () => {
  const source = await readFile(
    sourcePath(
      'src',
      'app',
      'api',
      'products',
      '[handle]',
      'quick-view',
      'route.ts',
    ),
    'utf8',
  )

  assert.match(source, /try \{/)
  assert.match(source, /Product quick view is unavailable/)
  assert.match(source, /status:\s*503/)
})

test('codegen fails before building an invalid Shopify schema URL', async () => {
  const source = await readFile(sourcePath('codegen.ts'), 'utf8')
  const toolingSource = await readFile(
    sourcePath('src', 'lib', 'env', 'tooling.ts'),
    'utf8',
  )

  assert.match(source, /requiredToolEnv/)
  assert.match(toolingSource, /requiredEnv/)
  assert.match(toolingSource, /Add it to \.env\.local/)
  assert.match(source, /SHOPIFY_STORE_DOMAIN/)
  assert.match(source, /SHOPIFY_STOREFRONT_ACCESS_TOKEN/)
  assert.doesNotMatch(source, /SHOPIFY_STOREFRONT_ACCESS_TOKEN\s*\?\?\s*''/)
})

test('third-party review enrichment failures use shorter cache lifetimes', async () => {
  const trustooSource = await readFile(
    sourcePath('src', 'lib', 'reviews', 'trustoo.ts'),
    'utf8',
  )

  assert.match(trustooSource, /cacheLife\('minutes'\)/)
  assert.match(trustooSource, /cacheLife\('hours'\)/)
})

test('storefront pricing uses Shopify-native cart and variant values', async () => {
  const productSource = await readFile(
    sourcePath('src', 'lib', 'shopify', 'operations', 'product.ts'),
    'utf8',
  )
  const cartSource = await readFile(
    sourcePath('src', 'lib', 'shopify', 'operations', 'cart.ts'),
    'utf8',
  )

  assert.match(productSource, /quantityPriceBreaks/)
  assert.match(cartSource, /merchandise\.quantityPriceBreaks\.nodes/)
  assert.doesNotMatch(productSource, /volumediscount|HULK_VOLUME_DISCOUNT/)
  assert.doesNotMatch(cartSource, /getProduct|bulkPricingTiers/)
})
