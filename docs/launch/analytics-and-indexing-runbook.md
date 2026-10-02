# Analytics And Indexing Launch Runbook

This runbook records the safe launch process for consent-aware analytics
destinations and owner-gated indexing checks. Production destination IDs,
checkout evidence, and Search Console access remain owner-controlled.

## Analytics Destinations

| Destination    | Launch status                                                              | Env gate                                                                                                                                                                 | Consent category | Notes                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| GA4            | Launch priority                                                            | `NEXT_PUBLIC_GA4_MEASUREMENT_ID` plus non-fake `NEXT_PUBLIC_ANALYTICS_MODE`                                                                                              | Analytics        | Use only the public measurement ID. Verify with consent granted before cutover and in Realtime/DebugView after cutover.                              |
| GTM            | Live priority: pre-migration container `GTM-KF2Z76H` (owner SEO checklist) | `NEXT_PUBLIC_GTM_CONTAINER_ID`, else `GTM-KF2Z76H` on Vercel production builds only (`src/lib/analytics/destination-ids.ts`), plus non-fake `NEXT_PUBLIC_ANALYTICS_MODE` | Analytics        | Loads only after analytics consent. GA4 is configured inside the container. Do not add tags in GTM that bypass storefront consent categories.        |
| Meta Pixel     | Disabled until owner approval                                              | `NEXT_PUBLIC_META_PIXEL_ID` plus non-fake `NEXT_PUBLIC_ANALYTICS_MODE`                                                                                                   | Marketing        | Enable only after marketing consent copy and destination access are approved.                                                                        |
| Klaviyo        | Disabled until owner approval                                              | `NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY` plus non-fake `NEXT_PUBLIC_ANALYTICS_MODE`                                                                                              | Marketing        | Public key only; no private API keys in client code.                                                                                                 |
| Shopify pixels | Documented disabled until owner implementation approval                    | CSP flag only: `NEXT_PUBLIC_SHOPIFY_PIXEL_ENABLED=true`; no browser loader is mounted at launch                                                                          | Marketing        | Requires Shopify Customer Privacy API, a dedicated loader implementation, and owner-approved Shopify pixel configuration evidence before enablement. |
| fake/test sink | Local and CI default                                                       | `NEXT_PUBLIC_ANALYTICS_MODE=fake`                                                                                                                                        | Analytics        | Local and CI verification must use the fake/test sink and must not send production analytics.                                                        |

Launch event coverage is limited to `product_view`, `search`,
`add_to_cart`, `cart_update`, `checkout_start`, and `lead_submit` with lead
kinds for newsletter, contact, wholesale, and NPD. Submitted names, email
addresses, phone numbers, companies, product lists, notes, and message bodies
must never be copied into analytics payloads.

When a GTM container is configured (production default `GTM-KF2Z76H`), these
events are pushed to the GTM `dataLayer` after analytics consent, using GA4
event names: `view_item`, `search`, `add_to_cart`, `cart_update`,
`begin_checkout` and `generate_lead` (with `lead_kind`). Item lists go under
`ecommerce.items`. They are not also sent to GA4 directly, so nothing is
counted twice. GTM needs a Custom Event trigger and GA4 event tag for each
event it should forward (`src/lib/analytics/destinations/gtm.ts`).

GTM container review (2 October 2026, live site):

- The `contact_form_submission`, `newsletter_form_submission`,
  `homepage_bottom_form` and `purchase` tags use triggers from the old Shopify
  theme (form ID `contact_form`, a page URL containing `newsletter`, the
  `btn-link` class, and an `orderComplete` event). The new storefront never
  produces these, so the tags do not fire. Point them at `generate_lead` with
  the matching `lead_kind` instead.
- One click on a `tel:` or `mailto:` link sent three `phone_number_click` or
  `email_address_click` events to G-RQZ3KYHCLZ. Check the trigger setup in GTM
  Preview.
- Four Universal Analytics tags remain in the container. Universal Analytics
  no longer collects data, so they can be removed.

## Pre-Cutover Analytics Verification

1. Keep local and CI configuration on `NEXT_PUBLIC_ANALYTICS_MODE=fake`.
2. Confirm `.env.example` documents public destination variables only:
   `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_CONTAINER_ID`,
   `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_KLAVIYO_PUBLIC_KEY`, and the
   disabled Shopify pixel CSP reservation flag.
3. Run the unit checks for consent-gated dispatch and CSP host gating.
4. In a local browser, reject optional cookies and confirm no GA4, GTM, Meta,
   Klaviyo, or Shopify pixel scripts load.
5. Grant analytics consent with a test public GA4 ID in a non-production
   environment and confirm only GA4/GTM analytics hosts are allowed by CSP when
   configured.
6. Grant marketing consent only when testing owner-approved marketing
   destinations, then confirm Meta, Klaviyo, or Shopify pixel hosts remain
   absent unless their env gates are explicitly configured.

## Pre-Cutover Indexing Verification

1. Confirm the launch environment still has `DISABLE_INDEXING=true`.
   If the SEO team needs the canonical URL list from staging, set
   `EXPOSE_SITEMAP=true`. This exposes `/sitemap.xml` without removing the
   page-level noindex protection or advertising the sitemap in staging
   `robots.txt`.
2. Run disabled-mode route evidence against the local production server or
   staging host:

   ```bash
   node scripts/seo/probe-launch-seo.mjs --mode disabled
   ```

3. Verify legal policy redirects before cutover:

   ```bash
   node scripts/seo/probe-launch-seo.mjs --mode redirects
   ```

4. Confirm the legal approval matrix and owner/legal approval state are
   recorded before presenting policy pages as final.
5. Record disabled-mode and redirect proof in
   `docs/launch/seo-route-evidence.md`.

## Cutover Analytics And Indexing

1. Confirm production destination IDs are owner-approved public values before
   changing analytics mode away from fake/disabled.
2. Set `DISABLE_INDEXING=false` for the launch deployment.
3. Deploy through the approved production release path.
4. Run enabled-mode route-matrix evidence against the launch host:

   ```bash
   SEO_PROBE_BASE_URL=https://www.teavision.com.au node scripts/seo/probe-launch-seo.mjs --mode enabled
   ```

5. Grant analytics consent in a browser session and verify approved analytics
   destinations only; keep marketing destinations disabled unless owner
   approval and matching consent copy exist.
6. Record command output, launch host, timestamp, verifier, and any skipped
   product structured-data warning in the Evidence Log and SEO evidence doc.

## Post-Cutover Analytics Verification

1. Confirm production was built with the owner-approved public destination IDs.
2. Confirm denied optional consent blocks destination loading on the live site.
3. Grant analytics consent and verify GA4 receives product view, search,
   add-to-cart, cart update, checkout start, and lead-submit test events.
4. Verify GTM only if the owner approved `NEXT_PUBLIC_GTM_CONTAINER_ID`.
5. Verify Meta, Klaviyo, and Shopify pixels only if the owner approved the
   matching marketing destination and consent copy.
6. Record destination, URL, consent state, event name, timestamp, verifier, and
   evidence link in the Evidence Log.

## Post-Cutover Indexing Verification

1. Submit `/sitemap.xml` in Google Search Console only after owner property
   access is available.
2. Inspect representative legal, product, collection, and static landing URLs
   in Google Search Console after cutover.
3. Record URL, indexing state, timestamp, verifier, and evidence link in the
   Evidence Log and `docs/launch/seo-route-evidence.md`.

## Owner-Gated Purchase And Order Tracking

Purchase and order analytics are not enabled by default. Do not add purchase,
order-created, payment, shipping-rate, tax, success-redirect, or hosted
checkout analytics until the store owner approves real Shopify hosted checkout
testing and provides order evidence.

Before enabling purchase/order tracking, collect:

- Owner approval for hosted checkout/payment/order testing.
- Shopify dev store or production-safe order test plan.
- Destination-specific purchase event mapping.
- Proof that no submitted customer PII or order note text is sent to browser
  analytics destinations.
- Rollback instructions for disabling the destination env gate.

## Search Console And Sitemap Submission

Search Console access and sitemap submission proof are owner-gated. Engineering
can run local robots, sitemap, canonical, noindex, structured-data, and redirect
checks, but cannot claim Search Console submission until owner access or dated
proof exists.

1. Confirm the owner has access to the canonical production property.
2. Confirm launch indexing is intentionally enabled with
   `DISABLE_INDEXING=false` before submission.
3. Submit the production `/sitemap.xml` URL after cutover.
4. Inspect representative URLs:
   - Legal: `/pages/privacy-policy`, `/pages/terms-of-service`
   - Product: one owner-approved product URL
   - Collection: `/collections/all` or another launch collection URL
   - Static: `/pages/bulk-wholesale-supply`, `/pages/private-label-packing`
5. Record proof or mark access as owner-gated in the Evidence Log and
   `docs/launch/seo-route-evidence.md`.

## Evidence Log

| Date        | Environment      | Destination or tool | Consent state            | Check                                                                                                                                                                         | Evidence                                                                     | Owner/Verifier    |
| ----------- | ---------------- | ------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------- |
| Pending     | Local/CI         | fake/test sink      | Analytics denied/granted | Unit tests prove fake sink and consent gates                                                                                                                                  | `pnpm test:unit -- src/lib/analytics/adapter.test.ts`                        | Engineering       |
| Pending     | Local production | SEO route matrix    | Not applicable           | Disabled mode, enabled mode, redirects, sitemap, canonical, noindex, and structured-data evidence                                                                             | `node scripts/seo/probe-launch-seo.mjs --mode disabled` and `--mode enabled` | Engineering       |
| Pending     | Staging          | SEO sitemap review  | Not applicable           | `DISABLE_INDEXING=true`, `EXPOSE_SITEMAP=true`, pages remain noindex, canonical production URLs are present in `/sitemap.xml`, and staging `robots.txt` does not advertise it | Browser or HTTP inspection of staging metadata, sitemap, and robots          | Engineering/SEO   |
| Pending     | Production       | GA4                 | Analytics granted        | Realtime/DebugView launch event verification                                                                                                                                  | Pending owner public ID                                                      | Owner/Engineering |
| Owner-gated | Production       | Search Console      | Not applicable           | Sitemap submission and URL inspection                                                                                                                                         | Pending owner property access or dated proof                                 | Owner             |
