<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm codegen      # Regenerate GraphQL types from Shopify schema
pnpm storybook    # Component dev/docs on port 6006
```

Storybook remains the preferred component documentation and interaction surface. Phase 10 adds an approved exception for revenue-critical cart and checkout-handoff coverage:

- `pnpm test:unit` for pure helpers, Shopify transport, and Shopify operation tests.
- `pnpm test:integration` for Server Actions and route-handler boundaries.
- `pnpm test:e2e` for fake-Shopify browser coverage of the local cart-to-checkout handoff only.

Do not run real Shopify hosted checkout, payment, shipping-rate, tax, order-creation, or success-redirect tests until the Shopify dev store is configured and the store owner explicitly approves checkout testing. To run a single Storybook story in isolation, open `http://localhost:6006/?path=/story/<story-id>`.

## Architecture

**Headless Shopify storefront** built on Next.js 16 App Router with React 19. All product, collection, cart, and checkout data comes from the Shopify Storefront GraphQL API.

### Data flow

- **Server Components** fetch data by calling `src/lib/shopify/operations/*` helpers (e.g. `getProduct`, `getCollection`, `getCart`)
- Those helpers call `shopifyFetch()` which wraps the Storefront GraphQL API
- Queries live in `src/lib/shopify/queries/*.graphql`; TypeScript types are generated into `src/lib/shopify/types/generated/` via `pnpm codegen`
- **Cart state** lives in a cookie (`teavision_cart`) holding the Shopify cart ID — no client-side store
- **Server Actions** in `src/lib/cart/actions.ts` handle all cart mutations; they read/write the cookie and call Shopify
- **`'use cache'`** (Next.js 16 Cache Components) with `cacheTag()` and `cacheLife()` wraps expensive product/collection fetches

### Routing

All storefront pages live under `src/app/(storefront)/`. Dynamic segments use the Next.js 16 `params: Promise<{...}>` pattern — always `await params` before destructuring.

Key routes:

- `/products/[handle]` — product detail
- `/collections/[handle]` — collection listing
- `/cart` — cart page
- `/blogs/[blog]/[article]` — Tea Journal articles
- `/pages/wholesale` — wholesale inquiry

### Component conventions

- **`'use client'`** only on interactive leaves (forms, quantity controls, cart buttons)
- **`'use server'`** on Server Actions files
- All styling via Tailwind 4 utilities — no CSS modules, no inline styles
- Use `cn()` from `@/lib/utils` for all className composition — never array concatenation or template literals
- Design tokens defined in `app/globals.css` via `@theme`; use token class names (`bg-paper`, `bg-card`, `text-ink`, `text-brand`, `ring-ring`) rather than raw hex values
- The palette is warm/botanical — never introduce cool grays
- Extract a React component only when it creates a useful reuse boundary, isolates interactive state, or deserves Storybook coverage. Keep tiny single-owner markup inline in its owning component.
- One React component per file once extracted; only non-component types, constants, and pure helper functions may stay colocated.
- Do not repeat parent directory context in filenames. If a file already lives in `cart/`, do not prefix it with `cart-`; prefer `view.tsx`, `loading-skeleton.tsx`, or `summary.tsx` over `cart-view.tsx`, `cart-loading-skeleton.tsx`, or `cart-summary.tsx`. Export names may still include domain context when helpful.

### Environment variables

```
SHOPIFY_STORE_DOMAIN=
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
```

Shopify credentials are required for storefront data. Missing credentials should fail fast via `shopifyFetch()` rather than falling back to stub data.

### Storybook

Stories are co-located with components as `*.stories.tsx`. Uses `@storybook/nextjs-vite` framework. Add a story whenever building a new UI component.

## Do not

These anti-patterns are explicitly banned — they override any default AI behavior:

- No default exports on components or lib modules (Next.js special files are excepted)
- No `any` type — use `unknown` and narrow, or define a proper type
- No raw hex/rgb values in className — use design token class names only (`text-ink` not `text-[#3d3d35]`)
- No className string concatenation or `filter(Boolean).join(' ')` — always use `cn()` from `@/lib/utils`
- No `'use client'` on parent/wrapper components — push it down to the interactive leaf
- No multiple React component declarations in one file; inline trivial single-owner markup instead of creating tiny helper components
- No redundant domain or route prefixes in filenames when the parent folder already provides that context, e.g. no `cart-*` files inside a `cart/` folder
- No new CSS modules, styled-components, or `style={{}}` attributes
- No direct imports from `src/lib/shopify/types/generated/` — import via `src/lib/shopify/types/index.ts`
- No recreating root-level `app/`, `components/`, or `lib/`; application code lives in `src/`

## Before adding a file

1. Does a similar file already exist that should be extended instead?
2. Which directory does it belong in? (check `docs/conventions.md` folder map)
3. Does it need a Storybook story? (yes if it lives in `src/components/`)
4. Scaffold it: `pnpm create:component <domain>/<name>` or `pnpm create:lib <domain>/<name>`
