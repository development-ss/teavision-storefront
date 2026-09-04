export type SecurityHeader = {
  key: string
  value: string
}

export const contentSecurityPolicyReportOnlyHeaderName =
  'Content-Security-Policy-Report-Only'

type SecurityHeaderEnvKey =
  | 'NEXT_PUBLIC_GA4_MEASUREMENT_ID'
  | 'NEXT_PUBLIC_GTM_CONTAINER_ID'
  | 'NEXT_PUBLIC_META_PIXEL_ID'
  | 'NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY'
  | 'NEXT_PUBLIC_SHOPIFY_PIXEL_ENABLED'

type SecurityHeaderEnv = Record<string, string | undefined>

function hasEnvValue(
  env: SecurityHeaderEnv,
  key: SecurityHeaderEnvKey,
): boolean {
  return Boolean(env[key]?.trim())
}

function isTruthyEnv(
  env: SecurityHeaderEnv,
  key: SecurityHeaderEnvKey,
): boolean {
  return env[key]?.trim() === 'true'
}

export function buildContentSecurityPolicy(
  env: SecurityHeaderEnv = process.env,
): string {
  const scriptSources = [
    "'self'",
    "'unsafe-inline'",
    'https://searchserverapi.com',
  ]
  const imgSources = [
    "'self'",
    'blob:',
    'data:',
    'https://cdn.shopify.com',
    'https://www.teavision.com.au',
    'https://cdn.sanity.io',
    'https://searchserverapi.com',
    'https://searchserverapi1.com',
  ]
  const connectSources = [
    "'self'",
    'https://searchserverapi1.com',
    'https://api.trustoo.io',
    'https://*.myshopify.com',
    'https://*.shopify.com',
  ]
  const frameSources = ["'self'", 'https://maps.google.com']

  const ga4Enabled = hasEnvValue(env, 'NEXT_PUBLIC_GA4_MEASUREMENT_ID')
  const gtmEnabled = hasEnvValue(env, 'NEXT_PUBLIC_GTM_CONTAINER_ID')
  const metaEnabled = hasEnvValue(env, 'NEXT_PUBLIC_META_PIXEL_ID')
  const klaviyoEnabled = hasEnvValue(env, 'NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY')
  const shopifyPixelEnabled = isTruthyEnv(
    env,
    'NEXT_PUBLIC_SHOPIFY_PIXEL_ENABLED',
  )

  if (ga4Enabled || gtmEnabled) {
    scriptSources.push('https://www.googletagmanager.com')
    connectSources.push(
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
    )
  }

  if (metaEnabled) {
    scriptSources.push('https://connect.facebook.net')
    connectSources.push('https://www.facebook.com')
    imgSources.push('https://www.facebook.com')
  }

  if (klaviyoEnabled) {
    scriptSources.push('https://static.klaviyo.com')
    connectSources.push(
      'https://a.klaviyo.com',
      'https://static.klaviyo.com',
      'https://telemetrics.klaviyo.com',
    )
  }

  if (shopifyPixelEnabled) {
    scriptSources.push('https://cdn.shopify.com')
    connectSources.push('https://monorail-edge.shopifysvc.com')
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSources.join(' ')}`,
    "font-src 'self' data:",
    `connect-src ${connectSources.join(' ')}`,
    `frame-src ${frameSources.join(' ')}`,
    "media-src 'self'",
    "manifest-src 'self'",
    // 'upgrade-insecure-requests' is intentionally omitted: it is ignored in a
    // report-only policy (browsers log a console error) and the site is served
    // entirely over HTTPS. Re-add it only if the CSP is promoted to an enforcing
    // Content-Security-Policy header.
  ].join('; ')
}

export const securityHeaders: SecurityHeader[] = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: contentSecurityPolicyReportOnlyHeaderName,
    value: buildContentSecurityPolicy(),
  },
]
