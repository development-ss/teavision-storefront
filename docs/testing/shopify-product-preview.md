# Native Shopify product preview

## Status

The headless callback is deployed to a Vercel preview. The owner configured the
Liquid bridge's secret in the unpublished Shopify theme copy. Two native
Shopify-generated draft links passed the core flow with that theme explicitly
selected. The unchanged native button still reaches the old production redirect;
the final unmodified-button test remains open. The owner approved a coordinated
production rollout and confirmed the Production signing secret was restored.
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

## Preview setup, 11 September 2026

- Pushed `fix/native-product-preview` at `dbe23b19` to
  `development-ss/teavision-storefront` after explicit approval for that public
  repository. The legacy `franz-ss` remote redirects to this repository.
- Vercel reports the preview ready at
  `https://teavision-storefront-r94egzvgj.vercel.app`. Unauthenticated requests
  redirect to Vercel SSO, so they do not validate callback behavior.
- Duplicated the active redirect theme into theme ID `141887209559`, named
  `Native product preview test - unpublished`. Saved the bridge snippet and
  render line at layout line 92. Set only this copy's storefront hostname to
  the preview deployment above.
- The snippet's `preview_secret` was initially empty at line 8. The owner
  subsequently confirmed private entry and saving before the tests below.
  Never publish this test theme with its preview hostname.
- Shopify's editor reports the inherited layout syntax error and two warnings,
  plus an orphan-snippet warning despite the saved render line. Successful
  saves do not prove Shopify's runtime behavior; these need follow-up during
  the actual Shopify-hosted test.
- The active theme `141627293783` remains untouched. No production deployment
  or native-button acceptance test has been completed.

## Shopify-hosted verification, 11 September 2026

- Clicked the actual top-right Preview button for two saved drafts. Unmodified
  clicks still redirect to production's `/products_preview` 404, as expected
  while the live theme remains unchanged.
- Retained each freshly generated native key privately and selected the
  unpublished theme using `preview_theme_id=141887209559` on Shopify's hosted
  `/products_preview` route. Both opened the matching headless preview through
  the Liquid-generated signature, without manually generating an HMAC.
- Verified the final URL has no query parameters, quantity and purchasing
  controls are disabled, robots metadata is `noindex, nofollow, noarchive`, and
  the rendered draft contains no JSON-LD scripts.
- Verified cross-product access fails. Switching to the second draft replaces
  the session: the first draft then fails while the second remains accessible.
- Exit returned to the preview homepage. Direct access to the former draft
  failed afterwards.
- An invalid native key plus a supplied product ID did not issue a headless
  preview. Shopify rendered its fallback redirect and the destination was 404.
- No product edits, cart mutations, checkout submissions, or orders were made.
  The tested drafts had no media or description, so this live check does not
  validate populated media, descriptions, or multiple variant options.
- The browser policy blocked the rendered-source inspection. Secret absence
  in rendered Shopify HTML remains unverified and needs manual checking; do
  not treat code review or successful signing as that check.
- These results verify the unpublished bridge, not the production deployment.
  Production rollout, an unmodified native-button acceptance test, populated
  draft content checks, and broader redirect regression checks remain open.

## Source-check correction and restored preview

- The owner initially reported a secret match in saved Shopify HTML. The
  supplied line was Shopify's analytics `pageurl` containing `preview_key`.
  The owner confirmed that value differed from `SHOPIFY_PRODUCT_PREVIEW_SECRET`
  and reported zero matches for the actual signing secret. The initial leak
  conclusion was incorrect. Do not confuse Shopify's native preview key with
  the separate signing secret or recommend deployment deletion on that basis.
- Following that incorrect conclusion, the owner temporarily removed preview
  configuration and reported deleting several deployments. The original
  signing secret was subsequently restored. No source evidence established a
  signing-secret leak. The agent's automated rendered-source check remained
  blocked; the zero-match result is owner-reported evidence.
- A replacement preview at `teavision-storefront-hzuv0ntm4.vercel.app` was built
  from `main` at `fb4b108`, not this fix. Its `Invalid preview secret` response
  came from the old handler, not evidence of an incorrect signing secret.
- Verified the replacement `teavision-storefront-358654c95.vercel.app` is Ready
  from `fix/native-product-preview` at `dbe23b1`. The unpublished theme now
  targets that host. A fresh Shopify-generated draft link passed the bridge;
  purchasing was disabled, the final URL had no query, robots were noindex,
  no JSON-LD was present, and exit revoked direct draft access.
- The owner approved production rollout and confirmed restoration of the
  Production signing secret. Keep the live theme's production hostname;
  never publish the unpublished theme with its Vercel preview hostname.
