import { fileURLToPath } from 'node:url'

import { startProductionLifecycle } from '../performance/probe-lighthouse.mjs'

export const DEFAULT_BASE_URL = 'http://127.0.0.1:4173'
export const DEFAULT_COLLECTION_ROUTE = '/collections/all'
export const DEFAULT_PRODUCT_ROUTE = '/products/test-standard-tea'
export const DEFAULT_COLLECTION_TITLE = 'All products'
export const DEFAULT_PRODUCT_TITLE = 'Test Standard Tea'

const HELP_TEXT = `Usage: node scripts/seo/probe-crawlable-html.mjs [options]

Checks crawl-critical collection and PDP HTML before browser hydration.

Options:
  --base-url <url>           Existing server base URL. Default: ${DEFAULT_BASE_URL}
  --start-server             Build and start the fake-provider production lifecycle.
  --collection-route <path>  Collection route to fetch. Default: ${DEFAULT_COLLECTION_ROUTE}
  --product-route <path>     Product route to fetch. Default: ${DEFAULT_PRODUCT_ROUTE}
  --collection-title <text>  Expected collection title. Default: ${DEFAULT_COLLECTION_TITLE}
  --product-title <text>     Expected product title. Default: ${DEFAULT_PRODUCT_TITLE}
  --help                     Show this help text.
`

export function parseArgs(argv) {
  const args = {
    baseUrl: process.env.CRAWLABLE_HTML_BASE_URL ?? DEFAULT_BASE_URL,
    collectionRoute: DEFAULT_COLLECTION_ROUTE,
    collectionTitle: DEFAULT_COLLECTION_TITLE,
    help: false,
    productRoute: DEFAULT_PRODUCT_ROUTE,
    productTitle: DEFAULT_PRODUCT_TITLE,
    startServer: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--help' || value === '-h') {
      args.help = true
      continue
    }

    if (value === '--base-url') {
      args.baseUrl = argv[index + 1] ?? args.baseUrl
      index += 1
      continue
    }

    if (value.startsWith('--base-url=')) {
      args.baseUrl = value.slice('--base-url='.length)
      continue
    }

    if (value === '--start-server') {
      args.startServer = true
      continue
    }

    if (value === '--collection-route') {
      args.collectionRoute = argv[index + 1] ?? args.collectionRoute
      index += 1
      continue
    }

    if (value.startsWith('--collection-route=')) {
      args.collectionRoute = value.slice('--collection-route='.length)
      continue
    }

    if (value === '--product-route') {
      args.productRoute = argv[index + 1] ?? args.productRoute
      index += 1
      continue
    }

    if (value.startsWith('--product-route=')) {
      args.productRoute = value.slice('--product-route='.length)
      continue
    }

    if (value === '--collection-title') {
      args.collectionTitle = argv[index + 1] ?? args.collectionTitle
      index += 1
      continue
    }

    if (value.startsWith('--collection-title=')) {
      args.collectionTitle = value.slice('--collection-title='.length)
      continue
    }

    if (value === '--product-title') {
      args.productTitle = argv[index + 1] ?? args.productTitle
      index += 1
      continue
    }

    if (value.startsWith('--product-title=')) {
      args.productTitle = value.slice('--product-title='.length)
      continue
    }

    if (!value.startsWith('--')) {
      args.baseUrl = value
    }
  }

  return args
}

function assertBaseUrl(value) {
  try {
    return new URL(value)
  } catch {
    throw new Error(`Invalid base URL: ${value}`)
  }
}

function targetUrl(baseUrl, route) {
  try {
    return new URL(route).toString()
  } catch {
    return new URL(route, baseUrl).toString()
  }
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function statusCell(passed) {
  return passed ? 'PASS' : 'FAIL'
}

function check(name, passed, detail) {
  return {
    check: name,
    detail,
    status: statusCell(passed),
  }
}

function countH1(html) {
  return (html.match(/<h1\b/gi) ?? []).length
}

const SKELETON_MARKER_PATTERN =
  /Loading (product|collection)|\bskeleton\b|animate-pulse/i

function patternIndex(html, pattern) {
  const match = html.match(pattern)
  return match?.index ?? -1
}

function firstPatternIndex(html, patterns) {
  const indexes = patterns
    .map((pattern) => patternIndex(html, pattern))
    .filter((index) => index >= 0)

  return indexes.length > 0 ? Math.min(...indexes) : -1
}

function hasSkeletonMarker(html) {
  return SKELETON_MARKER_PATTERN.test(html)
}

function findTitleIndex(html, expectedTitle) {
  return html.toLowerCase().indexOf(expectedTitle.toLowerCase())
}

function findCollectionContentReadyIndex(html, expectedTitle) {
  const titleIndex = findTitleIndex(html, expectedTitle)
  const productContentIndex = firstPatternIndex(html, [
    /\bid=["']product-grid["']/i,
    /href=["']\/products\//i,
    /Add to cart/i,
  ])

  if (titleIndex < 0 || productContentIndex < 0) return -1

  return Math.max(titleIndex, productContentIndex)
}

function findProductContentReadyIndex(html, expectedTitle) {
  const titleIndex = findTitleIndex(html, expectedTitle)
  const buyContentIndex = firstPatternIndex(html, [
    /Add to Cart/i,
    /Bulk savings/i,
    /selected pack/i,
    /Freight-insured and tracked/i,
  ])

  if (titleIndex < 0 || buyContentIndex < 0) return -1

  return Math.max(titleIndex, buyContentIndex)
}

function findContentReadyIndex({ expectedTitle, html, kind }) {
  return kind === 'collection'
    ? findCollectionContentReadyIndex(html, expectedTitle)
    : findProductContentReadyIndex(html, expectedTitle)
}

function firstChunkWhere(chunks, predicate) {
  let cumulativeHtml = ''

  for (const [index, chunk] of chunks.entries()) {
    cumulativeHtml += chunk
    if (predicate(cumulativeHtml)) return index + 1
  }

  return null
}

function evaluateContentBeforeSkeleton({ chunks, expectedTitle, html, kind }) {
  const safeChunks = chunks.length > 0 ? chunks : [html]
  const contentReadyIndex = findContentReadyIndex({
    expectedTitle,
    html,
    kind,
  })
  const skeletonIndex = patternIndex(html, SKELETON_MARKER_PATTERN)
  const contentChunk = firstChunkWhere(
    safeChunks,
    (cumulativeHtml) =>
      findContentReadyIndex({
        expectedTitle,
        html: cumulativeHtml,
        kind,
      }) >= 0,
  )
  const skeletonChunk = firstChunkWhere(safeChunks, hasSkeletonMarker)

  if (contentReadyIndex < 0) {
    return check(
      'content before skeleton',
      false,
      skeletonChunk
        ? `crawl-critical content missing before skeleton chunk ${skeletonChunk}`
        : 'crawl-critical content missing',
    )
  }

  if (skeletonIndex >= 0 && skeletonIndex < contentReadyIndex) {
    return check(
      'content before skeleton',
      false,
      `skeleton marker appears before crawl-critical content (skeleton chunk ${skeletonChunk ?? 'unknown'}, content chunk ${contentChunk ?? 'unknown'})`,
    )
  }

  return check(
    'content before skeleton',
    true,
    skeletonChunk
      ? `crawl-critical content appears before skeleton chunk ${skeletonChunk}`
      : `crawl-critical content appears in chunk ${contentChunk ?? 'unknown'} with no skeleton marker`,
  )
}

function hasCanonicalLink(html) {
  const links = html.match(/<link\b[^>]*>/gi) ?? []

  return links.some(
    (tag) =>
      /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag) &&
      /\bhref=["'][^"']+["']/i.test(tag),
  )
}

function extractHeadHtml(html) {
  return html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
}

function hasPageTitle(html) {
  return /<title\b[^>]*>[^<]*\S[^<]*<\/title>/i.test(html)
}

function hasMetaDescription(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []

  return tags.some((tag) => {
    const name = tag.match(/\bname=["']([^"']+)["']/i)?.[1]
    const content = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1]

    return name?.toLowerCase() === 'description' && Boolean(content?.trim())
  })
}

export function extractJsonLd(html) {
  const scripts = [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ]

  return scripts
    .map((match) => match[1].trim())
    .filter(Boolean)
    .map((script) => JSON.parse(script))
}

function schemaTypeMatches(value, schemaType) {
  const type = value?.['@type']

  return (
    type === schemaType || (Array.isArray(type) && type.includes(schemaType))
  )
}

export function findSchemaNodes(values, schemaType) {
  const nodes = []

  function visit(value) {
    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }

    if (!value || typeof value !== 'object') return

    if (schemaTypeMatches(value, schemaType)) {
      nodes.push(value)
    }

    visit(value['@graph'])
  }

  visit(values)

  return nodes
}

function hasSchemaType(html, schemaTypes) {
  const values = extractJsonLd(html)

  return schemaTypes.some(
    (schemaType) => findSchemaNodes(values, schemaType).length > 0,
  )
}

function normalizedVisibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesText(html, expectedText) {
  return normalizedVisibleText(html)
    .toLowerCase()
    .includes(expectedText.toLowerCase())
}

function hasCollectionContent(html, expectedTitle) {
  return (
    includesText(html, expectedTitle) &&
    (/\bid=["']product-grid["']/i.test(html) ||
      /href=["']\/products\/test-standard-tea["']/i.test(html) ||
      /Test Standard Tea/i.test(html) ||
      /Add to cart/i.test(html))
  )
}

function hasProductContent(html, expectedTitle) {
  return (
    includesText(html, expectedTitle) &&
    (/Add to Cart/i.test(html) ||
      /Bulk savings/i.test(html) ||
      /selected pack/i.test(html) ||
      /Freight-insured and tracked/i.test(html))
  )
}

function hasSkeletonOnlyShell(html, hasMeaningfulContent) {
  if (hasMeaningfulContent) return false

  return hasSkeletonMarker(html)
}

export function evaluateRouteHtml({
  chunks = [],
  expectedTitle,
  html,
  kind,
  route,
}) {
  const h1Count = countH1(html)
  const headHtml = extractHeadHtml(html)
  const hasMeaningfulContent =
    kind === 'collection'
      ? hasCollectionContent(html, expectedTitle)
      : hasProductContent(html, expectedTitle)

  const rows = [
    check('HTTP HTML body', html.trim().length > 0, `${html.length} bytes`),
    check('single h1', h1Count === 1, `${h1Count} <h1> tags found`),
    check(
      'canonical link',
      hasCanonicalLink(html),
      hasCanonicalLink(html)
        ? 'canonical link found'
        : 'canonical link missing',
    ),
    check(
      'skeleton-only shell',
      !hasSkeletonOnlyShell(html, hasMeaningfulContent),
      hasMeaningfulContent
        ? 'meaningful route content found'
        : 'route content is missing or only loading/skeleton text',
    ),
    evaluateContentBeforeSkeleton({ chunks, expectedTitle, html, kind }),
  ]

  if (kind === 'collection') {
    rows.push(
      check(
        'page title in head',
        hasPageTitle(headHtml),
        hasPageTitle(headHtml)
          ? 'page title found in head'
          : 'page title missing from head',
      ),
      check(
        'meta description in head',
        hasMetaDescription(headHtml),
        hasMetaDescription(headHtml)
          ? 'meta description found in head'
          : 'meta description missing from head',
      ),
      check(
        'canonical in head',
        hasCanonicalLink(headHtml),
        hasCanonicalLink(headHtml)
          ? 'canonical link found in head'
          : 'canonical link missing from head',
      ),
      check(
        'collection product content',
        hasMeaningfulContent,
        hasMeaningfulContent
          ? 'collection title and product-grid/product-card content found'
          : 'collection title and product-grid/product-card content missing',
      ),
      check(
        'collection JSON-LD',
        hasSchemaType(html, ['CollectionPage', 'ItemList']),
        'CollectionPage or ItemList JSON-LD expected',
      ),
    )
  } else {
    rows.push(
      check(
        'PDP product title',
        includesText(html, expectedTitle),
        includesText(html, expectedTitle)
          ? `${expectedTitle} found`
          : `${expectedTitle} missing`,
      ),
      check(
        'PDP buy section',
        hasMeaningfulContent,
        hasMeaningfulContent
          ? 'add-to-cart/buy-section marker found'
          : 'add-to-cart/buy-section marker missing',
      ),
      check(
        'Product JSON-LD',
        hasSchemaType(html, ['Product', 'ProductGroup']),
        'Product JSON-LD expected',
      ),
    )
  }

  return rows.map((row) => ({
    ...row,
    route,
  }))
}

function renderMarkdownTable(rows) {
  const lines = [
    '| Route | Check | Status | Detail |',
    '| --- | --- | --- | --- |',
  ]

  for (const row of rows) {
    lines.push(
      `| ${escapeMarkdownCell(row.route)} | ${escapeMarkdownCell(
        row.check,
      )} | ${row.status} | ${escapeMarkdownCell(row.detail)} |`,
    )
  }

  return lines.join('\n')
}

async function readResponseHtml(response) {
  if (!response.body || typeof response.body.getReader !== 'function') {
    const html = await response.text()
    return { chunks: [html], html }
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const chunks = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(decoder.decode(value, { stream: true }))
  }

  const tail = decoder.decode()
  if (tail) chunks.push(tail)

  return { chunks, html: chunks.join('') }
}

async function fetchHtml(baseUrl, route) {
  const response = await fetch(targetUrl(baseUrl, route), {
    headers: {
      Accept: 'text/html',
      'Accept-Encoding': 'identity',
    },
  })
  const { chunks, html } = await readResponseHtml(response)

  if (!response.ok) {
    return {
      chunks,
      html,
      rows: [
        {
          check: 'HTTP status',
          detail: `status ${response.status}`,
          route,
          status: 'FAIL',
        },
      ],
    }
  }

  return { chunks, html, rows: [] }
}

export async function runProbe(args) {
  const targets = [
    {
      expectedTitle: args.collectionTitle,
      kind: 'collection',
      route: args.collectionRoute,
    },
    {
      expectedTitle: args.productTitle,
      kind: 'product',
      route: args.productRoute,
    },
  ]
  const rows = []

  for (const target of targets) {
    const {
      chunks,
      html,
      rows: fetchRows,
    } = await fetchHtml(args.baseUrl, target.route)
    rows.push(...fetchRows)

    if (fetchRows.some((row) => row.status === 'FAIL')) continue

    rows.push(evaluateRouteHtml({ ...target, chunks, html }))
  }

  return rows.flat()
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)

  if (args.help) {
    console.log(HELP_TEXT.trim())
    return
  }

  assertBaseUrl(args.baseUrl)

  let lifecycle = null
  try {
    if (args.startServer) {
      lifecycle = await startProductionLifecycle(args.baseUrl, {
        disableIndexing: false,
      })
    }

    const rows = await runProbe(args)
    console.log(renderMarkdownTable(rows))

    if (rows.some((row) => row.status === 'FAIL')) {
      process.exitCode = 1
    }
  } finally {
    await lifecycle?.stop()
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
