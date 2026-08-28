import { defineConfig, devices } from '@playwright/test'

import {
  defaultedNumberEnv,
  isContinuousIntegration,
} from './src/lib/env/tooling'

const PORT = defaultedNumberEnv('PLAYWRIGHT_PORT', 4173)
const BASE_URL = `http://localhost:${PORT}`
const FAKE_SHOPIFY_PORT = defaultedNumberEnv('FAKE_SHOPIFY_PORT', 4517)
const FAKE_SHOPIFY_URL = `http://127.0.0.1:${FAKE_SHOPIFY_PORT}/graphql`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: isContinuousIntegration() ? 2 : 0,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'node --import tsx tests/mocks/run-fake-shopify-server.ts',
      url: `http://127.0.0.1:${FAKE_SHOPIFY_PORT}/health`,
      reuseExistingServer: false,
      env: {
        FAKE_SHOPIFY_PORT: String(FAKE_SHOPIFY_PORT),
      },
    },
    {
      command: `corepack pnpm exec next dev -p ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: false,
      env: {
        SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID: 'test-client-id',
        SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI: `${BASE_URL}/account/login`,
        SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI: `${BASE_URL}/account/callback`,
        SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET:
          'test-session-secret-with-at-least-32-characters',
        SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE: 'true',
        SHOPIFY_STOREFRONT_TEST_MODE: 'true',
        SHOPIFY_STOREFRONT_TEST_URL: FAKE_SHOPIFY_URL,
        SHOPIFY_ADMIN_TEST_MODE: 'true',
        SHOPIFY_ADMIN_TEST_URL: FAKE_SHOPIFY_URL,
        SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'test-token',
        SHOPIFY_STORE_DOMAIN: 'fake-shopify.test',
        SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'test-token',
        NEXT_PUBLIC_SEARCHANISE_ENABLED: 'false',
        NEXT_PUBLIC_SEARCHANISE_API_KEY: '',
      },
    },
  ],
})
