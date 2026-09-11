# Native Shopify product preview

## Status

The headless callback and Liquid bridge are prepared locally. Installation and
verification through the real Shopify Admin Preview button are still required.
Do not treat passing callback tests as completion of the Shopify-side integration.

## Why the native button previously failed

The active `hydrogen-redirect-theme-main` theme (ID `141627293783`, inspected
11 September 2026) forwards the Shopify path and query to the headless host.
The native button opens `/products_preview?preview_key=...`, which Next.js does
not resolve. The Admin API's `onlineStorePreviewUrl` key did not match the
native button's key in a read-only test, so catalog scanning is not a reliable fix.

The bridge is our integration using Shopify's documented
[product template context](https://shopify.dev/docs/storefronts/themes/architecture/templates/product/overview),
[request object](https://shopify.dev/docs/api/liquid/objects/request), and
[hmac_sha256 filter](https://shopify.dev/docs/api/liquid/filters/hmac_sha256).
It extends the existing
[Hydrogen redirect theme](https://github.com/Shopify/hydrogen-redirect-theme/blob/main/layout/theme.liquid).
It does not replace the native button with a More actions extension.

## Installation and rollout

1. Obtain approval for Shopify theme changes and deployment. Back up the current
   layout and duplicate the redirect theme for testing. Do not replace the whole
   theme or change checkout, account, discount, or normal storefront redirects.
2. In the duplicate theme, add `snippets/headless-product-preview.liquid` from
   this repository. Privately set its `preview_secret` to the same value as
   `SHOPIFY_PRODUCT_PREVIEW_SECRET` on the target deployment. The checked-in
   value is deliberately empty. Never commit the populated snippet, print it,
   put the secret in theme settings, or expose it in browser JavaScript.
   Theme-code editors and apps with theme-source access can read this secret;
   approve that trust boundary before installation.
3. In `layout/theme.liquid`, inside the existing redirect script, insert this
   line immediately before `window.storefrontRedirectUrl = redirectUrl;`:

   ```liquid
   {% render 'headless-product-preview', product: product, storefront_hostname: settings.storefront_hostname %}
   ```

   Keep the existing `window.location.replace(redirectUrl)` and fallback link.
   The snippet only changes the destination when Shopify renders a product on
   `/products_preview`, outside design mode. All other redirects are untouched.

4. Deploy the callback changes to a Vercel preview, point only the duplicate
   theme's storefront host at that preview, and validate a Shopify-hosted draft
   preview with this theme. Do not publish the duplicate merely to test it.
5. After acceptance, deploy the callback to production and install the same
   snippet plus render line in the active theme. This is a coordinated rollout:
   the callback no longer accepts old shared-secret URLs. Check the production
   signing secret and working Admin token before rollout.
6. Click the actual top-right Preview button on a saved draft in Shopify Admin.
   The final page must be the correct headless draft, not a theme rendering,
   alternate Admin action, manual signed URL, or 404.

## Authentication and cleanup

Shopify resolves the draft using its own preview key. Liquid signs
`shopify-theme-preview:v1:<product-id>:<unix-seconds>` with HMAC-SHA256, and sends
`productId`, `timestamp`, and the hex `signature` to `/api/shopify-preview`.
The secret and Shopify preview key are not forwarded by the bridge.
The callback accepts a signature for five minutes, with 30 seconds of future
clock tolerance, then issues the existing product-scoped 30-minute HTTP-only
cookie. Links can be replayed during those five minutes; they are not one-time
tokens. Exit clears the cookie, not a still-valid signed link.

The old `?secret=` authentication is removed. Keep the shared PDP, Admin mapper,
signed cookie, exit route, and webhook invalidation, as the native flow reuses
them. No Admin extension, catalog scan, or extra runtime dependency is needed.

## Acceptance checks

- Actual top-right Preview opens the correct saved draft, including images,
  options, prices, and description. Unsaved edits are not promised.
- Previewing a second draft changes the product-scoped session correctly.
- Preview purchase and quantity controls stay disabled; no cart is created.
- The final URL contains neither preview key, signing secret, nor signature.
- Preview HTML is noindex/nofollow and contains no product/breadcrumb JSON-LD.
- Exit returns home; direct access to the draft is rejected afterwards.
- Tampered/expired signatures, duplicate parameters, and old shared-secret
  links fail before Admin product reads or session creation.
- Invalid native preview keys do not cause Shopify to sign an arbitrary draft.
- Shopify's preview output is fresh enough for the five-minute signature window.
- Normal product, collection, account, discount, and checkout redirects retain
  their existing behavior. Do not submit orders or test payment without approval.
- Inspect rendered Shopify HTML to confirm the signing secret never appears.

Until the Shopify-hosted checks above pass, the native flow remains unverified.
If the bridge fails, remove its render line to restore the original redirect
behavior. This restores the earlier native-preview limitation, not a working
headless preview. Do not alter ordinary storefront routes to mask failures.

## Local verification, 11 September 2026

- Lint and touched-file formatting passed.
- Unit suite: 589 passed. Integration suite: 109 passed, including both preview
  routes after fixing their previously non-matching test selector.
- Production build and production-mode browser suite: 58 passed with fake
  services, including signed entry, product isolation, disabled purchasing,
  indexing protection, and exit. These do not exercise Shopify Liquid.
- Existing test-environment color warnings and unavailable-review-provider
  warnings remain; no checkout, payment, or live provider mutations were tested.
- No Shopify theme installation or production deployment was performed.
