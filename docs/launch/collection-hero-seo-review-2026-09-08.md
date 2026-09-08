# Collection consistency and SEO review

Date: 2026-09-08. Status: collection implementation complete locally; validation and authoring notes below. The investigation sections retain the original production observations for comparison.

## Ticket and scope

[TKT-02519](https://ai.switchsupply.com/app/tickets/TKT-02519) calls for background-only banner artwork and real HTML H1s integrated into the page design. Its July UAT description also mentions missing product H1s and the staging deployment. This review checks the current public production site and the current local collection implementation, rather than assuming that historical observation still applies everywhere.

Evidence:

- Read the authenticated ticket description.
- Crawled 146 distinct base collection URLs linked from the public wholesale collection page, including navigation/footer links. This is a linked-page inventory, not a complete Shopify or sitemap reconciliation.
- 145 returned HTTP 200; all 145 contained exactly one H1 in the returned HTML and a matching base-page canonical. One linked URL, `/collections/scullcap`, returned 404.
- Inspected rendered DOM on all 16 collections linked from `/collections`.
- Visually compared desktop wholesale tea, herbs and spices, Australian native ingredients, green tea, and bulk tea bags. Checked wholesale tea and bulk tea bags at a 390 x 844 viewport, then restored the viewport.
- Verified a category-filter page after its results finished rendering.
- Full base-page results: [collection-hero-seo-inventory-2026-09-08.csv](./collection-hero-seo-inventory-2026-09-08.csv).

These checks establish markup and rendering behavior. They do not measure rankings, Search Console indexation, all image quality, or Core Web Vitals.

## Current rendering matrix

| Variant               |   Successful base pages | Exact trigger                                                                                                                        | Result                                                                                                                            |
| --------------------- | ----------------------: | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Rich hero             |                       1 | `descriptionHtml` contains a `section.bulk-header` with a nonempty H1, introductory paragraph, image, and at least three valid links | Centered bold title, intro, factory image, two actions plus a third action and optional MOQ footnote. No visual breadcrumb.       |
| Banner                |                      13 | Rich parser fails/does not match, and the first `<img>` in `descriptionHtml` has a `src`                                             | Standalone image, followed by breadcrumb containing the only H1. H1 uses uppercase 11px mono type. Hero description is discarded. |
| Default               |                     131 | Neither condition above matches                                                                                                      | Left-aligned large H1, eyebrow, intro, breadcrumb, optional background photo and dark scrim; green band if image is unavailable.  |
| Category-filter route | Outside base-page count | `/collections/[handle]/[category]`                                                                                                   | Results and loading skeleton only; the route never renders `HeroContent`. No H1 or breadcrumb after load in the checked example.  |

The rich hero is `/collections/bulk-tea-bags`.

The 13 banner pages are:

- `/collections/australian-certified-organic-tea`
- `/collections/australian-native-ingredients`
- `/collections/cafe-range`
- `/collections/custom-tea-blends`
- `/collections/dessert-cocktail-inspired-blends`
- `/collections/herbs-and-spices`
- `/collections/private-label-packaging`
- `/collections/sample-boxes`
- `/collections/speciality-tea`
- `/collections/superfood-extract-powders-proteins-supplements`
- `/collections/tea-masters-selection-worlds-best-teas`
- `/collections/wellness-functional-tea`
- `/collections/wholesale-bulk-tea`

Among the 16 directory collections: nine banner, six default, one rich.

## Why the rendering differs

- `src/app/(storefront)/collections/[handle]/_components/hero-content.tsx:25` chooses the rich layout from HTML shape, then passes the first description image as `bannerImage` to `Hero`.
- `src/app/(storefront)/collections/[handle]/_components/hero.tsx:25` takes the banner branch whenever that image exists. An unrelated image inserted into descriptive copy can therefore change the whole page layout.
- `src/app/(storefront)/collections/[handle]/_lib/page-helpers.ts:229` extracts any first image. Missing dimensions are inferred from the filename or replaced with 1600 x 577 defaults. Different intrinsic image ratios still produce visibly different banner heights.
- `src/app/(storefront)/collections/[handle]/_lib/page-helpers.ts:787` resolves the general hero/OG image as legacy `#kk-collection-banner` CSS background, then description image, then collection featured image. Banner layout instead directly uses the description image, so visible and OG imagery can diverge when both legacy and inline imagery exist.
- The rich parser requires three links. Removing one link can silently switch the page to the banner layout. Changing a CTA should not change hero design.
- `src/app/(storefront)/collections/[handle]/_components/story.tsx:14` hides the entire lower description whenever the rich parser succeeds. Additional content outside the rich hero section can consequently be lost.
- Base pages render their hero outside the query-dependent results Suspense boundary. Sort/filter/page query parameters do not select a different base hero. The separate category route omits the hero entirely.
- Current tests explicitly expect the small breadcrumb H1 and rich-hero story suppression. Those assertions must change with the intended behavior, not simply be treated as proof of SEO quality.

## Confirmed issues

1. **H1 presence does not establish a useful main heading.** The banner H1 is only 11px. Wholesale Tea, Herbs & Spices, and Australian Native Ingredients visually place their large title, subtitle and benefit text inside raster artwork. On mobile the entire poster shrinks, including its text. Google recommends a clearly dominant main title, with the first visible H1 as one way to communicate that hierarchy. [Google title-link guidance](https://developers.google.com/search/docs/appearance/title-link).
2. **Category-filter pages have no H1.** `/collections/wholesale-bulk-tea/categories_all-organic-tea` has 41 products and a parent canonical after loading, but no H1/breadcrumb. The code confirms this is a route-level omission, not merely an unfinished loading state.
3. **Mobile overflow in the tea-bag hero.** At viewport width 390px, the long white-label CTA is approximately 611px wide, extending from x=-118 to x=493. Its `whitespace-nowrap` styling creates document overflow and clipped text.
4. **Content and heading hierarchy are inconsistent.** Banner pages discard the top intro. Rich pages discard the lower story. Imported H1 and H2 tags are both flattened to H3 by `normalizeHtml`, while the disclosure title is a span. Preserve a logical section outline rather than only preventing duplicate H1s.
5. **Missing metadata fallback.** Five successful pages emitted no description meta tag: `/all`, `/naturopath-certificate`, `/organic-black-tea`, `/sale`, `/test-green-tea`, all under `/collections`. `collection.description` can be an empty string; `??` does not reach the generic fallback in that case. Titles can have the same blank-string weakness.
6. **Weak or duplicated search text.** Australian Native Ingredients and Tea Masters have meta descriptions beginning with `Read More About...`; `/all` has title/H1 `All`; White Tea and Wholesale White Tea share the same title. Hero intro content currently also inherits SEO description precedence from the Shopify mapper, tying visible body copy to search-snippet copy.
7. **Collection hygiene follow-ups.** `/collections/test-green-tea` is publicly linked, returns 200, and does not emit a robots noindex meta tag in the response. `/collections/scullcap` is linked but returns 404. Confirm the intended destination/indexation policy rather than inventing a redirect or deleting a collection.
8. **Pagination canonical policy needs review.** Both collection metadata implementations deliberately canonicalize paginated URLs to the base collection. Google recommends a self-canonical for each distinct page of a sequence. Treat pagination separately from sort/filter variants and reconcile the existing documented D-03/D-27 decisions. [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).

## Recommended implementation approach

### 1. One hero structure, structured content

Extend the existing collection hero into the shared presentation for every collection, including category views. Standardize container width, breadcrumb position, heading scale, top/bottom spacing and image treatment. Keep category-specific imagery and useful copy.

Recommended visual direction: warm background, left-aligned prominent HTML H1 and short intro, text-free ingredient photography with a safe composition for the text. At mobile sizes, put text in a readable flow above the image when an overlay crop would compromise readability. Keep the product toolbar close enough that the collection still feels like a catalogue.

The hero owns one H1, independently of image/description/CTA availability. Breadcrumb current-page text is a span. Long titles wrap without shrinking into metadata typography. Category views show collection context and the selected category using the same hierarchy, with the heading inside a valid Next.js Suspense boundary.

Use a small normalized content contract: heading, intro, optional image with actual dimensions/focal treatment, optional actions, optional footnote, and remaining body HTML. Keep Shopify as the source. Prefer explicit collection fields/metafields for deliberate overrides and image assignment, with a documented legacy adapter while content migrates. Avoid hardcoded handle-based layout branches.

Legacy HTML parsing may recover content, but must not control the presentation. An extra body image, missing third CTA, or empty description must never change the hero template. Preserve content outside extracted hero blocks.

### 2. Targeted imagery work

Confirmed text-free replacement priorities: Wholesale Tea, Herbs & Spices, Australian Native Ingredients. Review the remaining ten banner assets before deciding whether they need regeneration, a text-free source export, or simply integration into the common layout. Do not assume every banner-mode image contains text.

Reuse suitable existing background photography, including the observed green-tea image, and retain the genuine tea-bag factory photo. Prefer original layered/source exports with typography removed when available. Regenerate only assets whose usable text-free originals cannot be recovered or whose crop/resolution is unsuitable.

For generated replacements: consistent warm light and ingredient-focused composition, no baked heading/subtitle/benefit strip/CTA, no invented certification seals, and a text-safe composition. Use real product/packaging references where those are depicted. First prove one Wholesale Tea hero at desktop/mobile, then use that composition brief for the remaining replacements.

Measure actual output dimensions; do not rely on requested generation dimensions. Use responsive image sizes, accurate intrinsic dimensions/aspect ratio and appropriate eager/high-priority loading for the real LCP candidate. Decorative backdrop imagery gets empty alt; meaningful content photography gets a useful description. Resolve visible and OG images deliberately from the same content model.

### 3. SEO and content normalization

- One prominent server-rendered H1 per successful collection/category page, with a descriptive collection-specific heading. Proposed `/all` heading: `Wholesale tea, herbs & spices`.
- Clean unique title/description fallbacks that trim strings and skip empty values. Preserve meaningful authored SEO copy; remove disclosure/UI text from generated descriptions. Keep hero intro and search snippet as distinct content roles.
- Use H2 for real body sections and H3 for subsections; preserve useful long-form content and links below the grid. Native disclosure content can remain server-rendered without claiming that its collapsed state makes it uncrawlable.
- Keep visual breadcrumbs and BreadcrumbList consistent. Verify CollectionPage/ItemList reflect the actual collection and displayed products, including category canonical decisions.
- Revisit pagination, sort/filter indexation, test content and broken collection links as explicit SEO policy/data fixes alongside the hero work.
- The ticket's broader product-page H1 issue needs a separate current-product audit before closing the entire ticket. The current local product page already has an H1 at `src/app/(storefront)/products/[handle]/page.tsx:310`; this is not proof that every deployed product is compliant.

### 4. Verification and rollout

Start with representative cases: Wholesale Tea (banner), Green Tea (legacy background), Bulk Tea Bags (rich content/actions), All (minimal content), and the organic category-filter route. Then apply the content adapter and shared template across the inventory.

Acceptance checks:

- Exactly one visible, meaningful H1 outside navigation in server output and hydrated DOM.
- Same hierarchy and width/spacing system with long titles, no image, no intro, partial rich markup and zero/one/three CTAs.
- No baked headline text in replacement artwork; no clipped heading/CTA or horizontal overflow at 390px and desktop widths.
- No dropped trailing rich-description content; logical H2/H3 structure and valid sanitized links.
- Heading survives sorting, filtering, pagination, direct category navigation, empty results and loading transitions; unknown handles/categories retain proper not-found behavior.
- Unique useful metadata, canonical/indexation behavior agreed for each URL type, schema emitted once, crawlable links and real products in the base-page shell.
- Extend existing helper/render tests and replace tests that lock in breadcrumb H1/story suppression. Use Storybook for reusable hero states; preserve existing crawlable-HTML checks and run lint/typecheck/build for implementation changes. No real checkout testing is involved.
- Re-crawl the inventory after rollout, visually inspect representative mobile/desktop pages and verify the intended image URLs/cache refresh. Audit screenshots are qualitative evidence, not a performance benchmark.

## Proposed order

1. Settle the shared hero composition and content contract using one representative collection.
2. Implement resilient content extraction, consistent H1/breadcrumb rendering and responsive actions.
3. Produce and integrate text-free assets where required, then migrate the 13 banner-mode collections.
4. Normalize metadata/body headings and address the agreed SEO policy/data follow-ups.
5. Verify representative states, then re-crawl the whole linked collection inventory.

## Implemented behavior

All successful base and category collection pages use `src/components/collection/hero/hero.tsx`: breadcrumb navigation above a warm split panel, a prominent HTML H1 and introductory copy, optional photography, and wrapping actions beneath it. On mobile, text precedes the image. Missing images, dimensions, paragraphs or CTA links no longer select another template. Loading placeholders reserve the same general composition; the base route retains its real product-grid streaming fallback.

`src/lib/shopify/collection-content.ts` adapts old Shopify HTML into content fields. A marked rich section can supply zero, one, two or three actions. Body links and trailing story content survive extraction, while script/style content and obsolete disclosure controls are removed. Imported H1s become H2s; stories starting below H2 shift their entire hierarchy together. Unknown image dimensions remain unknown instead of receiving invented sizes. The responsive image container reserves its own height.

Search metadata is independent of visible body copy. Empty, title-only and disclosure-label snippets receive useful collection-specific fallbacks. Exact matches for three audited copied descriptions (Ginkgo Biloba, Hibiscus Flowers and Wholesale White Tea) are replaced; future Shopify edits take precedence automatically. Wholesale White Tea gets a distinct search title, and `/all` gets the descriptive H1 “Wholesale tea, herbs & spices”. Hero and Open Graph image selection share the same adapter.

Indexation decisions implemented for this change:

| URL state                               | Canonical             | Indexation                                                                 |
| --------------------------------------- | --------------------- | -------------------------------------------------------------------------- |
| Public collection, first page           | Base collection URL   | Eligible when site indexing is enabled                                     |
| Unfiltered page 2 and later             | Its own `?page=N` URL | Eligible; supersedes the previous base-only pagination policy              |
| Sort, query, filter or category variant | Base collection URL   | `noindex, follow`                                                          |
| `frontpage` and `test-*` collections    | Base collection URL   | `noindex, follow`; omitted from menus, sidebars, sitemap and URL inventory |
| Preview environment                     | Same canonical policy | Existing site-wide `noindex, nofollow, noarchive` wins                     |

CollectionPage/ItemList schema now uses displayed products and pagination positions, and breadcrumbs include category context. `/collections/scullcap` permanently redirects to `/collections/skullcap`; the destination was verified against Shopify and the footer link corrected.

## Shopify authoring and migration

The collection query supports these optional collection metafields. When creating their definitions in Shopify, make them readable by the Storefront API:

| Field                 | Shopify type                        | Purpose                                                       |
| --------------------- | ----------------------------------- | ------------------------------------------------------------- |
| `custom.hero_heading` | Single-line text                    | Deliberate visible H1 override                                |
| `custom.hero_intro`   | Multi-line plain text               | Short visible introduction, separate from SEO description     |
| `custom.hero_image`   | File reference restricted to images | Preferred text-free hero/OG image, with useful image alt text |

These definitions and values were not written to Shopify during implementation. Existing collections work through the migration adapter without them. Standard Shopify SEO title/description fields remain the search-copy source. Prefer these structured fields for future authoring, then remove obsolete banner markup from description HTML as content is migrated. An explicit hero image always takes precedence over the legacy asset mapping; unrecognized body images remain in the story rather than becoming a layout trigger.

`src/lib/shopify/collection-images.ts` records the audited asset migration. Seven poster images contained baked headings. Wholesale Tea, Herbs & Spices and Australian Native Ingredients received new text-free artwork. Wellness, Speciality, Organic and Tea Masters reuse their existing collection photography. Three low-resolution service banners also fall back to their higher-resolution collection photography. Cafe, mushroom, sample and the genuine tea-bag factory photos were retained with measured dimensions.

The three revised assets closely follow the original banner photography, retaining the branded pouches, props, foliage and ingredient arrangements. They remove overlaid marketing text and graphics; branding printed on the original pouches is retained. They are reference-guided edits, not pixel-identical crops.

| Asset                                                                  | Actual dimensions |  Encoded size |
| ---------------------------------------------------------------------- | ----------------- | ------------: |
| `public/images/collections/wholesale-tea-hero-v2.webp`                 | 1536 × 1024       | 132,506 bytes |
| `public/images/collections/herbs-and-spices-hero-v2.webp`              | 1536 × 1024       | 254,164 bytes |
| `public/images/collections/australian-native-ingredients-hero-v2.webp` | 1536 × 1024       | 286,616 bytes |

Revision brief: edit the original Shopify banners directly, preserve their photographic subjects, arrangement, packaging and colours, remove marketing overlays, and reframe for the shared hero. Built-in ImageGen was used. Full prompts and source references are recorded in [collection-hero-image-prompts-2026-09-08.md](./collection-hero-image-prompts-2026-09-08.md). The outputs were visually inspected and encoded with Sharp at WebP quality 82 without resizing. Versioned filenames refresh the image URLs. Each remains below the 350 KB image budget.

## Validation record

- Code review iterations covered layout conditions, partial rich content, retained story links, heading hierarchy, actual image dimensions, metadata fallback quality, preview indexation overrides and future Shopify edits.
- Full unit suite: 556 tests passed, including the separation of body/SEO copy and explicit metafield mapping.
- Full integration suite: 96 tests passed.
- Full Storybook suite: 414 interaction tests passed across 117 story files, including shared hero variants and the wrapping button size.
- Full browser suites: 56 tests passed in production mode and 56 passed in development mode. Collection coverage includes default, poster, rich, empty and explicit-field fixtures; 320px action wrapping; retained body content; pagination schema/canonical; category H1; filtered indexation; the spelling redirect; and not-found behavior for unknown handles/categories.
- Component contracts: 60 tests passed. TypeScript and lint passed. Shopify GraphQL code generation succeeded; the directly imported client preset preserves runtime enums and typed scalars. Generated files remain reproducible and are checked by TypeScript rather than manually edited to satisfy lint.
- A real-Shopify production build passed. Production browser tests separately build against fake Shopify/account services; no real hosted checkout, payment or order creation was exercised.
- A local real-Shopify crawl checked all 145 successful collection handles for HTTP 200, one shared hero, one H1, title, description and canonical. All passed, with no duplicate titles or descriptions. The final results are recorded in [collection-hero-seo-after-2026-09-08.csv](./collection-hero-seo-after-2026-09-08.csv); the original 146-link production inventory remains the before snapshot.
- Manual browser checks covered the desktop Wholesale Tea composition, real Bulk Tea Bags at 390px (all three actions fit, including the long white-label link), and the organic category route with its H1, breadcrumb and parent canonical. No horizontal overflow was observed in these checked states. The browser viewport was restored afterward.

Some isolated Storybook stories emit existing Next Image advisory warnings about product-image quality configuration and below-the-fold images appearing as LCP when rendered alone. Development browser tests also report existing certification-icon sizing advisories and Next.js cache-bypass messages. Those are not failures of the shared hero or measurements of production performance. Fake-service tests deliberately exercise unavailable-review/error logging.

The collection changes and generated assets are local and have not been deployed. Recheck the production inventory after deployment and cache refresh. No ranking or Core Web Vitals improvement is claimed from markup checks alone. The ticket's historical product-page H1 report remains a separate current-product audit before closing the whole ticket.
