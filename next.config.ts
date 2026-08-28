import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

import { getPolicyRedirects } from './src/lib/legal/policies'
import { CANONICAL_BLOG_LISTING_PATH } from './src/lib/blog/paths'
import { securityHeaders } from './src/lib/security/headers'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['detonate-trickster-venus.ngrok-free.dev'],
  cacheComponents: true,
  env: {
    // Build-time copyright year — avoids per-request new Date() in components,
    // which breaks Next 16 prerendering. Refreshes on every build/deploy.
    BUILD_YEAR: String(new Date().getFullYear()),
  },
  async redirects() {
    return [
      {
        source: '/collections/:handle/products/:productHandle',
        destination: '/products/:productHandle',
        permanent: true,
      },
      {
        source: '/pages/banner',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/search-results-page',
        destination: '/search',
        permanent: true,
      },
      {
        source: '/pages/search-results',
        destination: '/search',
        permanent: true,
      },
      {
        source: '/pages/test-page',
        destination: '/',
        permanent: true,
      },
      {
        source: '/pages/terms-conditions-1',
        destination: '/pages/terms-conditions',
        permanent: true,
      },
      // Legacy blog handle → canonical. The listing routes only statically
      // generate the canonical handle, so redirect the alias before it 404s.
      {
        source: '/blogs/teavision-blogs',
        destination: CANONICAL_BLOG_LISTING_PATH,
        permanent: true,
      },
      {
        source: '/blogs/journal',
        destination: CANONICAL_BLOG_LISTING_PATH,
        permanent: true,
      },
      {
        source: '/blogs/journal/:path*',
        destination: '/blogs/teavision-blogs/:path*',
        permanent: true,
      },
      ...getPolicyRedirects(),
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    qualities: [68, 75, 82],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'www.teavision.com.au',
        pathname: '/cdn/shop/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  poweredByHeader: false,
}

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  release: {
    create: Boolean(
      process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_RELEASE,
    ),
    finalize: Boolean(
      process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_RELEASE,
    ),
    name: process.env.SENTRY_RELEASE,
  },
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  telemetry: false,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
  webpack: {
    autoInstrumentServerFunctions: false,
  },
})
