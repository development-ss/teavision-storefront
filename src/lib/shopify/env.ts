import { defaultedEnv, optionalEnv, truthyEnv } from '@/lib/env/read'
import { isProductionRuntime, isTestRuntime } from '@/lib/env/runtime'

const SHOPIFY_API_VERSION = '2026-04'
const LOCAL_TEST_ENDPOINT_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

export type StorefrontEndpoint = {
  headers: Record<string, string>
  url: string
}

export const SHOPIFY_COLLECTIONS_INDEX_MENU_HANDLE = defaultedEnv(
  'SHOPIFY_COLLECTIONS_INDEX_MENU_HANDLE',
  'main-menu',
)

function isLocalTestEndpoint(url: string): boolean {
  try {
    return LOCAL_TEST_ENDPOINT_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

function allowsProductionTestEndpoint(): boolean {
  return truthyEnv('PLAYWRIGHT_PRODUCTION_TEST_MODE')
}

export function getShopifyStoreDomain(): string | undefined {
  return optionalEnv('SHOPIFY_STORE_DOMAIN')
}

export function getStorefrontEndpoint(): StorefrontEndpoint {
  const domain = getShopifyStoreDomain()
  const token = optionalEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN')
  const testUrl = optionalEnv('SHOPIFY_STOREFRONT_TEST_URL')
  const isTestEndpointEnabled = truthyEnv('SHOPIFY_STOREFRONT_TEST_MODE')

  if (testUrl && isTestEndpointEnabled) {
    if (isProductionRuntime() && !allowsProductionTestEndpoint()) {
      throw new Error('Shopify test endpoint is not allowed in production')
    }

    if (!isLocalTestEndpoint(testUrl)) {
      throw new Error('Shopify test endpoint must be local')
    }

    if (!token && !isTestRuntime()) {
      throw new Error('Missing Shopify credentials')
    }

    return {
      url: testUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token || 'test-token',
      },
    }
  }

  if (testUrl && !isTestEndpointEnabled) {
    throw new Error('Shopify test endpoint requires explicit test mode')
  }

  if (!domain || !token) {
    throw new Error('Missing Shopify credentials')
  }

  return {
    url: `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
  }
}
