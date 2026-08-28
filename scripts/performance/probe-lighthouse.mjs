import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const DEFAULT_BASE_URL = 'http://127.0.0.1:4173'
export const DEFAULT_ROUTES = [
  '/',
  '/products/test-standard-tea',
  '/collections/all',
  '/cart',
  '/search?q=tea',
  '/account',
  '/pages/privacy-policy',
]

export const THRESHOLDS = {
  cls: 0.1,
  lcpMs: 2500,
  tbtMs: 300,
}

const EVIDENCE_PATH = 'docs/launch/performance-evidence.md'
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const DEFAULT_FAKE_SHOPIFY_PORT = 4517
const DEFAULT_FAKE_CUSTOMER_ACCOUNT_PORT = 4518

export function parseArgs(argv) {
  const args = {
    allowMetricFailures: false,
    assetWarmup: true,
    baseUrl: process.env.PERFORMANCE_PROBE_BASE_URL ?? DEFAULT_BASE_URL,
    jsonSummary: false,
    startServer: false,
    stdoutOnly: false,
    urls: [],
    warmupRuns: 1,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]

    if (value === '--') {
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

    if (value === '--url') {
      const route = argv[index + 1]
      if (route) args.urls.push(route)
      index += 1
      continue
    }

    if (value.startsWith('--url=')) {
      args.urls.push(value.slice('--url='.length))
      continue
    }

    if (value === '--start-server') {
      args.startServer = true
      continue
    }

    if (value === '--allow-metric-failures') {
      args.allowMetricFailures = true
      continue
    }

    if (value === '--no-asset-warmup') {
      args.assetWarmup = false
      continue
    }

    if (value === '--warmup-runs') {
      args.warmupRuns = parseWarmupRuns(argv[index + 1])
      index += 1
      continue
    }

    if (value.startsWith('--warmup-runs=')) {
      args.warmupRuns = parseWarmupRuns(value.slice('--warmup-runs='.length))
      continue
    }

    if (value === '--cold-run') {
      args.warmupRuns = 0
      continue
    }

    if (value === '--json-summary') {
      args.jsonSummary = true
      continue
    }

    if (value === '--stdout-only') {
      args.stdoutOnly = true
      continue
    }

    if (!value.startsWith('--')) {
      args.baseUrl = value
    }
  }

  return {
    ...args,
    routes: args.urls.length > 0 ? args.urls : DEFAULT_ROUTES,
  }
}

function parseWarmupRuns(value) {
  const raw = String(value ?? '')

  if (!/^\d+$/.test(raw)) {
    throw new Error(`Invalid --warmup-runs value: ${value}`)
  }

  return Number.parseInt(raw, 10)
}

function assertBaseUrl(value) {
  try {
    return new URL(value)
  } catch {
    throw new Error(`Invalid base URL: ${value}`)
  }
}

export function getPortFromBaseUrl(baseUrl) {
  const url = assertBaseUrl(baseUrl)
  const explicitPort = Number(url.port)

  if (Number.isFinite(explicitPort) && explicitPort > 0) {
    return explicitPort
  }

  if (url.protocol === 'https:') return 443
  if (url.protocol === 'http:') return 80

  return 4173
}

export function getProductionLifecycleCommands({
  baseUrl = DEFAULT_BASE_URL,
  disableIndexing = true,
  fakeCustomerAccountPort = DEFAULT_FAKE_CUSTOMER_ACCOUNT_PORT,
  fakeShopifyPort = DEFAULT_FAKE_SHOPIFY_PORT,
} = {}) {
  const port = getPortFromBaseUrl(baseUrl)
  const fakeShopifyUrl = `http://127.0.0.1:${fakeShopifyPort}/graphql`
  const fakeCustomerAccountUrl = `http://127.0.0.1:${fakeCustomerAccountPort}`

  const nextEnv = {
    DISABLE_INDEXING: disableIndexing ? 'true' : 'false',
    NEXT_PUBLIC_ANALYTICS_MODE: 'fake',
    NEXT_PUBLIC_SEARCHANISE_API_KEY: '',
    NEXT_PUBLIC_SEARCHANISE_ENABLED: 'false',
    PLAYWRIGHT_PORT: String(port),
    PLAYWRIGHT_PRODUCTION_TEST_MODE: 'true',
    RATE_LIMIT_ALLOW_MEMORY_FALLBACK: 'true',
    RATE_LIMIT_TRUSTED_IP_HEADER: 'x-forwarded-for',
    SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID: 'test-client-id',
    SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_REDIRECT_URI: `${baseUrl}/account/login`,
    SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI: `${baseUrl}/account/callback`,
    SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET:
      'test-session-secret-with-at-least-32-characters',
    SHOPIFY_CUSTOMER_ACCOUNT_TEST_MODE: 'true',
    SHOPIFY_CUSTOMER_ACCOUNT_TEST_URL: fakeCustomerAccountUrl,
    SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'test-token',
    SHOPIFY_ADMIN_TEST_MODE: 'true',
    SHOPIFY_ADMIN_TEST_URL: fakeShopifyUrl,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: 'test-token',
    SHOPIFY_STOREFRONT_TEST_MODE: 'true',
    SHOPIFY_STOREFRONT_TEST_URL: fakeShopifyUrl,
    SHOPIFY_STORE_DOMAIN: 'fake-shopify.test',
  }

  return [
    {
      args: ['--import', 'tsx', 'tests/mocks/run-fake-shopify-server.ts'],
      command: 'node',
      env: { FAKE_SHOPIFY_PORT: String(fakeShopifyPort) },
      kind: 'server',
      name: 'fake Shopify',
      waitUrl: `http://127.0.0.1:${fakeShopifyPort}/health`,
    },
    {
      args: [
        '--import',
        'tsx',
        'tests/mocks/run-customer-account-api-server.ts',
      ],
      command: 'node',
      env: { FAKE_CUSTOMER_ACCOUNT_PORT: String(fakeCustomerAccountPort) },
      kind: 'server',
      name: 'fake Customer Account API',
      waitUrl: `${fakeCustomerAccountUrl}/.well-known/openid-configuration`,
    },
    {
      args: ['pnpm', 'exec', 'next', 'build'],
      command: 'corepack',
      env: nextEnv,
      kind: 'command',
      name: 'next build',
    },
    {
      args: ['pnpm', 'exec', 'next', 'start', '-p', String(port)],
      command: 'corepack',
      env: nextEnv,
      kind: 'server',
      name: 'next start',
      waitUrl: baseUrl,
    },
  ]
}

function spawnChild(step, stdio = 'inherit') {
  return spawn(step.command, step.args, {
    detached: process.platform !== 'win32',
    env: { ...process.env, ...step.env },
    shell: process.platform === 'win32',
    stdio,
  })
}

function waitForExit(child, label) {
  return new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${label} exited with ${signal ?? `code ${code}`}`))
    })
  })
}

async function waitForUrl(url, label, timeoutMs = 120_000) {
  const deadline = Date.now() + timeoutMs
  let lastError = ''

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
      lastError = `status ${response.status}`
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  throw new Error(`${label} did not become ready at ${url}: ${lastError}`)
}

function hasChildExited(child) {
  return child.exitCode !== null || child.signalCode !== null
}

function waitForChildExit(
  child,
  { clearTimeoutImpl, onTimeout, setTimeoutImpl, timeoutMs },
) {
  if (hasChildExited(child)) return Promise.resolve()

  return new Promise((resolve) => {
    let complete = false
    const timer = setTimeoutImpl(() => {
      onTimeout()
    }, timeoutMs)

    const finish = () => {
      if (complete) return
      complete = true
      clearTimeoutImpl(timer)
      resolve()
    }

    child.on('exit', finish)
    child.on('error', finish)
  })
}

function signalChildTree(child, signal, { killProcessImpl, platform }) {
  if (platform !== 'win32' && child.pid) {
    try {
      killProcessImpl(-child.pid, signal)
      return
    } catch {
      // Fall back to direct child signaling when no process group exists.
    }
  }

  child.kill(signal)
}

export function createStopChild({
  clearTimeoutImpl = clearTimeout,
  killProcessImpl = process.kill,
  platform = process.platform,
  setTimeoutImpl = setTimeout,
  spawnImpl = spawn,
  timeoutMs = 5000,
} = {}) {
  return async function stopChild(child) {
    if (hasChildExited(child)) return

    const exitPromise = waitForChildExit(child, {
      clearTimeoutImpl,
      onTimeout: () =>
        signalChildTree(child, 'SIGKILL', { killProcessImpl, platform }),
      setTimeoutImpl,
      timeoutMs,
    })

    if (platform === 'win32') {
      await new Promise((resolve) => {
        const killer = spawnImpl(
          'taskkill',
          ['/pid', String(child.pid), '/T', '/F'],
          {
            stdio: 'ignore',
          },
        )
        killer.on('exit', resolve)
        killer.on('error', resolve)
      })
    } else {
      signalChildTree(child, 'SIGTERM', { killProcessImpl, platform })
    }

    await exitPromise
  }
}

const stopChild = createStopChild()

export async function startProductionLifecycle(baseUrl, options = {}) {
  const commands = getProductionLifecycleCommands({ baseUrl, ...options })
  const children = []

  try {
    for (const step of commands) {
      if (step.kind === 'command') {
        console.log(`Running ${step.command} ${step.args.join(' ')}`)
        await waitForExit(spawnChild(step), step.name)
        continue
      }

      console.log(`Starting ${step.name}`)
      const child = spawnChild(step)
      children.push(child)
      await waitForUrl(step.waitUrl, step.name)
    }
  } catch (error) {
    await stopProductionLifecycle(children)
    throw error
  }

  return {
    async stop() {
      await stopProductionLifecycle(children)
    },
  }
}

async function stopProductionLifecycle(children) {
  await Promise.all([...children].reverse().map((child) => stopChild(child)))
}

function targetUrl(baseUrl, route) {
  try {
    return new URL(route).toString()
  } catch {
    return new URL(route, baseUrl).toString()
  }
}

export function getLighthouseCommand(url) {
  return {
    args: [
      'pnpm',
      'exec',
      'lighthouse',
      url,
      '--output=json',
      '--output-path=stdout',
      '--quiet',
      `--only-categories=${CATEGORIES.join(',')}`,
      '--form-factor=mobile',
      '--chrome-flags=--headless=new',
    ],
    command: 'corepack',
  }
}

function parseJsonOutput(output) {
  const start = output.indexOf('{')
  const end = output.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Lighthouse did not return JSON output')
  }

  return JSON.parse(output.slice(start, end + 1))
}

async function runLighthouse(url) {
  const step = getLighthouseCommand(url)
  const child = spawn(step.command, step.args, {
    env: process.env,
    shell: process.platform === 'win32',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stdout = ''
  let stderr = ''

  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', (chunk) => {
    stdout += chunk
  })
  child.stderr.on('data', (chunk) => {
    stderr += chunk
  })

  await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(
        new Error(
          `Lighthouse failed for ${url}: ${stderr || stdout || signal || code}`,
        ),
      )
    })
  })

  return parseJsonOutput(stdout)
}

function auditNumericValue(lhr, id) {
  const value = lhr.audits?.[id]?.numericValue
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function categoryScore(lhr, id) {
  const value = lhr.categories?.[id]?.score
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value * 100)
    : null
}

function asRecord(value) {
  return value && typeof value === 'object' ? value : null
}

function firstDetailItem(audit) {
  const details = asRecord(audit?.details)
  const items = Array.isArray(details?.items) ? details.items : []
  return asRecord(items[0])
}

function detailItems(audit) {
  const details = asRecord(audit?.details)
  return Array.isArray(details?.items) ? details.items : []
}

function numericValue(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function stringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function findLcpNode(lhr) {
  const legacyItem = firstDetailItem(
    lhr.audits?.['largest-contentful-paint-element'],
  )
  const legacyNode = asRecord(legacyItem?.node)
  if (legacyNode) return { item: legacyItem, node: legacyNode }

  for (const auditId of ['lcp-breakdown-insight', 'lcp-discovery-insight']) {
    for (const item of detailItems(lhr.audits?.[auditId])) {
      const record = asRecord(item)
      if (!record) continue

      if (record.type === 'node') {
        return { item: record, node: record }
      }

      const node = asRecord(record.node)
      if (node) return { item: record, node }
    }
  }

  return { item: null, node: null }
}

function extractLcpElement(lhr) {
  const { node } = findLcpNode(lhr)

  if (!node) return null

  return {
    nodeLabel: stringValue(node.nodeLabel),
    selector: stringValue(node.selector),
    snippet: stringValue(node.snippet),
  }
}

function extractUrlFromSnippet(snippet) {
  const match = snippet?.match(/\s(?:currentSrc|src|href)=["']([^"']+)["']/i)
  return match ? match[1] : null
}

function extractLcpResourceUrl(lhr) {
  const { item, node } = findLcpNode(lhr)
  if (!item) return null

  const directUrl =
    stringValue(item.url) ??
    stringValue(item.source) ??
    stringValue(item.resourceUrl) ??
    stringValue(item.resourceURL)

  if (directUrl) return directUrl

  const request = asRecord(item.request)
  const requestUrl = stringValue(request?.url)
  if (requestUrl) return requestUrl

  return extractUrlFromSnippet(stringValue(node?.snippet))
}

function collectSubpartItems(value, items = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectSubpartItems(item, items)
    return items
  }

  const record = asRecord(value)
  if (!record) return items

  if (typeof record.subpart === 'string') {
    items.push(record)
  }

  collectSubpartItems(record.items, items)
  collectSubpartItems(asRecord(record.subItems)?.items, items)

  return items
}

function extractLcpBreakdown(lhr) {
  const items = collectSubpartItems(
    lhr.audits?.['lcp-breakdown-insight']?.details?.items,
  )
  if (items.length === 0) return null

  const breakdown = {
    elementRenderDelayMs: null,
    resourceLoadDelayMs: null,
    resourceLoadDurationMs: null,
    ttfbMs: null,
  }
  const keys = {
    elementRenderDelay: 'elementRenderDelayMs',
    resourceLoadDelay: 'resourceLoadDelayMs',
    resourceLoadDuration: 'resourceLoadDurationMs',
    timeToFirstByte: 'ttfbMs',
  }

  for (const item of items) {
    const key = keys[item.subpart]
    if (!key) continue

    const value =
      numericValue(item.duration) ??
      numericValue(item.value) ??
      numericValue(item.numericValue)
    breakdown[key] = value
  }

  return breakdown
}

function extractLayoutShiftSources(lhr) {
  return detailItems(lhr.audits?.['layout-shifts'])
    .map((item) => {
      const record = asRecord(item)
      const node = asRecord(record?.node)

      return {
        nodeLabel: stringValue(node?.nodeLabel),
        score: numericValue(record?.score),
        selector: stringValue(node?.selector),
      }
    })
    .filter(
      (source) =>
        source.nodeLabel !== null ||
        source.selector !== null ||
        source.score !== null,
    )
}

export function calculateStatus(metrics) {
  const missing = []
  const failures = []

  if (metrics.lcpMs === null) {
    missing.push('LCP unavailable')
  } else if (metrics.lcpMs > THRESHOLDS.lcpMs) {
    failures.push(`LCP ${formatDuration(metrics.lcpMs)} exceeds 2500ms`)
  }

  if (metrics.cls === null) {
    missing.push('CLS unavailable')
  } else if (metrics.cls > THRESHOLDS.cls) {
    failures.push(`CLS ${formatCls(metrics.cls)} exceeds 0.1`)
  }

  if (metrics.tbtMs === null) {
    missing.push('TBT unavailable')
  } else if (metrics.tbtMs > THRESHOLDS.tbtMs) {
    failures.push(`TBT ${formatDuration(metrics.tbtMs)} exceeds 300ms`)
  }

  if (metrics.a11yScore === null) {
    missing.push('accessibility score unavailable')
  }

  if (missing.length > 0) {
    return {
      mitigation: `Inconclusive local lab data: ${missing.join(
        '; ',
      )}. Re-run the probe and compare with staging or field data before launch.`,
      status: 'WARN',
    }
  }

  if (failures.length > 0) {
    return {
      mitigation: `${failures.join(
        '; ',
      )}. Preserve LCP image priority, inspect oversized media, and re-run mobile Lighthouse after remediation.`,
      status: 'FAIL',
    }
  }

  return { mitigation: 'None', status: 'PASS' }
}

export function summarizeLhr(route, lhr, { warmedAssetCount = 0 } = {}) {
  const metrics = {
    a11yScore: categoryScore(lhr, 'accessibility'),
    cls: auditNumericValue(lhr, 'cumulative-layout-shift'),
    fcpMs: auditNumericValue(lhr, 'first-contentful-paint'),
    lcpMs: auditNumericValue(lhr, 'largest-contentful-paint'),
    speedIndexMs: auditNumericValue(lhr, 'speed-index'),
    tbtMs: auditNumericValue(lhr, 'total-blocking-time'),
    totalByteWeight: auditNumericValue(lhr, 'total-byte-weight'),
    ttfbMs: auditNumericValue(lhr, 'server-response-time'),
  }
  const result = calculateStatus(metrics)

  return {
    ...metrics,
    finalUrl: lhr.finalDisplayedUrl ?? '',
    lcpBreakdown: extractLcpBreakdown(lhr),
    lcpElement: extractLcpElement(lhr),
    lcpResourceUrl: extractLcpResourceUrl(lhr),
    layoutShiftSources: extractLayoutShiftSources(lhr),
    mitigation: result.mitigation,
    observedUrl: lhr.finalDisplayedUrl ?? '',
    route,
    status: result.status,
    warmedAssetCount,
  }
}

function escapeMarkdownCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function formatDuration(value) {
  return value === null ? 'n/a' : `${Math.round(value)}ms`
}

function formatCls(value) {
  return value === null ? 'n/a' : value.toFixed(3)
}

function formatScore(value) {
  return value === null ? 'n/a' : `${value}`
}

function formatByteWeight(value) {
  return value === null ? 'n/a' : `${Math.round(value)}`
}

export function renderMarkdownTable(rows) {
  const lines = [
    '| Route | LCP | CLS | TBT | A11y | Status | Mitigation |',
    '| --- | ---: | ---: | ---: | ---: | --- | --- |',
  ]

  for (const row of rows) {
    lines.push(
      `| ${escapeMarkdownCell(row.route)} | ${formatDuration(
        row.lcpMs,
      )} | ${formatCls(row.cls)} | ${formatDuration(
        row.tbtMs,
      )} | ${formatScore(row.a11yScore)} | ${row.status} | ${escapeMarkdownCell(
        row.mitigation,
      )} |`,
    )
  }

  return lines.join('\n')
}

function renderRouteList(routes) {
  return routes.map((route) => `- \`${route}\``).join('\n')
}

function renderRemainingMitigations(rows) {
  const misses = rows.filter((row) => row.status !== 'PASS')

  if (misses.length === 0) {
    return 'None - no launch-blocking performance mitigations remain in this local evidence.'
  }

  return misses
    .map(
      (row) =>
        `- \`${row.route}\` ${row.status}: ${row.mitigation} ${formatRouteDiagnosticCause(
          row,
        )}`,
    )
    .join('\n')
}

function renderRouteMetricSummary(row) {
  if (!row) {
    return 'No current route row was recorded in this probe run.'
  }

  return `latest local mobile Lighthouse records ${formatDuration(
    row.lcpMs,
  )} LCP, CLS ${formatCls(row.cls)}, TBT ${formatDuration(
    row.tbtMs,
  )}, accessibility ${formatScore(row.a11yScore)}, and status ${row.status}.`
}

export function buildJsonSummary(rows) {
  const summary = {
    blocking: 0,
    fail: 0,
    pass: 0,
    routes: rows.map((row) => ({
      cls: row.cls,
      lcpMs: row.lcpMs,
      fcpMs: row.fcpMs ?? null,
      lcpBreakdown: row.lcpBreakdown ?? null,
      lcpElement: row.lcpElement ?? null,
      lcpResourceUrl: row.lcpResourceUrl ?? null,
      layoutShiftSources: row.layoutShiftSources ?? [],
      observedUrl: row.observedUrl ?? '',
      route: row.route,
      speedIndexMs: row.speedIndexMs ?? null,
      status: row.status,
      tbtMs: row.tbtMs,
      totalByteWeight: row.totalByteWeight ?? null,
      ttfbMs: row.ttfbMs ?? null,
      warmedAssetCount: row.warmedAssetCount ?? 0,
    })),
    total: rows.length,
    warn: 0,
  }

  for (const row of rows) {
    if (row.status === 'PASS') summary.pass += 1
    if (row.status === 'WARN') summary.warn += 1
    if (row.status === 'FAIL') {
      summary.fail += 1
      summary.blocking += 1
    }
  }

  return summary
}

export function evaluateReadinessRows(
  rows,
  { allowMetricFailures = false } = {},
) {
  const blockingRows = rows.filter((row) => row.status === 'FAIL')
  const shouldFail = blockingRows.length > 0 && !allowMetricFailures

  return {
    blockingRows,
    exitCode: shouldFail ? 1 : 0,
    message: shouldFail
      ? `Performance readiness failed: ${blockingRows.length} route(s) have FAIL metrics.`
      : '',
  }
}

function renderRemediationNotes(rows) {
  const homeRow = rows.find((row) => row.route === '/')
  const productRow = rows.find(
    (row) => row.route === '/products/test-standard-tea',
  )
  const collectionRow = rows.find((row) => row.route === '/collections/all')
  const cartRow = rows.find((row) => row.route === '/cart')
  const searchRow = rows.find((row) => row.route === '/search?q=tea')
  const accountRow = rows.find((row) => row.route === '/account')
  const privacyRow = rows.find((row) => row.route === '/pages/privacy-policy')

  return [
    `- Home hero image uses the launch AVIF with Next 16 \`preload\`, \`sizes="100vw"\`, stable fill dimensions, and normal optimized Image delivery; ${renderRouteMetricSummary(
      homeRow,
    )}`,
    `- PDP gallery preloads only the first gallery image and keeps normal optimized Image delivery without eager loading or high fetch priority; ${renderRouteMetricSummary(
      productRow,
    )}`,
    `- Collection listing keeps the local \`ProductCard\` priority API but renders first-visible cards as Next 16 \`preload={priority}\` using normal optimized Image delivery; ${renderRouteMetricSummary(
      collectionRow,
    )}`,
    `- Cart LCP is text content, not an image resource, so no cosmetic image edit was applied; ${renderRouteMetricSummary(
      cartRow,
    )}`,
    `- Search LCP is trust-strip text content with no LCP resource, so the local miss is documented as render timing rather than image loading; ${renderRouteMetricSummary(
      searchRow,
    )}`,
    `- Account route reserves stable account geometry in the account shell, login bridge, page wrapper, and loading fallback; remaining CLS is on the observed \`/account/login?returnTo=%2Faccount\` bridge and Lighthouse does not expose a shifting node; ${renderRouteMetricSummary(
      accountRow,
    )}`,
    `- Privacy policy LCP is policy copy text with no LCP resource, so no arbitrary image edit was applied; ${renderRouteMetricSummary(
      privacyRow,
    )}`,
    '- The fake Shopify product includes a local rich-media image so `/products/test-standard-tea` exercises the PDP gallery rather than an empty placeholder.',
    '- Remaining LCP misses are recorded as `FAIL` with mitigation instead of being silently passed. Field/staging Core Web Vitals should be used before launch sign-off because this command is local lab evidence.',
  ].join('\n')
}

function formatRouteDiagnosticCause(row) {
  return `LCP diagnostic: element \`${formatLcpElement(
    row.lcpElement,
  )}\`; resource \`${formatNullableDiagnostic(
    row.lcpResourceUrl,
  )}\`; observed URL \`${row.observedUrl || row.finalUrl || 'unknown'}\`.`
}

function formatLcpElement(element) {
  if (!element) return 'Lighthouse did not expose it'

  return (
    element.selector ??
    element.nodeLabel ??
    element.snippet ??
    'Lighthouse did not expose it'
  )
}

function formatNullableDiagnostic(value) {
  return value ?? 'Lighthouse did not expose it'
}

export function renderLcpDiagnostics(rows) {
  const lines = [
    '| Route | LCP Element | LCP Resource | Observed URL |',
    '| --- | --- | --- | --- |',
  ]

  for (const row of rows) {
    lines.push(
      `| ${escapeMarkdownCell(row.route)} | ${escapeMarkdownCell(
        formatLcpElement(row.lcpElement),
      )} | ${escapeMarkdownCell(
        formatNullableDiagnostic(row.lcpResourceUrl),
      )} | ${escapeMarkdownCell(
        row.observedUrl || row.finalUrl || 'Lighthouse did not expose it',
      )} |`,
    )
  }

  return lines.join('\n')
}

function lcpBreakdownEntries(row) {
  const breakdown = row.lcpBreakdown
  if (!breakdown) return []

  return [
    ['server-response', breakdown.ttfbMs],
    ['image-resource', breakdown.resourceLoadDelayMs],
    ['image-resource', breakdown.resourceLoadDurationMs],
    ['render-delay', breakdown.elementRenderDelayMs],
  ].filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
}

function hasMeaningfulLayoutShift(row) {
  if ((row.cls ?? 0) > THRESHOLDS.cls) return true

  return (
    row.layoutShiftSources?.some(
      (source) => typeof source.score === 'number' && source.score > 0.01,
    ) ?? false
  )
}

function derivePrimaryCause(row) {
  if (hasMeaningfulLayoutShift(row)) {
    return 'layout-shift'
  }

  if (
    row.lcpResourceUrl?.includes('/_next/image') ||
    row.lcpResourceUrl?.includes('/images/')
  ) {
    return 'image-resource'
  }

  const entries = lcpBreakdownEntries(row)
  if (entries.length > 0) {
    const [cause] = entries.reduce((largest, current) =>
      current[1] > largest[1] ? current : largest,
    )
    return cause
  }

  if ((row.ttfbMs ?? 0) > 600) return 'server-response'
  if (!row.lcpResourceUrl && row.lcpElement) return 'text-render'

  return 'unknown'
}

export function renderTimingDiagnostics(rows) {
  const lines = [
    '| Route | FCP | LCP | TTFB | Speed Index | Bytes | Primary Cause |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
  ]

  for (const row of rows) {
    lines.push(
      `| ${escapeMarkdownCell(row.route)} | ${formatDuration(
        row.fcpMs ?? null,
      )} | ${formatDuration(row.lcpMs)} | ${formatDuration(
        row.ttfbMs ?? null,
      )} | ${formatDuration(
        row.speedIndexMs ?? null,
      )} | ${formatByteWeight(row.totalByteWeight ?? null)} | ${derivePrimaryCause(
        row,
      )} |`,
    )
  }

  return lines.join('\n')
}

export function renderAssetWarmupDiagnostics(rows) {
  const lines = ['| Route | Warmed Assets |', '| --- | ---: |']

  for (const row of rows) {
    lines.push(
      `| ${escapeMarkdownCell(row.route)} | ${row.warmedAssetCount ?? 0} |`,
    )
  }

  return lines.join('\n')
}

function layoutShiftSourceLabel(source, index) {
  return (
    source.selector ??
    source.nodeLabel ??
    `Lighthouse source ${index + 1} (node unavailable)`
  )
}

function meaningfulLayoutShiftSources(row) {
  if (!hasMeaningfulLayoutShift(row)) return []

  return (row.layoutShiftSources ?? []).filter((source) => {
    if ((row.cls ?? 0) > THRESHOLDS.cls) return true
    return typeof source.score === 'number' && source.score > 0.01
  })
}

export function renderLayoutShiftDiagnostics(rows) {
  const lines = [
    '| Route | CLS | Source | Node Label | Score |',
    '| --- | ---: | --- | --- | ---: |',
  ]

  for (const row of rows) {
    const sources = meaningfulLayoutShiftSources(row)

    for (const [index, source] of sources.entries()) {
      lines.push(
        `| ${escapeMarkdownCell(row.route)} | ${formatCls(
          row.cls,
        )} | ${escapeMarkdownCell(
          layoutShiftSourceLabel(source, index),
        )} | ${escapeMarkdownCell(
          source.nodeLabel ?? 'Lighthouse did not expose it',
        )} | ${formatCls(source.score ?? null)} |`,
      )
    }
  }

  if (lines.length === 2) {
    return 'No meaningful layout-shift sources were exposed by Lighthouse.'
  }

  return lines.join('\n')
}

export function renderEvidenceDocument({
  baseUrl,
  generatedAt = new Date().toISOString(),
  rows,
  routes,
}) {
  return `# Performance Evidence

## Command

\`pnpm test:performance -- --start-server --base-url ${baseUrl}\`

Generated ${generatedAt}. This is local mobile Lighthouse lab evidence against the fake-provider production lifecycle. Lighthouse cannot replace field Core Web Vitals data; it is used here as repeatable launch regression evidence.

For evidence-only local diagnostics that should not block a readiness script, run \`pnpm test:performance -- --allow-metric-failures\`.

By default, the probe performs one warmup fetch per route before measured Lighthouse runs to reduce first-request build/image-cache noise. Use \`--cold-run\` for a zero-warmup diagnostic.

When warmup runs are enabled, route warmup fetches same-origin \`/_next/image\`, \`/_next/static\`, \`/_next/font\`, and \`/images/\` assets discovered from HTML \`src\`, \`srcset\`, and preload \`href\` attributes. Use \`--no-asset-warmup\` to keep HTML warmup but skip asset warmup for cold image-transform diagnostics.

## Representative Routes

${renderRouteList(routes)}

## Mobile Lighthouse Results

${renderMarkdownTable(rows)}

## LCP Diagnostics

${renderLcpDiagnostics(rows)}

## Timing Diagnostics

${renderTimingDiagnostics(rows)}

## Asset Warmup Diagnostics

${renderAssetWarmupDiagnostics(rows)}

## Layout Shift Diagnostics

${renderLayoutShiftDiagnostics(rows)}

## Launch Blocking Status

${renderLaunchBlockingStatus(rows)}

## UX And Accessibility Polish

- duplicate skip link resolved: production smoke asserts exactly one \`Skip to main content\` link on \`/\`, verifies it receives first-tab focus, and confirms the \`main#main-content\` target exists.
- mobile text wrapping checked: production smoke runs \`/cart\` and a long-query \`/search\` route at a 375px viewport and asserts document width does not exceed viewport width.
- Remaining non-blocking UX/accessibility polish items: None - no launch-blocking UX/accessibility polish items remain.

## Remediation Notes

${renderRemediationNotes(rows)}

## Remaining Mitigations

${renderRemainingMitigations(rows)}
`
}

function renderLaunchBlockingStatus(rows) {
  const blockingRows = rows.filter((row) => row.status === 'FAIL')

  if (blockingRows.length === 0) {
    return 'Launch-blocking: no - strict local Lighthouse evidence has no `FAIL` metric rows.'
  }

  return `Launch-blocking: yes - ${blockingRows.length} strict local Lighthouse route(s) have \`FAIL\` metric rows.`
}

export async function warmupRoutes({
  assetWarmup = true,
  baseUrl,
  fetchImpl = globalThis.fetch,
  routes,
  runs,
}) {
  const warmedAssets = new Map(routes.map((route) => [route, new Set()]))

  if (runs <= 0) {
    return new Map(routes.map((route) => [route, 0]))
  }

  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch is unavailable for performance probe warmup')
  }

  for (let run = 0; run < runs; run += 1) {
    for (const route of routes) {
      const url = targetUrl(baseUrl, route)
      const response = await fetchImpl(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(
          `Warmup fetch failed for ${route}: status ${response.status}`,
        )
      }

      if (!assetWarmup) continue

      const html =
        typeof response.text === 'function' ? await response.text() : ''
      const assetUrls = discoverWarmupAssetUrls(html, url)
      const routeAssets = warmedAssets.get(route)

      for (const assetUrl of assetUrls) {
        routeAssets?.add(assetUrl)
        const assetResponse = await fetchImpl(assetUrl, { cache: 'no-store' })
        if (!assetResponse.ok) {
          throw new Error(
            `Warmup asset fetch failed for ${route}: ${assetUrl} status ${assetResponse.status}`,
          )
        }
      }
    }
  }

  return new Map(
    routes.map((route) => [route, warmedAssets.get(route)?.size ?? 0]),
  )
}

const WARMUP_ASSET_PREFIXES = [
  '/_next/image',
  '/_next/static',
  '/_next/font',
  '/images/',
]

function htmlAttributeValue(value) {
  return value.replaceAll('&amp;', '&').trim()
}

function normalizeWarmupAssetUrl(candidate, pageUrl) {
  if (!candidate) return null

  try {
    const url = new URL(htmlAttributeValue(candidate), pageUrl)
    const page = new URL(pageUrl)

    if (url.origin !== page.origin) return null
    if (
      !WARMUP_ASSET_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
    ) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

function addWarmupCandidate(candidates, candidate, pageUrl) {
  const url = normalizeWarmupAssetUrl(candidate, pageUrl)
  if (url) candidates.add(url)
}

export function discoverWarmupAssetUrls(html, pageUrl) {
  const candidates = new Set()

  for (const tagMatch of html.matchAll(/<[^>]+>/g)) {
    const tag = tagMatch[0]

    const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i)
    if (srcMatch) {
      addWarmupCandidate(candidates, srcMatch[1], pageUrl)
    }

    const srcsetMatch = tag.match(/\ssrcset=["']([^"']+)["']/i)
    if (srcsetMatch) {
      for (const candidate of srcsetMatch[1].split(',')) {
        addWarmupCandidate(
          candidates,
          candidate.trim().split(/\s+/)[0],
          pageUrl,
        )
      }
    }

    const preloadHrefMatch = tag.match(
      /^<link\b(?=[^>]*\brel=["'][^"']*\bpreload\b[^"']*["'])(?=[^>]*\bhref=["']([^"']+)["'])/i,
    )
    if (preloadHrefMatch) {
      addWarmupCandidate(candidates, preloadHrefMatch[1], pageUrl)
    }
  }

  return [...candidates]
}

export async function runProbe(args) {
  const rows = []

  for (const route of args.routes) {
    const url = targetUrl(args.baseUrl, route)
    console.log(`Running mobile Lighthouse for ${route} (${url})`)
    const lhr = await runLighthouse(url)
    rows.push(
      summarizeLhr(route, lhr, {
        warmedAssetCount: args.warmedAssetCounts?.get(route) ?? 0,
      }),
    )
  }

  return rows
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv)
  assertBaseUrl(args.baseUrl)
  let lifecycle = null

  try {
    if (args.startServer) {
      lifecycle = await startProductionLifecycle(args.baseUrl)
    }

    const warmedAssetCounts = await warmupRoutes({
      assetWarmup: args.assetWarmup,
      baseUrl: args.baseUrl,
      routes: args.routes,
      runs: args.warmupRuns,
    })

    const rows = await runProbe({ ...args, warmedAssetCounts })
    const markdown = renderMarkdownTable(rows)
    console.log(markdown)

    if (args.jsonSummary) {
      console.log(JSON.stringify(buildJsonSummary(rows), null, 2))
    }

    if (!args.stdoutOnly) {
      const evidence = renderEvidenceDocument({
        baseUrl: args.baseUrl,
        rows,
        routes: args.routes,
      })
      mkdirSync(dirname(EVIDENCE_PATH), { recursive: true })
      writeFileSync(EVIDENCE_PATH, evidence)
    }

    const readiness = evaluateReadinessRows(rows, args)
    if (readiness.exitCode !== 0) {
      console.error(readiness.message)
      process.exitCode = readiness.exitCode
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
