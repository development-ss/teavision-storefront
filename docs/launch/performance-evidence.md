# Performance Evidence

## Command

`pnpm test:performance -- --start-server --base-url http://localhost:54173`

Generated 2026-09-07T08:21:13.128Z. This is local mobile Lighthouse lab evidence against the fake-provider production lifecycle. Lighthouse cannot replace field Core Web Vitals data; it is used here as repeatable launch regression evidence.

For evidence-only local diagnostics that should not block a readiness script, run `pnpm test:performance -- --allow-metric-failures`.

By default, the probe performs one warmup fetch per route before measured Lighthouse runs to reduce first-request build/image-cache noise. Use `--cold-run` for a zero-warmup diagnostic.

When warmup runs are enabled, route warmup fetches same-origin `/_next/image`, `/_next/static`, `/_next/font`, and `/images/` assets discovered from HTML `src`, `srcset`, and preload `href` attributes. Use `--no-asset-warmup` to keep HTML warmup but skip asset warmup for cold image-transform diagnostics.

## Representative Routes

- `/`
- `/products/test-standard-tea`
- `/collections/all`
- `/cart`
- `/search?q=tea`
- `/account`
- `/pages/privacy-policy`

## Mobile Lighthouse Results

| Route | LCP | CLS | TBT | A11y | Status | Mitigation |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| / | 4475ms | 0.000 | 55ms | 100 | FAIL | LCP 4475ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |
| /products/test-standard-tea | 4172ms | 0.000 | 57ms | 100 | FAIL | LCP 4172ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |
| /collections/all | 3885ms | 0.000 | 60ms | 99 | FAIL | LCP 3885ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |
| /cart | 3855ms | 0.000 | 38ms | 100 | FAIL | LCP 3855ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |
| /search?q=tea | 3630ms | 0.000 | 52ms | 99 | FAIL | LCP 3630ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |
| /account | 3925ms | 0.000 | 45ms | 98 | FAIL | LCP 3925ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |
| /pages/privacy-policy | 3472ms | 0.000 | 51ms | 100 | FAIL | LCP 3472ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. |

## LCP Diagnostics

| Route | LCP Element | LCP Resource | Observed URL |
| --- | --- | --- | --- |
| / | main#main-content > div.bg-paper > section.relative > img.absolute | http://localhost:54173/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimage… | http://localhost:54173/ |
| /products/test-standard-tea | div.bg-paper-2 > div.flex > div.relative > img.size-full | http://localhost:54173/_next/image?url=%2Fimages%2Fhomepage%2Fbulk-wholesa… | http://localhost:54173/products/test-standard-tea |
| /collections/all | div.border > div.flex > div.min-w-0 > p.type-body-sm | Lighthouse did not expose it | http://localhost:54173/collections/all |
| /cart | section.py-8 > div.mx-auto > div.py-16 > p.type-body | Lighthouse did not expose it | http://localhost:54173/cart |
| /search?q=tea | div.border > div.flex > div.min-w-0 > p.type-body-sm | Lighthouse did not expose it | http://localhost:54173/search?q=tea |
| /account | div.border > div.flex > div.min-w-0 > p.type-body-sm | Lighthouse did not expose it | http://localhost:54173/account/login?returnTo=%2Faccount |
| /pages/privacy-policy | div.max-w-prose > article.border > section > p.type-body | Lighthouse did not expose it | http://localhost:54173/pages/privacy-policy |

## Timing Diagnostics

| Route | FCP | LCP | TTFB | Speed Index | Bytes | Primary Cause |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| / | 1367ms | 4475ms | 11ms | 4321ms | 594941 | image-resource |
| /products/test-standard-tea | 1270ms | 4172ms | 5ms | 4467ms | 466980 | image-resource |
| /collections/all | 1222ms | 3885ms | 8ms | 1222ms | 458782 | render-delay |
| /cart | 1212ms | 3855ms | 4ms | 1212ms | 444864 | render-delay |
| /search?q=tea | 1213ms | 3630ms | 3ms | 1400ms | 465447 | render-delay |
| /account | 1369ms | 3925ms | 5ms | 1369ms | 421726 | render-delay |
| /pages/privacy-policy | 1211ms | 3472ms | 8ms | 1211ms | 403498 | render-delay |

## Asset Warmup Diagnostics

| Route | Warmed Assets |
| --- | ---: |
| / | 427 |
| /products/test-standard-tea | 42 |
| /collections/all | 47 |
| /cart | 34 |
| /search?q=tea | 47 |
| /account | 32 |
| /pages/privacy-policy | 31 |

## Layout Shift Diagnostics

No meaningful layout-shift sources were exposed by Lighthouse.

## Launch Blocking Status

Launch-blocking: yes - 7 strict local Lighthouse route(s) have `FAIL` metric rows.

## UX And Accessibility Polish

- duplicate skip link resolved: production smoke asserts exactly one `Skip to main content` link on `/`, verifies it receives first-tab focus, and confirms the `main#main-content` target exists.
- mobile text wrapping checked: production smoke runs `/cart` and a long-query `/search` route at a 375px viewport and asserts document width does not exceed viewport width.
- Remaining non-blocking UX/accessibility polish items: None - no launch-blocking UX/accessibility polish items remain.

## Remediation Notes

- Home hero image uses the launch AVIF with Next 16 `preload`, `sizes="100vw"`, stable fill dimensions, and normal optimized Image delivery; latest local mobile Lighthouse records 4475ms LCP, CLS 0.000, TBT 55ms, accessibility 100, and status FAIL.
- PDP gallery preloads only the first gallery image and keeps normal optimized Image delivery without eager loading or high fetch priority; latest local mobile Lighthouse records 4172ms LCP, CLS 0.000, TBT 57ms, accessibility 100, and status FAIL.
- Collection listing keeps the local `ProductCard` priority API but renders first-visible cards as Next 16 `preload={priority}` using normal optimized Image delivery; latest local mobile Lighthouse records 3885ms LCP, CLS 0.000, TBT 60ms, accessibility 99, and status FAIL.
- Cart LCP is text content, not an image resource, so no cosmetic image edit was applied; latest local mobile Lighthouse records 3855ms LCP, CLS 0.000, TBT 38ms, accessibility 100, and status FAIL.
- Search LCP is trust-strip text content with no LCP resource, so the local miss is documented as render timing rather than image loading; latest local mobile Lighthouse records 3630ms LCP, CLS 0.000, TBT 52ms, accessibility 99, and status FAIL.
- Account route reserves stable account geometry in the account shell, login bridge, page wrapper, and loading fallback; remaining CLS is on the observed `/account/login?returnTo=%2Faccount` bridge and Lighthouse does not expose a shifting node; latest local mobile Lighthouse records 3925ms LCP, CLS 0.000, TBT 45ms, accessibility 98, and status FAIL.
- Privacy policy LCP is policy copy text with no LCP resource, so no arbitrary image edit was applied; latest local mobile Lighthouse records 3472ms LCP, CLS 0.000, TBT 51ms, accessibility 100, and status FAIL.
- The fake Shopify product includes a local rich-media image so `/products/test-standard-tea` exercises the PDP gallery rather than an empty placeholder.
- Remaining LCP misses are recorded as `FAIL` with mitigation instead of being silently passed. Field/staging Core Web Vitals should be used before launch sign-off because this command is local lab evidence.

## Remaining Mitigations

- `/` FAIL: LCP 4475ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `main#main-content > div.bg-paper > section.relative > img.absolute`; resource `http://localhost:54173/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimage…`; observed URL `http://localhost:54173/`.
- `/products/test-standard-tea` FAIL: LCP 4172ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `div.bg-paper-2 > div.flex > div.relative > img.size-full`; resource `http://localhost:54173/_next/image?url=%2Fimages%2Fhomepage%2Fbulk-wholesa…`; observed URL `http://localhost:54173/products/test-standard-tea`.
- `/collections/all` FAIL: LCP 3885ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `div.border > div.flex > div.min-w-0 > p.type-body-sm`; resource `Lighthouse did not expose it`; observed URL `http://localhost:54173/collections/all`.
- `/cart` FAIL: LCP 3855ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `section.py-8 > div.mx-auto > div.py-16 > p.type-body`; resource `Lighthouse did not expose it`; observed URL `http://localhost:54173/cart`.
- `/search?q=tea` FAIL: LCP 3630ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `div.border > div.flex > div.min-w-0 > p.type-body-sm`; resource `Lighthouse did not expose it`; observed URL `http://localhost:54173/search?q=tea`.
- `/account` FAIL: LCP 3925ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `div.border > div.flex > div.min-w-0 > p.type-body-sm`; resource `Lighthouse did not expose it`; observed URL `http://localhost:54173/account/login?returnTo=%2Faccount`.
- `/pages/privacy-policy` FAIL: LCP 3472ms exceeds 2500ms. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation. LCP diagnostic: element `div.max-w-prose > article.border > section > p.type-body`; resource `Lighthouse did not expose it`; observed URL `http://localhost:54173/pages/privacy-policy`.
