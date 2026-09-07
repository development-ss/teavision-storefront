# Production E2E Evidence

## Automated Local Production Evidence

### Verification: 7 September 2026

The final fake-provider production run passed **44/44 browser tests**, including signed-in checkout handoff, account switching, cart persistence after reload, login/logout document navigation, responsive smoke coverage, and a regression that deliberately delays JavaScript delivery. Purchase controls remain disabled until hydration completes, then successfully add the minimum product quantity.

The cart persistence test now waits for the server-confirmed order summary before reloading; the quantity input alone is optimistic. Signed-in fixtures use the active Playwright `baseURL` for cookies so both development and production hostnames are tested correctly.

Command: `PLAYWRIGHT_PORT=54173 node --env-file=.env.local node_modules/@playwright/test/cli.js test --config=playwright.production.config.ts --output=.tmp/readiness-hydration-results` (set `PLAYWRIGHT_PORT` with the platform's environment syntax). The production config supplied local fake providers and test credentials. No real hosted checkout or payment was performed by this run.

Run the local production browser suite with:

```bash
pnpm test:e2e:production
```

This command builds the Next.js app, starts it with `next start`, starts the
fake Shopify Storefront provider, starts the fake Customer Account provider,
and runs the Playwright cart, consent, and production smoke tests.

Current automated evidence covers:

- Cart add, update, remove, and checkout handoff against fake Shopify.
- Signed-in checkout handoff with fake customer session state.
- Consent banner and cookie-preferences behavior.
- Production smoke coverage for `/`, `/collections/all`,
  `/products/test-standard-tea`, `/cart`, `/search?q=tea`, `/account`,
  `/pages/privacy-policy`, and `/api/health`.
- Public health JSON returning `service: 'teavision-storefront'`.
- A single keyboard-accessible skip link on `/` targeting `main#main-content`.
- 375px mobile overflow checks for `/cart` and a long-query `/search` route.

## Fake Provider Boundary

Automated tests use fake Shopify Storefront and fake Customer Account
providers. They stop at `https://checkout.test/` and must not load Shopify
hosted checkout, payment, shipping, tax, order creation, success redirect,
live OAuth, protected customer data, or B2B pricing checks.

Browser tests block third-party browser requests, and the production
Playwright config keeps analytics in fake mode with Searchanise disabled so
local evidence does not depend on production analytics or external search.

## Owner-Gated Shopify Hosted Checkout Evidence

Shopify hosted checkout, payment, shipping-rate, tax, order creation, and
success-redirect testing require explicit store-owner approval before any
real hosted checkout flow is opened. Until that approval exists, this evidence
is owner-gated and must be recorded through `docs/testing/cart-checkout-uat.md`.

Required proof after approval:

- Owner approval, date, tester, and store context.
- Dev store or production-safe checkout URL.
- Test payment method and products used.
- Shipping, tax, payment, order, and success-state results.
- Confirmation that production fulfilment, email, SMS, ERP, and unsafe
  analytics side effects were disabled or sandboxed.

## Owner-Gated Customer Account Evidence

Live Customer Account OAuth, protected customer data access, and production
callback/logout proof require Shopify admin configuration and owner approval.
Until that approval exists, automated tests cover only local fake OAuth and
account bridge behavior.

Required proof after approval:

- Owner/admin approval, date, tester, and store context.
- Configured callback and logout redirect URLs.
- Protected customer data scopes covering account, address, and order fields.
- Live OAuth sign-in/logout result.
- Confirmation that no credentials, access tokens, refresh tokens, ID tokens,
  or real customer examples were exposed in client code, logs, analytics, or
  screenshots.

## Residual Risks

- Local fake-provider tests cannot prove Shopify hosted checkout, payment,
  shipping, tax, order creation, or success redirect behavior.
- Local fake-provider tests cannot prove live Customer Account OAuth or
  protected customer data scope approval.
- B2B and customer-specific pricing parity remains Shopify-admin-dependent
  and must be verified with owner-approved customer/company-location evidence.
- Search Console sitemap submission and URL inspection remain owner-gated
  until property access and dated proof exist.
