import type { CodegenConfig } from '@graphql-codegen/cli'
import { preset as clientPreset } from '@graphql-codegen/client-preset'

import { requiredToolEnv } from './src/lib/env/tooling'

const shopifyStoreDomain = requiredToolEnv(
  'SHOPIFY_STORE_DOMAIN',
  'pnpm codegen',
)
const shopifyStorefrontAccessToken = requiredToolEnv(
  'SHOPIFY_STOREFRONT_ACCESS_TOKEN',
  'pnpm codegen',
)

const config: CodegenConfig = {
  schema: {
    [`https://${shopifyStoreDomain}/api/2026-04/graphql.json`]: {
      headers: {
        'X-Shopify-Storefront-Access-Token': shopifyStorefrontAccessToken,
      },
    },
  },
  documents: ['src/lib/shopify/queries/**/*.graphql'],
  generates: {
    'src/lib/shopify/types/generated/': {
      preset: clientPreset,
      config: {
        enumsAsTypes: false,
        scalars: {
          DateTime: 'string',
          ISO8601DateTime: 'string',
          Decimal: 'string',
          HTML: 'string',
          URL: 'string',
          Color: 'string',
          UnsignedInt64: 'string',
          JSON: 'unknown',
        },
      },
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
}

export default config
