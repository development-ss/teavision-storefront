import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000'
export const DEFAULT_PRODUCT_PATH = '/products/test-standard-tea'
const REQUIRED_ROBOTS_DISALLOWS = [
  '/api/',
  '/account',
  '/account/',
  '/account/login',
  '/account/callback',
  '/account/logout',
]
const VALID_MODES = new Set([
  'disabled',
  'enabled',
  'redirects',
  'runbook',
  'url-audit',
])

const SOURCE_PATHS = {
  auditRemediation: 'docs/launch/seo-audit-remediation.md',
  evidence: 'docs/launch/seo-route-evidence.md',
  launchMatrix: 'src/lib/seo/launch-route-matrix.ts',
  legacyRedirects: 'src/lib/seo/legacy-redirects.ts',
  nextConfig: 'next.config.ts',
  policies: 'src/lib/legal/policies.ts',
  runbook: 'docs/launch/analytics-and-indexing-runbook.md',
  urlParityRegister:
    process.env.SEO_URL_PARITY_REGISTER_PATH ??
    'docs/launch/seo-url-parity-register.md',
}

export const STRUCTURED_DATA_ROUTE_EXPECTATIONS = [
  {
    path: '/pages/contact',
    requiredSchemaTypes: ['LocalBusiness'],
  },
  {
    path: '/pages/faq',
    requiredSchemaTypes: ['FAQPage'],
  },
  {
    path: '/pages/bulk-wholesale-supply',
    requiredSchemaTypes: ['Service', 'FAQPage'],
  },
  {
    path: '/pages/private-label-packing',
    requiredSchemaTypes: ['Service'],
  },
  {
    path: '/pages/tea-bag-manufacturer',
    requiredSchemaTypes: ['Service'],
  },
  {
    path: '/pages/custom-tea-blends',
    requiredSchemaTypes: ['Service'],
  },
]

export function parseArgs(argv) {
  const args = {
    baseUrl: process.env.SEO_PROBE_BASE_URL ?? DEFAULT_BASE_URL,
    mode: 'enabled',
    productPath: DEFAULT_PRODUCT_PATH,
    productPathSource: 'default',
  }
  const envProductPath = process.env.SEO_PROBE_PRODUCT_PATH?.trim()

  if (envProductPath) {
    args.productPath = envProductPath
    args.productPathSource = 'env'
  }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--mode') {
      args.mode = argv[index + 1] ?? args.mode
      index += 1
      continue
    }

    if (value.startsWith('--mode=')) {
      args.mode = value.slice('--mode='.length)
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

    if (value === '--product-path') {
      args.productPath = argv[index + 1] ?? args.productPath
      args.productPathSource = 'cli'
      index += 1
      continue
    }

    if (value.startsWith('--product-path=')) {
      args.productPath = value.slice('--product-path='.length)
      args.productPathSource = 'cli'
      continue
    }

    if (!value.startsWith('--')) {
      args.baseUrl = value
    }
  }

  if (!VALID_MODES.has(args.mode)) {
    throw new Error(
      `Unsupported mode "${args.mode}". Use one of: ${[...VALID_MODES].join(
        ', ',
      )}`,
    )
  }

  return args
}

function readSource(path) {
  return readFileSync(path, 'utf8')
}

function extractStringLiterals(block) {
  return [...block.matchAll(/'([^']+)'/g)].map((match) => match[1])
}

function parseRouteExpectationArray(matrixSource, exportName, kind) {
  const arrayMatch = matrixSource.match(
    new RegExp(`${exportName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*satisfies`),
  )

  if (!arrayMatch) {
    throw new Error(`Could not find ${exportName}`)
  }

  return [...arrayMatch[1].matchAll(/\{([\s\S]*?)\}/g)].map((match) => {
    const block = match[1]
    const path = requiredMatch(block, /path:\s*'([^']+)'/, `${kind} path`)
    const canonicalPath = requiredMatch(
      block,
      /canonicalPath:\s*'([^']+)'/,
      `canonical for ${path}`,
    )

    return {
      canonicalPath,
      expectedStatus: Number(
        requiredMatch(block, /expectedStatus:\s*(\d+)/, `status for ${path}`),
      ),
      kind,
      path,
      shouldAppearInSitemap:
        requiredMatch(
          block,
          /shouldAppearInSitemap:\s*(true|false)/,
          `sitemap flag for ${path}`,
        ) === 'true',
      shouldIndexWhenEnabled:
        requiredMatch(
          block,
          /shouldIndexWhenEnabled:\s*(true|false)/,
          `index flag for ${path}`,
        ) === 'true',
    }
  })
}

function parseStaticExpectations(matrixSource) {
  return parseRouteExpectationArray(
    matrixSource,
    'STATIC_LAUNCH_ROUTE_EXPECTATIONS',
    'static',
  )
}

function parseLegalPolicies(policySource) {
  return [
    ...policySource.matchAll(
      /href:\s*'([^']+)'[\s\S]*?sitemap:\s*(true|false),[\s\S]*?redirectSources:\s*\[([\s\S]*?)\]/g,
    ),
  ].map((match) => ({
    href: match[1],
    redirectSources: extractStringLiterals(match[3]),
    sitemap: match[2] === 'true',
  }))
}

export function parseLegacyCatalogRedirects(source) {
  return [
    ...source.matchAll(
      /\{\s*source:\s*'([^']+)',\s*destination:\s*'([^']+)',?\s*\}/g,
    ),
  ].map((match) => ({ source: match[1], target: match[2] }))
}

function materializeExpectations() {
  const matrixSource = readSource(SOURCE_PATHS.launchMatrix)
  const policySource = readSource(SOURCE_PATHS.policies)
  const staticExpectations = parseStaticExpectations(matrixSource)
  const appOwnedRedirectExpectations = parseRouteExpectationArray(
    matrixSource,
    'APP_OWNED_REDIRECT_EXPECTATIONS',
    'redirect',
  )
  const legalPolicies = parseLegalPolicies(policySource)

  const legalExpectations = legalPolicies.map((policy) => ({
    canonicalPath: policy.href,
    expectedStatus: 200,
    kind: 'legal',
    path: policy.href,
    shouldAppearInSitemap: policy.sitemap,
    shouldIndexWhenEnabled: policy.sitemap,
  }))

  const redirectExpectations = [
    ...appOwnedRedirectExpectations,
    ...legalPolicies.flatMap((policy) =>
      policy.redirectSources.map((source) => ({
        canonicalPath: policy.href,
        expectedStatus: 308,
        kind: 'redirect',
        path: source,
        shouldAppearInSitemap: false,
        shouldIndexWhenEnabled: false,
      })),
    ),
    ...parseLegacyCatalogRedirects(
      readSource(SOURCE_PATHS.legacyRedirects),
    ).map((redirect) => ({
      canonicalPath: redirect.target,
      expectedStatus: 301,
      kind: 'redirect',
      path: redirect.source,
      shouldAppearInSitemap: false,
      shouldIndexWhenEnabled: false,
    })),
  ]

  return {
    all: [...staticExpectations, ...legalExpectations, ...redirectExpectations],
    legal: legalExpectations,
    redirects: redirectExpectations,
    static: staticExpectations,
  }
}

function requiredMatch(source, pattern, label) {
  const match = source.match(pattern)

  if (!match) {
    throw new Error(`Could not parse ${label}`)
  }

  return match[1]
}

function parseBaseUrl(value) {
  try {
    return new URL(value)
  } catch {
    throw new Error(`Invalid base URL: ${value}`)
  }
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function printResults(results) {
  console.log('| Check | Target | Status | Detail |')
  console.log('| --- | --- | --- | --- |')

  for (const result of results) {
    console.log(
      `| ${escapeMarkdownCell(result.check)} | ${escapeMarkdownCell(
        result.target,
      )} | ${result.status} | ${escapeMarkdownCell(result.detail)} |`,
    )
  }
}

async function fetchText(baseUrl, path, init = {}) {
  const response = await fetch(new URL(path, baseUrl), init)
  const text = await response.text()

  return { response, text }
}

function getLocPaths(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => {
      try {
        return new URL(match[1]).pathname
      } catch {
        return ''
      }
    })
    .filter(Boolean)
}

function getCanonicalHref(html, baseUrl) {
  const tags = html.match(/<link\b[^>]*>/gi) ?? []
  const canonicalTag = tags.find((tag) => /rel=["']canonical["']/i.test(tag))
  const href = canonicalTag?.match(/href=["']([^"']+)["']/i)?.[1]

  if (!href) return null

  try {
    return new URL(href, baseUrl).pathname
  } catch {
    return null
  }
}

function getHtmlLang(html) {
  return html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1] ?? null
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getMissingRobotsDisallows(robotsText) {
  return REQUIRED_ROBOTS_DISALLOWS.filter((path) => {
    const pattern = new RegExp(
      `^\\s*Disallow:\\s*${escapeRegExp(path)}\\s*$`,
      'im',
    )

    return !pattern.test(robotsText)
  })
}

function isPatternPath(path) {
  return path.includes(':') || path.includes('*')
}

function hasNoindexMeta(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? []

  return tags.some(
    (tag) =>
      /name=["']robots["']/i.test(tag) &&
      /content=["'][^"']*noindex/i.test(tag),
  )
}

function splitMarkdownRow(line) {
  const trimmed = line.trim()

  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return []

  return trimmed
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim())
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseRegisterRows(markdown) {
  const rows = []
  let headers = []

  for (const line of markdown.split(/\r?\n/)) {
    const cells = splitMarkdownRow(line)

    if (cells.length === 0) {
      headers = []
      continue
    }

    if (
      cells.includes('Source URL') &&
      cells.includes('Target URL') &&
      cells.includes('Decision')
    ) {
      headers = cells
      continue
    }

    if (headers.length === 0 || isSeparatorRow(cells)) continue
    if (cells.length !== headers.length) continue

    rows.push(
      Object.fromEntries(
        headers.map((header, index) => [header, cells[index] ?? '']),
      ),
    )
  }

  return rows
}

function parseNextConfigLiteralRedirects(nextConfigSource) {
  return [
    ...nextConfigSource.matchAll(
      /\{[^{}]*source:\s*'([^']+)'[^{}]*destination:\s*'([^']+)'[^{}]*permanent:\s*true[^{}]*\}/g,
    ),
  ].map((match) => ({
    source: match[1],
    target: match[2],
  }))
}

function normalizeRegisterPath(value) {
  return value.trim().replace(/^`([^`]+)`$/, '$1')
}

function getCodedRedirectsForAudit() {
  const nextConfig = readSource(SOURCE_PATHS.nextConfig)
  const policySource = readSource(SOURCE_PATHS.policies)
  const literalRedirects = parseNextConfigLiteralRedirects(nextConfig)
  const policyRedirects = parseLegalPolicies(policySource).flatMap((policy) =>
    policy.redirectSources.map((source) => ({
      source,
      target: policy.href,
    })),
  )
  const legacyRedirects = parseLegacyCatalogRedirects(
    readSource(SOURCE_PATHS.legacyRedirects),
  )
  const redirects = [
    ...literalRedirects,
    ...policyRedirects,
    ...legacyRedirects,
  ]
  const seen = new Set()

  return redirects.filter((redirect) => {
    const key = `${redirect.source}\u0000${redirect.target}`

    if (seen.has(key)) return false

    seen.add(key)
    return true
  })
}

export function extractJsonLd(html) {
  return [
    ...html.matchAll(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ]
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

// Products with several pack sizes are marked up as a ProductGroup.
function findProductNodes(values) {
  return [
    ...findSchemaNodes(values, 'Product'),
    ...findSchemaNodes(values, 'ProductGroup'),
  ]
}

export function hasProductJsonLd(values) {
  return findProductNodes(values).length > 0
}

function isAggregateRating(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    schemaTypeMatches(value, 'AggregateRating'),
  )
}

export function hasProductAggregateRating(values) {
  return findProductNodes(values).some((product) =>
    isAggregateRating(product.aggregateRating),
  )
}

export function hasVisibleProductReviewSummary(html) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

  return /\b\d+(?:\.\d+)?\s*·\s*\d[\d,]*\s+reviews?\b/i.test(text)
}

function hasShopifyCredentials() {
  return Boolean(
    process.env.SHOPIFY_STORE_DOMAIN &&
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  )
}

function pass(check, target, detail) {
  return { check, detail, status: 'PASS', target }
}

function warn(check, target, detail) {
  return { check, detail, status: 'WARN', target }
}

function fail(check, target, detail) {
  return { check, detail, status: 'FAIL', target }
}

function runRunbookMode() {
  const results = []
  const evidenceExists = existsSync(SOURCE_PATHS.evidence)
  const runbookExists = existsSync(SOURCE_PATHS.runbook)
  const evidence = evidenceExists ? readSource(SOURCE_PATHS.evidence) : ''
  const runbook = runbookExists ? readSource(SOURCE_PATHS.runbook) : ''

  results.push(
    evidenceExists
      ? pass('SEO evidence doc exists', SOURCE_PATHS.evidence, 'found')
      : fail('SEO evidence doc exists', SOURCE_PATHS.evidence, 'missing'),
  )
  results.push(
    runbookExists
      ? pass('analytics/indexing runbook exists', SOURCE_PATHS.runbook, 'found')
      : fail(
          'analytics/indexing runbook exists',
          SOURCE_PATHS.runbook,
          'missing',
        ),
  )

  for (const heading of [
    '## Command',
    '## Date',
    '## Disabled-mode result',
    '## Enabled-mode result',
    '## Redirects result',
    '## Structured-data result',
    '## Owner-gated Search Console evidence',
  ]) {
    results.push(
      evidence.includes(heading)
        ? pass('SEO evidence heading', heading, 'present')
        : fail('SEO evidence heading', heading, 'missing'),
    )
  }

  for (const text of ['Search Console', 'Evidence Log']) {
    results.push(
      runbook.includes(text)
        ? pass('runbook launch evidence text', text, 'present')
        : fail('runbook launch evidence text', text, 'missing'),
    )
  }

  return results
}

function runRedirectsMode() {
  const expectations = materializeExpectations()
  const nextConfig = readSource(SOURCE_PATHS.nextConfig)
  const matrix = readSource(SOURCE_PATHS.launchMatrix)
  const results = []
  const redirectPaths = expectations.redirects.map(
    (expectation) => expectation.path,
  )

  results.push(
    nextConfig.includes('getPolicyRedirects')
      ? pass(
          'Next config policy redirects',
          SOURCE_PATHS.nextConfig,
          'registry helper used',
        )
      : fail(
          'Next config policy redirects',
          SOURCE_PATHS.nextConfig,
          'registry helper missing',
        ),
  )
  results.push(
    matrix.includes('REDIRECT_ROUTE_EXPECTATIONS')
      ? pass(
          'route matrix redirect expectations',
          SOURCE_PATHS.launchMatrix,
          'export present',
        )
      : fail(
          'route matrix redirect expectations',
          SOURCE_PATHS.launchMatrix,
          'export missing',
        ),
  )

  for (const path of [
    '/policies/privacy-policy',
    '/policies/terms-of-service',
  ]) {
    const expectation = expectations.redirects.find(
      (candidate) => candidate.path === path,
    )

    results.push(
      expectation
        ? pass(
            'policy redirect expectation',
            path,
            `308 -> ${expectation.canonicalPath}`,
          )
        : fail('policy redirect expectation', path, 'missing'),
    )
  }

  results.push(
    redirectPaths.length > 0
      ? pass(
          'redirect expectation count',
          'REDIRECT_ROUTE_EXPECTATIONS',
          `${redirectPaths.length} redirects`,
        )
      : fail(
          'redirect expectation count',
          'REDIRECT_ROUTE_EXPECTATIONS',
          'no redirects found',
        ),
  )

  for (const expectation of expectations.redirects.filter((candidate) =>
    isPatternPath(candidate.path),
  )) {
    results.push(
      nextConfig.includes(`source: '${expectation.path}'`)
        ? pass(
            'app-owned redirect expectation',
            expectation.path,
            `308 -> ${expectation.canonicalPath}`,
          )
        : fail(
            'app-owned redirect expectation',
            expectation.path,
            'missing from next.config.ts',
          ),
    )
  }

  return results
}

function runUrlAuditMode() {
  const results = []

  if (!existsSync(SOURCE_PATHS.urlParityRegister)) {
    return [
      fail(
        'URL parity register exists',
        SOURCE_PATHS.urlParityRegister,
        'missing',
      ),
    ]
  }

  const register = readSource(SOURCE_PATHS.urlParityRegister)
  const remediation = existsSync(SOURCE_PATHS.auditRemediation)
    ? readSource(SOURCE_PATHS.auditRemediation)
    : ''
  const registerRows = parseRegisterRows(register)
  const appOwnedRows = registerRows.filter(
    (row) => row.Decision === 'app-owned redirect',
  )
  const blogListingRow = registerRows.find(
    (row) =>
      normalizeRegisterPath(row['Source URL'] ?? '') ===
        '/blogs/teavision-blogs' &&
      normalizeRegisterPath(row['Target URL'] ?? '') === '/blog',
  )
  const ownerExportPath = process.env.SEO_URL_MIGRATION_EXPORT?.trim() ?? ''

  results.push(
    pass('URL parity register exists', SOURCE_PATHS.urlParityRegister, 'found'),
  )
  results.push(
    register.includes('Two-source confirmation')
      ? pass(
          'Two-source confirmation rule',
          SOURCE_PATHS.urlParityRegister,
          'present',
        )
      : fail(
          'Two-source confirmation rule',
          SOURCE_PATHS.urlParityRegister,
          'missing',
        ),
  )
  results.push(
    appOwnedRows.length > 0
      ? pass(
          'app-owned register rows',
          SOURCE_PATHS.urlParityRegister,
          `${appOwnedRows.length} rows`,
        )
      : fail(
          'app-owned register rows',
          SOURCE_PATHS.urlParityRegister,
          'none found',
        ),
  )
  results.push(
    register.includes('## Owner/operator handoff')
      ? pass(
          'Owner/operator handoff table',
          SOURCE_PATHS.urlParityRegister,
          'present',
        )
      : fail(
          'Owner/operator handoff table',
          SOURCE_PATHS.urlParityRegister,
          'missing',
        ),
  )
  results.push(
    blogListingRow
      ? pass(
          'Blog Listing URL audit item',
          '/blogs/teavision-blogs',
          `${blogListingRow.Decision}; ${blogListingRow.Status}`,
        )
      : fail(
          'Blog Listing URL audit item',
          '/blogs/teavision-blogs',
          'missing /blog app-owned redirect row',
        ),
  )
  results.push(
    remediation.includes('### Blog Listing URL') &&
      remediation.includes('Implemented 2026-07-13')
      ? pass(
          'Blog Listing URL implementation evidence',
          SOURCE_PATHS.auditRemediation,
          '/blog implementation recorded',
        )
      : fail(
          'Blog Listing URL implementation evidence',
          SOURCE_PATHS.auditRemediation,
          'missing implemented Blog Listing URL row',
        ),
  )
  results.push(
    ownerExportPath
      ? existsSync(ownerExportPath)
        ? pass('optional owner migration export', ownerExportPath, 'found')
        : warn(
            'optional owner migration export',
            ownerExportPath,
            'path set but file is missing',
          )
      : warn(
          'optional owner migration export',
          'SEO_URL_MIGRATION_EXPORT',
          'missing optional owner export',
        ),
  )

  for (const row of appOwnedRows) {
    const source = row['Source URL'] ?? ''
    const target = row['Target URL'] ?? ''
    const evidence1 = row['Evidence source 1'] ?? ''
    const evidence2 = row['Evidence source 2'] ?? ''
    const missing = []

    if (!source) missing.push('Source URL')
    if (!target) missing.push('Target URL')
    if (!evidence1) missing.push('Evidence source 1')
    if (!evidence2) missing.push('Evidence source 2')

    results.push(
      missing.length === 0
        ? pass(
            'app-owned redirect evidence',
            source,
            `${target}; two-source confirmation present`,
          )
        : fail(
            'app-owned redirect evidence',
            source || 'unknown source',
            `missing ${missing.join(', ')}`,
          ),
    )
  }

  const appOwnedRegisterKeys = new Set(
    appOwnedRows.map(
      (row) =>
        `${normalizeRegisterPath(row['Source URL'] ?? '')}\u0000${normalizeRegisterPath(
          row['Target URL'] ?? '',
        )}`,
    ),
  )

  for (const redirect of getCodedRedirectsForAudit()) {
    const key = `${redirect.source}\u0000${redirect.target}`

    results.push(
      appOwnedRegisterKeys.has(key)
        ? pass(
            'coded redirect register row',
            redirect.source,
            `registered -> ${redirect.target}`,
          )
        : fail(
            'coded redirect register row',
            redirect.source,
            `missing register row for ${redirect.target}`,
          ),
    )
  }

  return results
}

async function runDisabledMode(baseUrl) {
  const expectations = materializeExpectations()
  const results = []
  const { response: robotsResponse, text: robotsText } = await fetchText(
    baseUrl,
    '/robots.txt',
  )
  const { response: sitemapResponse, text: sitemapText } = await fetchText(
    baseUrl,
    '/sitemap.xml',
  )

  results.push(
    robotsResponse.ok
      ? pass(
          'disabled robots fetch',
          '/robots.txt',
          `status ${robotsResponse.status}`,
        )
      : fail(
          'disabled robots fetch',
          '/robots.txt',
          `status ${robotsResponse.status}`,
        ),
  )
  results.push(
    !/^\s*Sitemap:/im.test(robotsText)
      ? pass(
          'disabled robots sitemap omission',
          '/robots.txt',
          'no Sitemap line',
        )
      : fail(
          'disabled robots sitemap omission',
          '/robots.txt',
          'Sitemap line present',
        ),
  )

  const missingDisallows = getMissingRobotsDisallows(robotsText)
  results.push(
    missingDisallows.length === 0
      ? pass(
          'disabled robots account disallows',
          '/robots.txt',
          REQUIRED_ROBOTS_DISALLOWS.join(', '),
        )
      : fail(
          'disabled robots account disallows',
          '/robots.txt',
          `missing ${missingDisallows.join(', ')}`,
        ),
  )

  const sitemapLocs = getLocPaths(sitemapText)
  results.push(
    sitemapResponse.ok || sitemapResponse.status === 404
      ? pass(
          'disabled sitemap fetch',
          '/sitemap.xml',
          `status ${sitemapResponse.status}`,
        )
      : fail(
          'disabled sitemap fetch',
          '/sitemap.xml',
          `status ${sitemapResponse.status}`,
        ),
  )
  results.push(
    sitemapLocs.length === 0
      ? pass('disabled sitemap URL count', '/sitemap.xml', '0 URLs')
      : fail(
          'disabled sitemap URL count',
          '/sitemap.xml',
          `${sitemapLocs.length} URLs found`,
        ),
  )

  for (const expectation of expectations.legal.slice(0, 2)) {
    const { response, text } = await fetchText(baseUrl, expectation.path)
    const ok = response.ok && hasNoindexMeta(text)
    results.push(
      ok
        ? pass(
            'disabled route noindex metadata',
            expectation.path,
            'noindex present',
          )
        : fail(
            'disabled route noindex metadata',
            expectation.path,
            `status ${response.status}; noindex ${hasNoindexMeta(text)}`,
          ),
    )
  }

  return results
}

async function runEnabledMode(baseUrl, productPath, productPathSource) {
  const expectations = materializeExpectations()
  const results = []
  const sitemapExpectations = expectations.all.filter(
    (expectation) => expectation.shouldAppearInSitemap,
  )
  const { response: robotsResponse, text: robotsText } = await fetchText(
    baseUrl,
    '/robots.txt',
  )
  const { response: sitemapResponse, text: sitemapText } = await fetchText(
    baseUrl,
    '/sitemap.xml',
  )
  const sitemapLocs = getLocPaths(sitemapText)

  results.push(
    robotsResponse.ok
      ? pass(
          'enabled robots fetch',
          '/robots.txt',
          `status ${robotsResponse.status}`,
        )
      : fail(
          'enabled robots fetch',
          '/robots.txt',
          `status ${robotsResponse.status}`,
        ),
  )
  results.push(
    /^\s*Sitemap:/im.test(robotsText)
      ? pass(
          'enabled robots sitemap line',
          '/robots.txt',
          'Sitemap line present',
        )
      : fail(
          'enabled robots sitemap line',
          '/robots.txt',
          'Sitemap line missing',
        ),
  )
  const missingDisallows = getMissingRobotsDisallows(robotsText)
  results.push(
    missingDisallows.length === 0
      ? pass(
          'enabled robots account disallows',
          '/robots.txt',
          REQUIRED_ROBOTS_DISALLOWS.join(', '),
        )
      : fail(
          'enabled robots account disallows',
          '/robots.txt',
          `missing ${missingDisallows.join(', ')}`,
        ),
  )
  results.push(
    sitemapResponse.ok
      ? pass(
          'enabled sitemap fetch',
          '/sitemap.xml',
          `status ${sitemapResponse.status}`,
        )
      : fail(
          'enabled sitemap fetch',
          '/sitemap.xml',
          `status ${sitemapResponse.status}`,
        ),
  )
  results.push(
    sitemapLocs.some((path) => /\/blogs\/[^/]+\/tagged\//.test(path))
      ? fail(
          'enabled sitemap tagged blog exclusion',
          '/sitemap.xml',
          'tagged blog URL found',
        )
      : pass(
          'enabled sitemap tagged blog exclusion',
          '/sitemap.xml',
          'no tagged blog URLs',
        ),
  )

  const { response: homeResponse, text: homeText } = await fetchText(
    baseUrl,
    '/',
  )
  const htmlLang = getHtmlLang(homeText)
  results.push(
    homeResponse.ok && htmlLang === 'en-AU'
      ? pass('root html language', '/', htmlLang)
      : fail(
          'root html language',
          '/',
          `status ${homeResponse.status}; lang ${htmlLang ?? 'missing'}`,
        ),
  )

  for (const expectation of sitemapExpectations) {
    results.push(
      sitemapLocs.includes(expectation.path)
        ? pass('enabled sitemap path', expectation.path, 'present')
        : fail('enabled sitemap path', expectation.path, 'missing'),
    )
  }

  for (const expectation of expectations.redirects) {
    if (isPatternPath(expectation.path)) {
      results.push(
        warn(
          'redirect live check',
          expectation.path,
          'skipped pattern redirect; source-mode probe covers this rule',
        ),
      )
      continue
    }

    const { response } = await fetchText(baseUrl, expectation.path, {
      redirect: 'manual',
    })
    const location = response.headers.get('location') ?? ''
    const locationPath = location ? new URL(location, baseUrl).pathname : ''
    const ok =
      response.status === expectation.expectedStatus &&
      locationPath === expectation.canonicalPath

    results.push(
      ok
        ? pass(
            'policy redirect live check',
            expectation.path,
            `${response.status} -> ${locationPath}`,
          )
        : fail(
            'policy redirect live check',
            expectation.path,
            `${response.status} -> ${locationPath || 'no location'}`,
          ),
    )
  }

  for (const expectation of [
    ...expectations.static,
    ...expectations.legal,
  ].filter((candidate) => candidate.shouldIndexWhenEnabled)) {
    const { response, text } = await fetchText(baseUrl, expectation.path)
    const canonicalPath = getCanonicalHref(text, baseUrl)
    const hasNoindex = hasNoindexMeta(text)
    const ok =
      response.ok && canonicalPath === expectation.canonicalPath && !hasNoindex

    results.push(
      ok
        ? pass(
            'enabled canonical and indexability live check',
            expectation.path,
            canonicalPath,
          )
        : fail(
            'enabled canonical and indexability live check',
            expectation.path,
            `status ${response.status}; canonical ${canonicalPath ?? 'missing'}; noindex ${hasNoindex}`,
          ),
    )
  }

  results.push(...(await probeStructuredDataRoutes(baseUrl)))
  results.push(
    ...(await probeProductStructuredData(
      baseUrl,
      productPath,
      productPathSource,
    )),
  )

  return results
}

async function probeStructuredDataRoutes(baseUrl) {
  const results = []

  for (const expectation of STRUCTURED_DATA_ROUTE_EXPECTATIONS) {
    try {
      const { response, text } = await fetchText(baseUrl, expectation.path)

      if (!response.ok) {
        for (const schemaType of expectation.requiredSchemaTypes) {
          results.push(
            fail(
              `${schemaType} structured data`,
              expectation.path,
              `status ${response.status}`,
            ),
          )
        }
        continue
      }

      const values = extractJsonLd(text)

      for (const schemaType of expectation.requiredSchemaTypes) {
        results.push(
          findSchemaNodes(values, schemaType).length > 0
            ? pass(
                `${schemaType} structured data`,
                expectation.path,
                `${schemaType} JSON-LD parsed`,
              )
            : fail(
                `${schemaType} structured data`,
                expectation.path,
                `${schemaType} JSON-LD not found`,
              ),
        )
      }
    } catch (error) {
      for (const schemaType of expectation.requiredSchemaTypes) {
        results.push(
          fail(
            `${schemaType} structured data`,
            expectation.path,
            formatError(error),
          ),
        )
      }
    }
  }

  return results
}

function isProductNotFoundResponse(response, html) {
  return response.status === 404 || /\bProduct not found\b/i.test(html)
}

function isDefaultFixtureProductPath(path, productPathSource) {
  return productPathSource === 'default' && path === DEFAULT_PRODUCT_PATH
}

export async function probeProductStructuredData(
  baseUrl,
  productPath,
  productPathSource = 'default',
) {
  const normalizedPath = productPath.trim()

  if (!normalizedPath) {
    return [
      fail(
        'product structured data',
        'SEO_PROBE_PRODUCT_PATH',
        'missing required product path for enabled SEO verification',
      ),
    ]
  }

  const path = normalizedPath.startsWith('/')
    ? normalizedPath
    : `/${normalizedPath}`

  try {
    const { response, text } = await fetchText(baseUrl, path)

    if (isProductNotFoundResponse(response, text)) {
      const detail = isDefaultFixtureProductPath(path, productPathSource)
        ? 'default fixture product route not found for this data source; run the fake-provider production lifecycle or pass --product-path/SEO_PROBE_PRODUCT_PATH for a product that exists'
        : 'product route not found for selected data source; pass --product-path or SEO_PROBE_PRODUCT_PATH for a product that exists'

      return [
        isDefaultFixtureProductPath(path, productPathSource)
          ? warn('product structured data', path, detail)
          : fail('product structured data', path, detail),
      ]
    }

    if (!response.ok && !hasShopifyCredentials()) {
      return [
        warn(
          'product structured data',
          path,
          `skipped; status ${response.status} and Shopify credentials are absent`,
        ),
      ]
    }

    const values = extractJsonLd(text)
    const hasProduct = hasProductJsonLd(values)
    const hasAggregateRating = hasProductAggregateRating(values)
    const hasVisibleReviews = hasVisibleProductReviewSummary(text)
    const results = [
      hasProduct
        ? pass('product structured data', path, 'Product JSON-LD parsed')
        : fail('product structured data', path, 'Product JSON-LD not found'),
    ]

    if (!hasProduct) return results

    results.push(
      hasVisibleReviews && hasAggregateRating
        ? pass(
            'product aggregateRating structured data',
            path,
            'AggregateRating JSON-LD matches visible review summary',
          )
        : hasVisibleReviews
          ? fail(
              'product aggregateRating structured data',
              path,
              'visible review summary exists but Product aggregateRating is missing',
            )
          : hasAggregateRating
            ? fail(
                'product aggregateRating structured data',
                path,
                'Product aggregateRating present without visible review summary',
              )
            : warn(
                'product aggregateRating structured data',
                path,
                'skipped; no reliable visible review data detected',
              ),
    )

    return results
  } catch (error) {
    if (!hasShopifyCredentials()) {
      return [
        warn(
          'product structured data',
          path,
          `skipped; Shopify credentials are absent (${formatError(error)})`,
        ),
      ]
    }

    return [fail('product structured data', path, formatError(error))]
  }
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

function hasFailures(results) {
  return results.some((result) => result.status === 'FAIL')
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  const baseUrl = parseBaseUrl(args.baseUrl)
  const results =
    args.mode === 'runbook'
      ? runRunbookMode()
      : args.mode === 'url-audit'
        ? runUrlAuditMode()
        : args.mode === 'redirects'
          ? runRedirectsMode()
          : args.mode === 'disabled'
            ? await runDisabledMode(baseUrl)
            : await runEnabledMode(
                baseUrl,
                args.productPath,
                args.productPathSource,
              )

  printResults(results)

  if (hasFailures(results)) {
    process.exitCode = 1
  }
}

function isDirectExecution() {
  return (
    Boolean(process.argv[1]) &&
    import.meta.url === pathToFileURL(process.argv[1]).href
  )
}

if (isDirectExecution()) {
  try {
    await main()
  } catch (error) {
    console.error(formatError(error))
    process.exitCode = 1
  }
}
