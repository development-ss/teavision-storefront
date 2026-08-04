import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)

function sourcePath(...segments) {
  return path.join(repoRoot, ...segments)
}

async function readSource(...segments) {
  return readFile(sourcePath(...segments), 'utf8')
}

async function readAccountWrapperSources() {
  return Promise.all([
    readSource('src', 'app', '(storefront)', 'account', 'layout.tsx'),
    readSource('src', 'app', '(storefront)', 'account', 'page.tsx'),
    readSource('src', 'app', '(storefront)', 'account', 'loading.tsx'),
    readSource('src', 'app', '(storefront)', 'account', 'login', 'page.tsx'),
  ])
}

function assertAccountShellContract(wrapperSources, loginPanel) {
  for (const source of wrapperSources) {
    assert.match(source, /min-h-136/)
    assert.match(source, /md:min-h-128/)
    assert.doesNotMatch(source, /min-h-\[34rem\]/)
    assert.doesNotMatch(source, /md:min-h-\[32rem\]/)
  }

  assert.match(loginPanel, /min-h-72/)
  assert.match(loginPanel, /content-start/)
  assert.match(loginPanel, /prefetch=\{false\}/)
}

test('cart render shell avoids the empty-cart account-session waterfall', async () => {
  const cartPage = await readSource(
    'src',
    'app',
    '(storefront)',
    'cart',
    'page.tsx',
  )
  const loadingSkeleton = await readSource(
    'src',
    'app',
    '(storefront)',
    'cart',
    '_components',
    'loading-skeleton.tsx',
  )

  assert.match(
    cartPage,
    /const\s+\[\s*params\s*,\s*cart\s*\]\s*=\s*await\s+Promise\.all\(\[\s*searchParams\s*,\s*getCartAction\(\)\s*\]\)/,
  )

  const branchIndex = cartPage.indexOf('const shouldLoadAccountSession')
  const identitySyncIndex = cartPage.indexOf(
    "params.checkout === 'identity-sync-failed'",
  )
  const sessionIndex = cartPage.indexOf('getCustomerAccountSession()')

  assert.ok(branchIndex >= 0)
  assert.ok(identitySyncIndex > branchIndex)
  assert.ok(sessionIndex > identitySyncIndex)
  assert.match(
    cartPage,
    /shouldLoadAccountSession\s*\?\s*await getCustomerAccountSession\(\)\s*:\s*null/,
  )
  assert.match(loadingSkeleton, /Loading cart/)
  assert.match(loadingSkeleton, /xl:grid-cols-\[minmax\(0,1fr\)_22rem\]/)
  assert.match(loadingSkeleton, /CartLoadingHeader/)
  assert.match(loadingSkeleton, /CartLoadingLine/)
  assert.match(loadingSkeleton, /CartLoadingCheckoutForm/)
  assert.match(loadingSkeleton, /CartLoadingSummary/)
})

test('search route streams the hero shell before results resolve', async () => {
  const searchPage = await readSource(
    'src',
    'app',
    '(storefront)',
    'search',
    'page.tsx',
  )
  const searchResults = await readSource(
    'src',
    'app',
    '(storefront)',
    'search',
    '_components',
    'results.tsx',
  )
  const searchResultsView = await readSource(
    'src',
    'components',
    'search',
    'search-results-view',
    'search-results-view.tsx',
  )
  const searchHero = await readSource(
    'src',
    'components',
    'search',
    'search-results-view',
    'search-hero.tsx',
  )

  const heroIndex = searchPage.indexOf('<SearchHero state={state} />')
  const resultsIndex = searchPage.indexOf(
    '<SearchResults resultPromise={resultPromise} state={state} />',
  )

  assert.ok(heroIndex >= 0)
  assert.ok(resultsIndex > heroIndex)
  assert.match(
    searchPage,
    /const resultPromise = getSearchaniseSearchResults\(state\)/,
  )
  assert.doesNotMatch(searchPage, /function\s+SearchContent\b/)
  assert.doesNotMatch(searchPage, /function\s+SearchFallback\b/)

  assert.match(searchResults, /const result = await resultPromise/)
  assert.match(searchResults, /<SearchAnalytics/)
  assert.match(
    searchResults,
    /<SearchResultsView result=\{result\} state=\{state\} \/>/,
  )
  assert.doesNotMatch(searchResultsView, /<SearchHero\b/)
  assert.match(searchHero, /countLabel\?: string/)
  assert.match(searchHero, /Searching products\.\.\./)
})

test('privacy and account launch shells keep compact stable geometry', async () => {
  const privacyPage = await readSource(
    'src',
    'app',
    '(storefront)',
    'pages',
    'privacy-policy',
    'page.tsx',
  )
  const wrapperSources = await readAccountWrapperSources()
  const loginPanel = await readSource(
    'src',
    'app',
    '(storefront)',
    'account',
    '_components',
    'login-panel',
    'login-panel.tsx',
  )

  assert.match(privacyPage, /type-body-sm text-ink-soft mt-5/)
  assertAccountShellContract(wrapperSources, loginPanel)
})
