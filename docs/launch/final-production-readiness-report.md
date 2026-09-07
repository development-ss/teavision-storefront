# Final Production Readiness Report

Consolidated 7 September 2026 after the full audit and targeted follow-up verification. This is not a claim that a second complete audit was run in one invocation.

**Decision: functional code checks pass; production release remains gated by deployment of the local fixes and remaining release checks and documented test exceptions.** This task has not pushed or deployed. A separate task deployed the OAuth/logout correction during verification; its evidence is attributed below.

## Automated Code Readiness Score

Strict result: **16/17 checks pass (94/100)**. Mobile Lighthouse still exceeds the 2500ms LCP threshold on seven routes. The existing dated owner acceptance in [performance-acceptance.md](performance-acceptance.md) covers these local lab failures; this report preserves the strict failure instead of presenting the measurements as passing. That acceptance does not approve the separate Shopify/admin gates.

The initial complete run passed 14/17 checks. Follow-up work resolved the unit environment leak, cart persistence test race, and purchase-control hydration defect. A fresh full production browser run then passed 44/44 tests.

## Automated Check Matrix

| Check            | Status                        | Evidence                                                                                                                                                                                                       |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| lint             | PASS                          | `pnpm lint` passed again after all code changes.                                                                                                                                                               |
| typecheck        | PASS                          | `pnpm typecheck` passed again after all code changes.                                                                                                                                                          |
| build            | PASS                          | `pnpm build` passed after dependency updates; the final production browser and performance runs also rebuilt the final application with local fake providers.                                                  |
| unit             | PASS                          | 99 files, 522 tests. Repeated with `.env.local` loaded after explicitly isolating the Customer Account Origin fixture.                                                                                         |
| integration      | PASS                          | 13 files, 96 tests covering Server Actions and route boundaries.                                                                                                                                               |
| storybook        | PASS                          | Full suite: 115 files, 405 tests. After hydration changes, all affected purchase, quick-view, card and rating stories were rechecked: 46 tests passed.                                                         |
| contracts        | PASS                          | 60 component and lint-rule contract tests.                                                                                                                                                                     |
| dependency audit | PASS                          | Full and production-only audits: zero moderate, high or critical advisories; one low esbuild Windows development-server advisory remains. The configured moderate-or-higher gate passes.                       |
| security headers | PASS                          | Production-like local probes passed. Additional read-only checks on `https://www.teavision.com.au` passed.                                                                                                     |
| seo disabled     | PASS                          | Local production-like noindex profile passed.                                                                                                                                                                  |
| seo enabled      | PASS                          | Local indexable profile passed. Existing public deployment passed using a real product; Product/AggregateRating and concrete pattern redirects were verified.                                                  |
| seo redirects    | PASS                          | Redirect inventory checks passed.                                                                                                                                                                              |
| seo runbook      | PASS                          | Runbook checks passed.                                                                                                                                                                                         |
| readiness        | PASS                          | Configuration/document probe passed; this probe does not establish live checkout or OAuth success.                                                                                                             |
| production e2e   | PASS                          | 44/44 tests, including delayed-script hydration, signed-in cart handoff, account switching, quantity persistence, login/logout, and responsive storefront coverage.                                            |
| performance      | FAIL — existing lab exception | Seven routes exceed 2500ms LCP. Latest LCP: 3472–4475ms; CLS: 0.000 on all routes; TBT: 38–60ms. See [performance-evidence.md](performance-evidence.md) and the dated [acceptance](performance-acceptance.md). |
| browser smoke    | PASS                          | 21 dedicated smoke tests passed in the original run and again as part of the final 44-test suite.                                                                                                              |

## Changes Verified

- Updated affected dependencies and narrow transitive security floors. Removed the vulnerable image-size dependency through the Storybook update.
- Corrected signed-in browser fixtures to use the active Playwright origin.
- Waited for server-confirmed cart totals before testing persistence across reload.
- Kept product purchase controls disabled until hydration attaches their event handlers. A regression deliberately delays JavaScript, verifies disabled server HTML, then verifies a successful add after hydration.
- Reserved search-page height while results stream; measured search CLS improved from 0.480 to 0.000.
- Corrected the Google rating distribution using the Google Maps summary inspected on 7 September: 74 five-star, one four-star, zero three/two-star, one one-star review. Total 76, displayed average 4.9, with a visible verification date.
- Switched the Sentry configuration import to the supported `@sentry/nextjs/config` entry point.

## Owner-Gated Launch Evidence

The owner authorised the current Shopify store in place of a dev store: “no dev store, go with the current”. This permits the current-store verification context; it is not evidence that a payment or order scenario passed. After the approved checkout inspection, the owner instructed "we dont have to test this" in response to the proposed shipping and payment/order checks. Further shipping, tax, payment, order-creation and success-state testing is therefore waived for this release, with those outcomes explicitly unverified. This is not permission to submit a purchase.

| Gate                              | Status  | Evidence                                                                                                                                                        |
| --------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hosted checkout                   | partial | Explicitly approved live inspection passed account identity, product/variant/quantity and AUD 11.88 subtotal parity. Full scenario coverage remains incomplete. |
| payment                           | waived  | Current Chrome account selected for inspection only. Purchase product/payment method and maximum AUD total require approval; no payment submitted.              |
| shipping rates                    | waived  | Current saved address is incomplete with no postcode. Hosted checkout requested a complete address and showed no available shipping methods.                    |
| tax                               | waived  | No approved live test order totals verified.                                                                                                                    |
| order creation                    | waived  | No order created.                                                                                                                                               |
| success redirect                  | waived  | No completed payment/order flow.                                                                                                                                |
| live Customer Account OAuth       | PASS    | Production www URLs independently verified. Separate task records live logout, fresh sign-in and successful callback on the deployed correction.                |
| protected customer data           | partial | Current Chrome account dashboard, profile and saved address loaded; cart confirmation identity matched. Populated order/company data remains unverified.        |
| B2B/customer pricing              | pending | No authoritative customer/company-location pricing comparison completed.                                                                                        |
| Search Console sitemap submission | pending | Public sitemap/robots verified; Search Console submission evidence not recorded.                                                                                |
| Search Console URL inspection     | pending | Private property inspection was blocked by automatic approval review; explicit read-only access is pending.                                                     |

## Deployment Configuration: Resolved

Read-only Vercel inspection on 7 September confirmed separate Production and Preview entries for both variables. Production now uses:

- `SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI=https://www.teavision.com.au/account/callback`
- `SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI=https://www.teavision.com.au/account/login`

Both URLs match the previously inspected Shopify allow-list. The separate task's [TKT-03154 verification](../testing/tkt-03154-verification.md) records preserved Preview values, successful live logout, fresh email-code sign-in, callback completion and standard hosted-checkout identity/cart parity. These results belong to that task and its deployed correction, not a fresh full verification of this unpushed candidate. That record now also reports completed Shop Pay identity verification and cleanup.

This task independently loaded the current signed-in Chrome account's dashboard/profile/address and confirmed matching storefront cart identity. After an initial approval block, the owner explicitly approved checkout inspection stopping before payment/order submission. The subsequent live hosted checkout showed the same account email, Organic Cold & Flu 50g variant, quantity one and AUD 11.88 subtotal. The saved address lacked a postcode, so shipping rates and final tax/order totals could not be verified. Payment fields remained untouched. The temporary line was removed and the cart was verified empty. Dated approval and scenario details are in [cart-checkout-uat.md](../testing/cart-checkout-uat.md). This inspection-only approval does not authorise a purchase.

The earlier rejected environment edit and the owner's uncertain response are superseded by the externally applied, now verified configuration. This task made no environment changes.

## Representative Surface Evidence

The final browser run used only local fake Storefront and Customer Account providers at `http://localhost:54173`. It must not be treated as live hosted-checkout, payment, customer-data, or B2B proof. Details: [production-e2e-evidence.md](production-e2e-evidence.md).

## Operations Evidence

Initial public probes checked deployment `dpl_3V6VubwJFmPYGX92tigMX9UR5Mtx` at commit `843ac2a137c818ecee9098a2c0ffe884b4907484`. During verification, a separate task deployed `dpl_FNukrfmQsmi6R2Ttcczi7sANew33` at commit `076aca8e69ff8fae26f37e1967b0a563d0c6f6d5`; Vercel showed Ready and current Production on www. The current account/cart checks used that newer deployment. Local HEAD is now `e940a940` plus the working-tree fixes. The other task's three changed files were already present during the final 44-test run. Neither live deployment includes this task's uncommitted fixes.

Production `DISABLE_INDEXING=false` was observed. No payment, fulfilment, notification, indexing, or deployment setting was changed. Additional evidence and the residual low dependency advisory are in [operations-runbook.md](operations-runbook.md).

## Performance And UX Evidence

Search CLS improved from 0.480 to 0.000. All measured routes now have CLS 0.000. Local mobile LCP remains above the strict threshold, with the existing 26 June owner acceptance retained as a separate release exception. The measured failures are not hidden and are not field Core Web Vitals proof.

## Remaining Release Steps

1. Deploy the verified local candidate through the release approval process; the production OAuth configuration correction is already applied.
2. Smoke-check the new candidate on the www host, preserving the existing live OAuth evidence and verifying cart continuity.
3. Retain the owner's waiver of further shipping/payment/order testing as a release exception; do not represent those scenarios as passing.
4. Record any applicable protected-data, B2B pricing and Search Console evidence.

## Launch Decision

The code fixes and functional checks are verified. **Do not call the complete release production-ready until the candidate is deployed and outstanding live verification is resolved.**
