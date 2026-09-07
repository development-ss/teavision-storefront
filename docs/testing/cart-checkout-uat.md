# Cart and Checkout Hosted UAT

Status as of 2026-09-07: approved checkout inspection passed. Further shipping, tax, payment and order-completion tests are waived by the owner and remain unverified.

## Current-Store Verification: 7 September 2026

The project owner instructed Codex in this task: "no dev store, go with the current". This authorises the current `mrteashop-com.myshopify.com` store in place of the dev-store prerequisite below for this verification session. The original dev-store checklist remains the reusable baseline.

Read-only Shopify admin inspection confirmed modern customer accounts are enabled, the Teavision Headless channel is configured, and Shopify Payments is accepting live payments. This configuration evidence does not establish a successful checkout, payment, or order.

The current Chrome account is now selected for non-purchase checks. Purchase-specific product, payment method and maximum AUD order total still require an approved boundary before submitting any live purchase. No payment-mode change, payment submission, order creation, fulfilment change, or notification-setting change has been made during this verification. Payment, shipping/tax totals, order creation, and success-state results remain pending until the corresponding scenarios are actually completed and recorded.

### Current Chrome session follow-up

The owner instructed: "use the current logged in user in chrome". On 7 September, this task loaded that account's production dashboard/profile/address and confirmed the storefront cart displayed matching account identity. It added one Organic Cold & Flu 50g line (AUD 11.88), accepted terms and attempted checkout navigation. Automatic approval review subsequently rejected hosted-screen inspection as requiring more explicit current-store checkout approval. No hosted-screen pass is claimed from this attempt. The test line was removed and its absence verified; a separate Aniseed Whole line added by a concurrent workflow was preserved. No payment or order was submitted.

Separately, [TKT-03154 verification](tkt-03154-verification.md) records owner-approved inspection of standard hosted checkout on deployment `dpl_FNukrfmQsmi6R2Ttcczi7sANew33`, with the signed-in account and cart lines matching. That task also records successful live logout and fresh OAuth callback. This is attributed evidence for those specific scenarios; full shipping, tax, payment and order-completion UAT remains pending. Shop Pay verification is tracked in that task's record.

### Explicitly approved inspection: 7 September 2026, approximately 16:50 UTC+8

The owner answered "yes" to: "Do you approve inspecting the current store's checkout using your signed-in Chrome account, stopping before payment or order submission?" This resolves the previous automatic approval block for inspection only; it does not authorise a paid order.

Codex independently completed the approved check on the current production storefront:

- Started with an empty cart and added one Organic Cold & Flu 50g unit, AUD 11.88.
- Accepted terms and followed the storefront checkout handoff into Shopify-hosted checkout.
- Compared the visible hosted Account email with the storefront cart confirmation email: exact match, without copying either into this record.
- Confirmed the hosted order summary retained the same product, 50g variant, quantity one, and AUD 11.88 subtotal.
- The saved address was incomplete and had no postcode. Checkout prompted for a postal code and showed no available shipping methods. No address was edited; shipping rates and final tax-inclusive order totals remain unverified.
- Payment fields were visible but untouched. No payment or order submission was made.
- Removed the temporary product through the storefront and verified the cart returned to empty.

Result: live handoff, account identity and line/subtotal parity PASS for this scenario. Full hosted UAT remains incomplete. This verifies the existing deployment, not the uncommitted production-readiness fixes.

For routine future runs, use the dev-store prerequisites below. Any current-store exception must record the owner's authorisation and the exact purchase boundary before testing payment or order creation.

## Owner decision after inspection

After being given the next steps for a complete shipping address and a paid test order, the owner instructed "we dont have to test this". Further shipping, tax, payment, order-creation and success-state tests are waived for this release. Preserve the passing inspection evidence above and the unverified outcomes; no payment or order is authorised by this waiver. The reusable checklist below remains available for future approved runs.

## Scope

This checklist covers Shopify-hosted checkout behavior that the Next.js storefront does not own:

- Customer information validation
- Shipping address validation
- Billing address validation
- Shipping method selection
- Payment method selection
- Hosted order summary calculations
- Tax and shipping calculations
- Test order creation
- Payment success and failure recovery
- Success or thank-you state

Local automated tests cover only cart behavior and the `cart.checkoutUrl` handoff.
Local production e2e evidence and its fake-provider boundary are recorded in
`docs/launch/production-e2e-evidence.md`.

## Preconditions

- Shopify dev store exists.
- Production data needed for testing has been copied or recreated safely.
- Test payments are enabled through Shopify Payments test mode or Bogus Gateway.
- Production payment credentials are not present.
- Production fulfilment, analytics, email, SMS, ERP, and shipping-label integrations are disabled or sandboxed.
- The Next.js environment points at the dev store.
- The store owner has explicitly approved hosted checkout testing.

## Test Data

Products:

- In-stock standard product
- Multi-variant product
- Low-stock product
- Out-of-stock product
- Discount-eligible product
- Discount-excluded product
- Heavy or bulky product that affects shipping

Discounts:

- `TEST10`
- `TEST-FREESHIP`
- `TEST-MIN-SPEND`
- `TEST-EXPIRED`

Customers:

- Guest checkout email
- Existing test customer email
- Wholesale-style test customer email if relevant

Addresses:

- Valid domestic address
- Valid regional address
- Valid international address if enabled
- Invalid postcode/address combination
- Missing required fields

## Checklist

### Cart To Checkout Handoff

- Add a standard product to cart from the PDP.
- Confirm cart subtotal and discount display in the storefront.
- Select Checkout.
- Confirm the browser enters the dev Shopify checkout, not production.
- Confirm the checkout order summary contains the same products and quantities.
- Confirm cart subtotal and discounts match before shipping and tax.

### Customer Information

- Submit checkout with missing required contact information.
- Confirm Shopify blocks progress and shows clear validation.
- Submit checkout with a valid test email.
- Confirm progress to shipping address.

### Shipping Address

- Submit an incomplete address.
- Confirm Shopify blocks progress and highlights required fields.
- Submit a valid domestic address.
- Confirm progress to shipping method.
- Submit an unsupported address if applicable.
- Confirm Shopify shows a safe no-rate or unsupported-address state.

### Shipping Method

- Confirm expected shipping methods are shown for the valid test address.
- Confirm free-shipping discount behavior when `TEST-FREESHIP` is applied.
- Confirm heavy or bulky product rates if configured.

### Billing Address

- Complete checkout with billing same as shipping.
- Complete checkout with a different billing address.
- Confirm both paths preserve order summary totals.

### Payment

- Use only Shopify-approved test payment details.
- Confirm successful test payment creates a test order.
- Confirm declined test payment shows a recoverable error.
- Retry after a declined payment and confirm recovery works.

### Success State

- Confirm the success or thank-you page appears after successful payment.
- Confirm order number is visible.
- Confirm no production fulfilment, email, SMS, analytics, or ERP side effects occur.

## Evidence To Capture

- Dev store URL.
- Next.js environment URL.
- Test product handles.
- Discount codes used.
- Shipping addresses used.
- Payment test type.
- Order number for successful test order.
- Screenshots or notes for failures.

## Residual Risks

- Local automated tests cannot prove hosted Shopify checkout, tax, shipping, or payment behavior.
- Dev store settings can drift from production.
- App integrations may behave differently in sandbox or dev-store mode.
- The current storefront has no cart discount-code entry; discount-code behavior is checkout-only unless a separate feature adds cart-level discount mutations.
