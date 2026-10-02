# SEO post-migration review response

Review received 28 September 2026 from the SEO team (live site
https://www.teavision.com.au). Code changes made and verified 2 October 2026.
Ticket: TKT-03506 (subtasks TKT-03507 to TKT-03513).

## Item-by-item status

| #   | Reported issue                                                      | Resolution                                                                                                                                                                                                                                                                                                                                                                                                        | Proof                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Sitemap: 508 URLs, correct host, referenced by robots.txt           | Already correct. No change.                                                                                                                                                                                                                                                                                                                                                                                       | Reviewer confirmation; `src/app/sitemap.ts`, `src/app/robots.ts` unchanged                                                                                                                 |
| 1   | Search Console sitemap submission not done                          | Owner action in Search Console (see below). Verification tags for both pre-migration GSC accounts are now on every page.                                                                                                                                                                                                                                                                                          | `tests/e2e/seo-migration.spec.ts` (verification tags)                                                                                                                                      |
| 2   | Collection title, description and canonical streamed after `<head>` | `htmlLimitedBots: /.*/` in `next.config.ts` disables streaming metadata, so every response carries metadata in the initial `<head>`. Pagination canonicals and sort/filter `noindex` are unchanged.                                                                                                                                                                                                               | Live 2 Oct: `/collections/matcha-tea` and `?page=2` had no title, description or canonical in `<head>`. E2E: 4 collection checks pass with the fix and fail without it (negative control). |
| 3   | `/blogs` returns 404                                                | Single 301 to `/blog`                                                                                                                                                                                                                                                                                                                                                                                             | E2E redirect check, launch route matrix                                                                                                                                                    |
| 3   | `/blogs/teavision-blogs` 308 to `/blog`                             | Unchanged (reviewer marked correct)                                                                                                                                                                                                                                                                                                                                                                               | E2E check confirms it is untouched                                                                                                                                                         |
| 4   | Tracking codes not migrated                                         | GSC meta tags added. GTM `GTM-KF2Z76H` is the default on Vercel production builds; it loads after analytics consent. Production previously had no GA4 or GTM ID set.                                                                                                                                                                                                                                              | Unit tests for the ID resolver and CSP; production-like build: no GTM request before consent, `gtm.js?id=GTM-KF2Z76H` after consent, CSP allows the host                                   |
| 4   | Schema codes not migrated                                           | Organization (full brief) on every storefront page; WebSite and FAQPage (from the visible homepage FAQ) on the homepage; Product with sku, brand, image list, offer condition, seller and real review ratings; Service list on `/pages/services` (the four service pages already had Service); BlogPosting with publisher logo, absolute URL and a company author instead of the invented "Teavision Team" person | Unit tests for Product JSON-LD; E2E schema checks                                                                                                                                          |
| 4   | 12 legacy URLs return 404                                           | Single 301 each, see table below                                                                                                                                                                                                                                                                                                                                                                                  | E2E redirect checks (12)                                                                                                                                                                   |

## Legacy URL decisions

Checked on 2 October 2026 against the live Shopify Storefront catalogue. None
of the old handles is published. Every destination returned 200, had no
`noindex` and self-canonicalised on the live site.

| Old URL                                     | 301 destination                            | Reason                                                                                     |
| ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `/pages/tea-packaging`                      | `/pages/private-label-packing`             | No Shopify page with this handle; private label packing is the live packaging service page |
| `/products/organic-moringa-leaf`            | `/collections/moringa-leaves`              | No moringa product is published; the moringa collection is the closest live page           |
| `/products/organic-dark-roast-oolong`       | `/collections/oolong-tea-wholesale`        | No dark roast oolong is published; oolong collection                                       |
| `/products/siberian-ginseng`                | `/products/siberian-ginseng-tea`           | Same product (Siberian Ginseng Root)                                                       |
| `/products/japan-matcha-conventional`       | `/collections/japanese-matcha`             | No conventional Japanese matcha; Japanese matcha collection                                |
| `/products/organic-marshmallow-root`        | `/products/marshmallow-root`               | Only marshmallow root product (Marshmallow Root Cut)                                       |
| `/products/raspberry-leaf-organic`          | `/products/organic-raspberry-leaf`         | Same product, handle reordered                                                             |
| `/products/matcha-green-tea`                | `/collections/matcha-tea`                  | Generic matcha listing; several matcha products are live                                   |
| `/products/conventional-alfalfa-leaves-cut` | `/products/oganic-alfalfa-leaves`          | Only alfalfa product (Organic Alfalfa Leaves)                                              |
| `/products/black-ceylon-tea-op1`            | `/products/black-ceylon-tea-orangepekoe`   | OP1 is the Orange Pekoe grade                                                              |
| `/products/organic-ceylon-cinnamon-powder`  | `/products/organic-cinnamon-powder-ceylon` | Same product, handle reordered                                                             |
| `/products/dandelion-root-organic`          | `/products/organic-dandelion-root`         | Same product, handle reordered                                                             |

Source of truth: `src/lib/seo/legacy-redirects.ts`. Register rows:
`docs/launch/seo-url-parity-register.md`.

## Verification run (2 October 2026)

- `pnpm typecheck`, `pnpm lint`: pass
- `pnpm test:unit`: 108 files, 597 tests pass
- `pnpm test:integration`: 16 files, 109 tests pass
- `pnpm test:contracts`: 60 pass
- `node --test scripts/seo/*.test.mjs`: 18 pass (includes the URL parity audit)
- Production build with fake Shopify, full Playwright suite: 80 pass, including
  the 25 new checks in `tests/e2e/seo-migration.spec.ts`
- Negative control: same build without `htmlLimitedBots` fails the 4 collection
  head checks and the collection GSC tag check

The sandbox had no Sanity read token, so blog pages were not rendered in that
build. Blog article schema changes are covered by type checks and review.

## Trade-off

With streaming metadata disabled, pages are no longer served from the
prerendered static shell. Every request waits for metadata before the first
byte. Locally this moved collection TTFB from about 5 ms to about 35 ms. Watch
Vercel function usage and TTFB after release.

## After deploy (owner actions)

1. Re-run the reviewer checks on the live site, for example:
   `node scripts/seo/probe-launch-seo.mjs --mode enabled` with
   `SEO_PROBE_BASE_URL=https://www.teavision.com.au`, and
   `curl -sI https://www.teavision.com.au/blogs` (expect 301).
2. In Search Console, open the `https://www.teavision.com.au` property, submit
   `https://www.teavision.com.au/sitemap.xml`, and record the status.
3. In GTM preview or GA4 Realtime, accept cookies on the live site and confirm
   `GTM-KF2Z76H` fires.
4. Validate a product, the homepage and `/pages/services` in Google's Rich
   Results Test.
