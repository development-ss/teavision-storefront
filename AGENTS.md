# Teavision agent guide

## Live project context

Teavision is already live at https://www.teavision.com.au. Work here maintains and improves an operating storefront with real customers, accounts, enquiries, and Shopify checkout. Do not treat this repository as an unlaunched prototype or restart completed launch phases.

- The owner's live-status confirmation and production evidence are recorded as of 11 September 2026. The 7 September verification records are in `docs/launch/operations-runbook.md` and `docs/testing/cart-checkout-uat.md`.
- Dated implementation plans, launch checklists, and pending rows are historical context. Check current code, configuration, and the latest relevant evidence before treating them as unfinished work.
- Local code and a passing build do not prove what is deployed. When investigating production, identify the deployed revision and environment before attributing behavior to this checkout.

## Working agreement

- Complete the requested work through implementation and appropriate verification. Make routine, reversible decisions within scope without asking for confirmation. Ask only when missing information materially affects the outcome or an action exceeds existing authorization.
- Preserve authorization and decisions from the current conversation. A historical approval or test waiver is evidence for that recorded scope, not blanket permission for a new live transaction.
- Start with `git status --short`, inspect the relevant implementation, and preserve unrelated changes. Prefer the smallest coherent fix; avoid unrelated refactors, dependency upgrades, and repo-wide formatting.
- Treat this file as the project instruction source. Use `docs/conventions.md` for the folder map and details; if it conflicts with an explicit rule here, follow this file. Older plans and skill suggestions do not override the user's current instructions.
- Keep responses concise: state the result, relevant verification, and any concrete unresolved issue. Use straight apostrophes (`'`) and no em dashes in authored prose. The generated Next.js block below is preserved verbatim.

## Production boundaries

- Default development and automated testing to local or preview environments. Local servers can still use live providers through environment variables; localhost alone does not make submissions or mutations safe.
- A code-change request authorizes local edits and checks. Deployments, merges or pushes that trigger production, live provider writes, and production configuration changes need authorization covering that action. Reuse authorization already given; prepare and verify the change before asking if it is missing.
- Preserve existing URLs, redirects, canonicals, indexing, pricing, cart identity, account sessions, and checkout handoff unless the requested change requires otherwise. Do not copy preview/test defaults into production.
- Use fake services for automated cart, account, and checkout tests. Real hosted checkout, shipping, tax, payment, order creation, or success-redirect tests require store-owner approval covering the test scope. Follow `docs/testing/cart-checkout-uat.md`: use a configured dev store unless the owner approves a specific current-store exception.
- On 7 September, approved live checkout inspection passed; further shipping, tax, payment, order-completion, and success-state testing was waived and remains unverified. Do not reopen those tests as a prerequisite for unrelated work, claim they passed, or interpret the waiver as purchase authorization.
- Keep credentials, customer data, session tokens, cart IDs, checkout URLs, and submitted form bodies out of logs and reports. Never expose private keys through `NEXT_PUBLIC_*`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Architecture and source map

Next.js 16 App Router, React 19, Tailwind CSS 4, and TypeScript. Check `package.json` and the installed packages for exact versions. Cache Components are enabled in `next.config.ts`.

- Storefront routes: `src/app/(storefront)/`, including products, collections, search, cart, account, blogs, and enquiry pages. API handlers: `src/app/api/`.
- Commerce: Server Components call `src/lib/shopify/operations/*`, which use `shopifyFetch()` in `src/lib/shopify/client.ts`. Shopify supplies catalog, pricing, carts, and checkout; reuse the existing Admin API helpers for features that require them.
- Shopify product preview: `/api/shopify-preview?secret=<configured-secret>&productId=<numeric-id>` validates the server-only `SHOPIFY_PRODUCT_PREVIEW_SECRET`, loads the product through `src/lib/shopify/admin-client.ts`, and sets the signed `teavision_product_preview` cookie before redirecting to `/preview/products/<numeric-id>`. The standalone preview route reads only that short-lived cookie, uses the Admin product mapper in `src/lib/shopify/operations/product-preview.ts`, and renders shared PDP details with `purchasingDisabled`; it must remain noindex, nofollow, and without product or breadcrumb JSON-LD. `/api/shopify-preview/disable` clears the session. Never log preview secrets, cookies, or product content.
- The headless preview endpoint does not rewrite Shopify Admin's native Preview button. Configure that Shopify-side link or app extension separately, or use the generated endpoint URL directly.
- GraphQL: source documents in `src/lib/shopify/queries/*.graphql`; generated output in `src/lib/shopify/types/generated/`. Import through `src/lib/shopify/types/index.ts`, never directly from generated files. Regenerate with `pnpm codegen`; do not hand-edit generated output.
- Cart: `teavision_cart` cookie holds the Shopify cart ID. `src/lib/cart/actions.ts` owns cart Server Actions; `src/app/(storefront)/cart/checkout/route.ts` owns the checkout handoff. Keep Shopify and the cookie authoritative.
- Accounts: `src/lib/shopify/customer-account/` and `src/app/(storefront)/account/` implement Customer Account API access, OAuth, sessions, and protected routes.
- Content: `src/lib/sanity/` supplies homepage CMS content and blog queries; `src/lib/blog/` owns blog operations. Do not assume all page content comes from Shopify.
- Integrations: `src/lib/contact/` for enquiry actions, `src/lib/searchanise/` for search, `src/lib/reviews/` for reviews, `src/lib/seo/` for SEO, and `src/lib/rate-limit/` for public request protection. Extend these boundaries instead of creating parallel clients.
- Shared public data reads use `'use cache'`, `cacheTag()`, and `cacheLife()`. Preserve corresponding Shopify/Sanity webhook invalidation. Keep request-specific cart and account data out of shared caches.
- Dynamic route `params` and `searchParams` are promises. Await them, and read the installed Next.js guide relevant to any framework change.

## Code and UI conventions

- Application code lives in `src/`; do not create root-level `app/`, `components/`, or `lib/`.
- Use named exports for components and library modules. Next.js special files and framework-required configuration/story metadata exports are exceptions.
- No `any`; use proper types or narrow `unknown`.
- Server Components are the default. Put `'use client'` on the smallest interactive boundary, not parent/layout wrappers. Put `'use server'` on Server Action modules.
- Extract a component for useful reuse, isolated interaction, or meaningful Storybook coverage. Keep trivial single-owner markup inline. One React component declaration per file; types, constants, and pure helpers may remain colocated.
- Use kebab-case filenames without redundant parent-domain prefixes: `cart/_components/view.tsx`, not `cart/_components/cart-view.tsx`.
- Style with Tailwind utilities and tokens from `src/app/globals.css`: `bg-paper`, `bg-card`, `text-ink`, `text-brand`, `ring-ring`. Keep the warm botanical palette; no cool grays, raw hex/rgb class values, CSS modules, or styled-components.
- Use `cn()` from `@/lib/utils` for class composition. Static class strings are fine. No concatenation, template literals, or filter/join composition.
- Do not add `style={{}}` attributes. The dynamic-inline-style exception in `docs/conventions.md` does not override this rule; use supported utility variants or the established token system.
- Reuse `Section.Root` and `Section.Container` for page sections, `Eyebrow` for section labels, and existing shared primitives before introducing alternatives. Read `PRODUCT.md` and `DESIGN.md` for UI work.
- Use component barrels across domains and relative imports within a component domain. Import library modules by explicit paths.
- Before adding a file, search for an existing owner to extend and check `docs/conventions.md`. Scaffold shared components with `pnpm create:component -- <domain>/<name>` and libraries with `pnpm create:lib -- <domain>/<name>`. For route-only components, use the route's `_components/` directory; the shared-component generator targets `src/components/`.
- Add or update colocated `*.stories.tsx` for shared UI components under `src/components/`. Storybook uses `@storybook/nextjs-vite` and is the preferred component documentation and interaction surface.

## Commands and verification

Use `pnpm`. `package.json` is the executable source of truth for scripts and their test selection.

| Command                                      | Purpose                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                                   | Local Next.js server                                                   |
| `pnpm build` / `pnpm start`                  | Build / serve the production bundle                                    |
| `pnpm lint`                                  | Tailwind class checks and ESLint                                       |
| `pnpm typecheck`                             | TypeScript without emitting files                                      |
| `pnpm test:contracts`                        | Custom lint-rule and component-contract tests                          |
| `pnpm test:unit`                             | Unit coverage selected by the script                                   |
| `pnpm test:integration`                      | Selected Server Action, route, and account boundaries                  |
| `pnpm storybook`                             | Component explorer on port 6006                                        |
| `pnpm test:stories` / `pnpm build-storybook` | Story tests / static Storybook build                                   |
| `pnpm test:e2e`                              | Local browser suite with fake Shopify and Customer Account services    |
| `pnpm test:e2e:production`                   | Same browser suite against a local production build with fake services |
| `pnpm verify`                                | Lint, contracts, and production build                                  |
| `pnpm codegen`                               | Regenerate Shopify GraphQL types using `.env.local`                    |
| `pnpm exec prettier --check <files>`         | Check formatting of touched files                                      |

- Match verification to the change. Documentation-only edits need formatting, path/command validation, and diff review. Code changes need relevant lint/type checks and focused behavioral coverage; use a production build for routing, caching, configuration, or rendering changes.
- For shared UI, run the affected story checks and inspect relevant responsive and interaction states. A single story opens at `http://localhost:6006/?path=/story/<story-id>`.
- Add regression coverage for behavior changes where it can catch a real failure. Do not add tests that merely mirror trivial edits. After required checks pass, broaden or repeat them only for a new change, failure, or unresolved concern.
- `pnpm verify` does not include all test suites. Neither local E2E command proves live Shopify checkout, payments, or production deployment.
- `pnpm audit:readiness`, `pnpm test:security`, and `pnpm test:performance` are operational audit/probe tools. Read their scripts and target configuration before use; some write evidence reports. Run them for relevant audit work, not every edit.
- `pnpm format` rewrites the repository. Prefer `pnpm exec prettier --write <files>` for touched files.
- Before finishing, review the diff for accidental changes and report checks actually run. Identify unavailable credentials/services or pre-existing failures without inventing passing results or adding production stubs.

## Environment and further reading

- `.env.example` lists supported variables; it is a setup template, not proof of current production settings. Never print `.env.local` or secret values.
- Storefront data requires `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_STOREFRONT_ACCESS_TOKEN`. Missing credentials must fail fast through the existing client. Fake provider modes belong in explicit test configurations.
- `SITE_URL` controls canonical URLs; `DISABLE_INDEXING` controls crawler visibility. Keep preview protection separate from live indexing.
- Product preview also requires a Shopify Admin app with `read_products`, `SHOPIFY_PRODUCT_PREVIEW_SECRET` set in each Vercel environment that should allow preview links, and `SHOPIFY_WEBHOOK_SECRET` configured for `/api/webhooks/shopify`. Product create, update, and delete webhooks must invalidate both product and collection tags so live listings reflect changes promptly.
- Account, Sanity, email, analytics, and rate-limit configuration have their own environment helpers. Preserve existing validation and production fail-closed behavior.
- Consult only the documentation relevant to the task: `docs/conventions.md` for structure, `docs/testing/customer-accounts-setup.md` for accounts, `docs/testing/cart-checkout-uat.md` for hosted checkout, `docs/launch/operations-runbook.md` for incidents/rollback, and `docs/launch/analytics-and-indexing-runbook.md` for analytics/indexing. Read dated evidence as evidence for that date, not a fresh operational check.
