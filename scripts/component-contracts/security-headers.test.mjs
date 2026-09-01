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

test('Next config applies the shared security header baseline', async () => {
  const nextConfigSource = await readFile(sourcePath('next.config.ts'), 'utf8')
  const securityHeadersSource = await readFile(
    sourcePath('src', 'lib', 'security', 'headers.ts'),
    'utf8',
  )

  assert.match(nextConfigSource, /poweredByHeader:\s*false/)
  assert.match(nextConfigSource, /headers\(\)/)
  assert.match(securityHeadersSource, /Strict-Transport-Security/)
  assert.match(securityHeadersSource, /Content-Security-Policy-Report-Only/)
  assert.match(securityHeadersSource, /X-Content-Type-Options/)
  assert.match(securityHeadersSource, /Permissions-Policy/)
  assert.match(securityHeadersSource, /NEXT_PUBLIC_GA4_MEASUREMENT_ID/)
  assert.match(securityHeadersSource, /NEXT_PUBLIC_GTM_CONTAINER_ID/)
  assert.match(securityHeadersSource, /NEXT_PUBLIC_META_PIXEL_ID/)
  assert.match(securityHeadersSource, /NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY/)
  assert.match(securityHeadersSource, /NEXT_PUBLIC_SHOPIFY_PIXEL_ENABLED/)
  assert.match(securityHeadersSource, /googletagmanager\.com/)
  assert.match(securityHeadersSource, /google-analytics\.com/)
  assert.match(securityHeadersSource, /facebook\.net/)
  assert.match(securityHeadersSource, /klaviyo/)
})

test('Next config permits Server Actions through the approved development proxy', async () => {
  const nextConfigSource = await readFile(sourcePath('next.config.ts'), 'utf8')

  assert.match(nextConfigSource, /developmentProxyOrigins/)
  assert.match(nextConfigSource, /detonate-trickster-venus\.ngrok-free\.dev/)
  assert.match(nextConfigSource, /allowedDevOrigins:\s*developmentProxyOrigins/)
  assert.match(nextConfigSource, /serverActions:\s*{/)
  assert.match(
    nextConfigSource,
    /NODE_ENV === 'development' \? developmentProxyOrigins : \[\]/,
  )
})
