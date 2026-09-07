# Customer Accounts Setup And Launch Readiness

Phase 14 uses Shopify's modern Customer Account API for OAuth sign-in, protected customer data, account pages, cart buyer identity sync, and checkout handoff preparation. This checklist is for operators and developers configuring the Shopify dev or production store.

## Required Shopify Admin Setup

- Enable Shopify customer accounts for the store.
- Install and configure the Headless or Hydrogen sales channel that exposes Customer Account API credentials.
- Create or confirm the Customer Account API client used by this storefront.
- Configure the callback URL to match `SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI`.
- Configure the logout redirect URL to match `SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI`.
- Confirm protected customer data access covers the customer, address, and order fields rendered by `/account`.
- Keep `https://mrtea.com.au/account/login` retired for this storefront unless the owner explicitly decides Teavision and Mr Tea accounts are separate.

## Environment Variables

Server-side Customer Account variables:

```bash
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=
SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET=
SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI=
SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI=
```

Automated fake-server tests may also set:

```bash
SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE=true
SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL=http://127.0.0.1:<port>
```

Do not expose Customer Account credentials, access tokens, refresh tokens, ID tokens, or real customer examples through `NEXT_PUBLIC_*`, Storybook args, browser props, logs, analytics, or screenshots.

## Local HTTPS OAuth Testing

Shopify Customer Account OAuth requires a public HTTPS callback. Localhost callback URLs are not enough for live OAuth. Use an HTTPS tunnel for manual OAuth testing, then configure the tunneled callback and logout URLs in Shopify admin before starting the flow.

Keep the local fake Customer Account API for automated unit, integration, Storybook, and Playwright coverage. The fake endpoint must stay local and must only be enabled with `SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE=true`.

## Phase 15 OAuth Launch Evidence

### Configuration inspection: 7 September 2026

The owner authorised verification against the current store in this Codex task ("no dev store, go with the current"). Read-only inspection of Shopify admin, `mrteashop-com` → Headless → Teavision Headless → Customer Account API, confirmed:

- Modern customer accounts are enabled and the client type is Public (web app).
- The configured callbacks include `https://www.teavision.com.au/account/callback` and `https://teavision-storefront.vercel.app/account/callback`.
- The configured logout URLs include `https://www.teavision.com.au/account/login` and `https://teavision-storefront.vercel.app/account/login`.
- Matching JavaScript origins are registered for both hosts.
- `customer_read_customers`, `customer_write_customers`, `customer_read_orders`, `customer_read_markets`, and `customer_read_companies` are enabled.

The initial shared vercel.app-origin configuration blocker is resolved. A later read-only Vercel inspection on 7 September confirmed separate Production and Preview entries, with Production using `https://www.teavision.com.au/account/callback` and `https://www.teavision.com.au/account/login`. Both match the Shopify allow-list. A separate task applied these changes and deployed commit `076aca8e69ff8fae26f37e1967b0a563d0c6f6d5` as `dpl_FNukrfmQsmi6R2Ttcczi7sANew33`. This readiness task made no environment changes.

The separate task's [TKT-03154 verification](tkt-03154-verification.md) records successful live logout, fresh email-code sign-in, callback and standard hosted-checkout account/cart parity. This task independently used the owner's current signed-in Chrome session to load the production dashboard, profile and saved address; the storefront cart confirmation identity matched. No customer records or credentials are reproduced here. Populated order data and customer/company pricing parity still need evidence. The deployed correction excludes this task's uncommitted readiness fixes. After explicit inspection-only approval, this task also independently confirmed that the hosted checkout Account email exactly matched the storefront cart confirmation email. Product/variant, quantity and subtotal matched; no payment or order was submitted. See [cart-checkout-uat.md](cart-checkout-uat.md) for the dated boundary and remaining shipping-address limitation.

Before recording Customer Account OAuth as launch-ready, confirm that the production `SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI` and `SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI` values match the callback and logout redirect URLs configured in Shopify admin.

Direct `/account/login/start` links must use `prefetch={false}` so Next.js does not prefetch into the OAuth-start redirect path. Normal internal `/account` links can remain regular app navigation.

Automated local/fake tests cover `/account`, `/account/login`, `/account/login/start`, `/account/callback`, `/account/logout`, legacy account bridge routes, and cart buyer-identity checkout handoff. They prove app-side routing, local callback/logout behavior, fake OAuth exchange, protected route handling, and fake checkout handoff only.

For future live OAuth runs, record owner/admin approval, date, tester, configured callback URL, configured logout URL, store/admin context, and pass/fail result. The current release evidence is linked above.

## Protected Customer Data Access

Before launch, verify the Shopify admin protected customer data access covers:

- Customer email, name, and phone fields used in the dashboard and profile pages.
- Mailing address fields used in address book and address forms.
- Order history, order details, line items, totals, financial status, fulfillment status, shipping address, and tracking fields.

If access is missing, account pages should fail closed with operator-facing setup guidance rather than serving stubbed customer data.

## Automated Test Boundary

Automated tests may cover OAuth helpers, fake OAuth discovery/token exchange, protected route handling, account UI states, address/profile Server Actions, cart buyer identity sync, and fake checkout URL handoff.

Automated tests must stop at the fake checkout URL such as `https://checkout.test/`. They must not load or submit Shopify hosted checkout.
Local production e2e evidence and its fake Customer Account boundary are recorded in `docs/launch/production-e2e-evidence.md`.

## Manual Approval Gate

Real Shopify hosted checkout, payment, shipping-rate, tax, order creation, and success redirect tests are blocked until the store owner explicitly approves checkout testing.

After approval, run those tests only against the approved Shopify dev store or production-safe test boundary, using test products/payment methods approved by the owner. Record the approval, date, tester, store, and exact scenarios before any live checkout attempt.

## Reorder Parity

Reorder remains deferred unless a future implementation uses authoritative Shopify cart actions, current variant availability, and no price promises.

A future reorder flow must re-check each line against current Shopify variant availability before adding items to cart. It must not replay old prices, promise historical discounts, or bypass cart Server Actions.

## B2B And Customer Pricing Parity

B2B and customer-specific pricing parity is Shopify-admin-dependent and checkout/cart-authoritative.

The headless UI must not calculate or promise client-side customer-specific prices. If Shopify B2B, company location, catalogs, or customer context affects pricing, that authority must come from Shopify cart or checkout data returned for the signed-in customer.

## Launch Checklist

- Shopify customer accounts are enabled.
- Headless or Hydrogen sales channel credentials are configured.
- `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` is set server-side.
- `SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET` is set server-side with a strong secret.
- Callback and logout URLs match Shopify admin configuration.
- HTTPS tunnel callback/logout URLs are configured for live local OAuth tests.
- Protected customer data access covers account, address, and order fields.
- Header account icon and footer Login route point to `/account`.
- Legacy account routes show the modern Shopify sign-in bridge and no password forms.
- Cart checkout handoff is covered by fake-Shopify tests only.
- Store-owner approval is recorded before any real hosted checkout testing.
