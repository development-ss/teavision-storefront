import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

import * as tailwindcss from 'tailwindcss'
import ts from 'typescript'

const require = createRequire(import.meta.url)

const roots = ['src', '.storybook']
const ignoredDirectories = new Set([
  '.git',
  '.next',
  'node_modules',
  'storybook-static',
])
const extensions = new Set(['.js', '.jsx', '.ts', '.tsx'])
const classHelperNames = new Set(['cn', 'clsx', 'cx', 'twMerge'])
const noCssMarkerPattern = /^(group|peer)(\/[a-zA-Z0-9_-]+)?$/
const spacingUtilityNames = new Set([
  'basis',
  'bottom',
  'end',
  'gap',
  'gap-x',
  'gap-y',
  'h',
  'inset',
  'inset-x',
  'inset-y',
  'left',
  'm',
  'max-h',
  'max-w',
  'mb',
  'me',
  'min-h',
  'min-w',
  'ml',
  'mr',
  'ms',
  'mt',
  'mx',
  'my',
  'p',
  'pb',
  'pe',
  'pl',
  'pr',
  'ps',
  'pt',
  'px',
  'py',
  'right',
  'scroll-m',
  'scroll-mb',
  'scroll-me',
  'scroll-ml',
  'scroll-mr',
  'scroll-ms',
  'scroll-mt',
  'scroll-mx',
  'scroll-my',
  'scroll-p',
  'scroll-pb',
  'scroll-pe',
  'scroll-pl',
  'scroll-pr',
  'scroll-ps',
  'scroll-pt',
  'scroll-px',
  'scroll-py',
  'size',
  'space-x',
  'space-y',
  'start',
  'top',
  'translate-x',
  'translate-y',
  'w',
])
const canonicalSpacingExceptions = new Set([
  path.join('src', 'app', '(storefront)', 'account', 'layout.tsx'),
  path.join('src', 'app', '(storefront)', 'account', 'loading.tsx'),
  path.join('src', 'app', '(storefront)', 'account', 'login', 'page.tsx'),
  path.join('src', 'app', '(storefront)', 'account', 'page.tsx'),
])
const canonicalSpacingExceptionTokens = new Set([
  'min-h-[34rem]',
  'md:min-h-[32rem]',
])

function splitClasses(value) {
  return value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
}

function lineOf(sourceFile, node) {
  return (
    sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
  )
}

function propertyNameText(name) {
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return null
}

function calleeName(expression) {
  if (ts.isIdentifier(expression)) return expression.text
  if (ts.isPropertyAccessExpression(expression)) return expression.name.text
  return null
}

function addClasses(value, sourceFile, filePath, node, results) {
  for (const token of splitClasses(value)) {
    results.push({
      filePath,
      line: lineOf(sourceFile, node),
      token,
    })
  }
}

function collectClassExpression(
  node,
  sourceFile,
  filePath,
  results,
  options = {},
) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    addClasses(node.text, sourceFile, filePath, node, results)
    return
  }

  if (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isTypeAssertionExpression(node)
  ) {
    collectClassExpression(
      node.expression,
      sourceFile,
      filePath,
      results,
      options,
    )
    return
  }

  if (ts.isConditionalExpression(node)) {
    collectClassExpression(
      node.whenTrue,
      sourceFile,
      filePath,
      results,
      options,
    )
    collectClassExpression(
      node.whenFalse,
      sourceFile,
      filePath,
      results,
      options,
    )
    return
  }

  if (ts.isArrayLiteralExpression(node)) {
    for (const element of node.elements) {
      collectClassExpression(element, sourceFile, filePath, results, options)
    }
    return
  }

  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue

      if (options.objectKeysAreClasses) {
        collectObjectKeyClass(property.name, sourceFile, filePath, results)
      }

      collectClassExpression(
        property.initializer,
        sourceFile,
        filePath,
        results,
        options,
      )
    }
    return
  }

  if (ts.isCallExpression(node)) {
    collectCallExpression(node, sourceFile, filePath, results)
  }
}

function collectObjectKeyClass(name, sourceFile, filePath, results) {
  if (!ts.isStringLiteral(name) && !ts.isIdentifier(name)) return
  addClasses(name.text, sourceFile, filePath, name, results)
}

function collectCvaConfig(node, sourceFile, filePath, results) {
  if (!ts.isObjectLiteralExpression(node)) return

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue

    const name = propertyNameText(property.name)
    if (!name || name === 'defaultVariants') continue

    if (name === 'variants') {
      collectClassExpression(
        property.initializer,
        sourceFile,
        filePath,
        results,
      )
      continue
    }

    if (name === 'compoundVariants') {
      collectCompoundVariants(
        property.initializer,
        sourceFile,
        filePath,
        results,
      )
      continue
    }

    if (name === 'class' || name === 'className') {
      collectClassExpression(
        property.initializer,
        sourceFile,
        filePath,
        results,
      )
    }
  }
}

function collectCompoundVariants(node, sourceFile, filePath, results) {
  if (!ts.isArrayLiteralExpression(node)) return

  for (const element of node.elements) {
    if (!ts.isObjectLiteralExpression(element)) continue

    for (const property of element.properties) {
      if (!ts.isPropertyAssignment(property)) continue
      const name = propertyNameText(property.name)
      if (name !== 'class' && name !== 'className') continue

      collectClassExpression(
        property.initializer,
        sourceFile,
        filePath,
        results,
      )
    }
  }
}

function collectCallExpression(node, sourceFile, filePath, results) {
  const name = calleeName(node.expression)

  if (name === 'cva') {
    const [baseClasses, config] = node.arguments
    if (baseClasses) {
      collectClassExpression(baseClasses, sourceFile, filePath, results)
    }
    if (config) {
      collectCvaConfig(config, sourceFile, filePath, results)
    }
    return
  }

  if (!classHelperNames.has(name ?? '')) return

  for (const argument of node.arguments) {
    collectClassExpression(argument, sourceFile, filePath, results, {
      objectKeysAreClasses: true,
    })
  }
}

function collectFromSource(filePath, sourceText) {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') || filePath.endsWith('.jsx')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS,
  )
  const results = []

  function visit(node) {
    if (
      ts.isJsxAttribute(node) &&
      node.name.text === 'className' &&
      node.initializer
    ) {
      if (ts.isStringLiteral(node.initializer)) {
        collectClassExpression(node.initializer, sourceFile, filePath, results)
      } else if (
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression
      ) {
        collectClassExpression(
          node.initializer.expression,
          sourceFile,
          filePath,
          results,
        )
      }
    }

    if (ts.isCallExpression(node)) {
      collectCallExpression(node, sourceFile, filePath, results)
    }

    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      /CLASS(?:_?NAME|ES)?$/.test(node.name.text) &&
      node.initializer
    ) {
      collectClassExpression(node.initializer, sourceFile, filePath, results)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return results
}

async function walkDirectory(directory, files = []) {
  let entries
  try {
    entries = await fs.readdir(directory, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue

    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      await walkDirectory(fullPath, files)
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

async function filesToCheck() {
  const requestedFiles = process.argv.slice(2)
  const globalsPath = path.normalize(path.join('src', 'app', 'globals.css'))
  const scansDesignSystem = requestedFiles.some(
    (filePath) =>
      path.normalize(path.relative(process.cwd(), path.resolve(filePath))) ===
      globalsPath,
  )

  if (requestedFiles.length === 0 || scansDesignSystem) {
    return (await Promise.all(roots.map((root) => walkDirectory(root)))).flat()
  }

  const files = await Promise.all(
    requestedFiles.map(async (filePath) => {
      const relativePath = path.normalize(
        path.relative(process.cwd(), path.resolve(filePath)),
      )
      const isSourceFile =
        roots.some(
          (root) =>
            relativePath === root ||
            relativePath.startsWith(`${root}${path.sep}`),
        ) && extensions.has(path.extname(relativePath))

      if (!isSourceFile) return null

      try {
        const stats = await fs.stat(relativePath)
        return stats.isFile() ? relativePath : null
      } catch {
        return null
      }
    }),
  )

  return [...new Set(files.filter(Boolean))]
}

async function loadDesignSystem() {
  const cssPath = path.resolve('src/app/globals.css')
  const css = await fs.readFile(cssPath, 'utf8')

  return tailwindcss.__unstable__loadDesignSystem(css, {
    base: process.cwd(),
    async loadStylesheet(id, base) {
      const stylesheetPath =
        id === 'tailwindcss'
          ? require.resolve('tailwindcss/index.css')
          : path.resolve(base, id)

      return {
        path: stylesheetPath,
        base: path.dirname(stylesheetPath),
        content: await fs.readFile(stylesheetPath, 'utf8'),
      }
    },
    async loadModule() {
      throw new Error(
        'JavaScript Tailwind plugins are not supported by this check.',
      )
    },
  })
}

function normalizeToken(token) {
  return token.replace(/[),;]+$/, '')
}

function isKnownNoCssMarker(token) {
  return noCssMarkerPattern.test(token)
}

function splitVariantPrefix(token) {
  let bracketDepth = 0
  let lastSeparator = -1

  for (let index = 0; index < token.length; index += 1) {
    const character = token[index]
    if (character === '[') bracketDepth += 1
    if (character === ']') bracketDepth = Math.max(0, bracketDepth - 1)
    if (character === ':' && bracketDepth === 0) lastSeparator = index
  }

  if (lastSeparator === -1) {
    return { prefix: '', base: token }
  }

  return {
    prefix: token.slice(0, lastSeparator + 1),
    base: token.slice(lastSeparator + 1),
  }
}

function formatSpacingNumber(value) {
  const rounded = Math.round(value * 10000) / 10000
  if (Math.abs(value - rounded) > Number.EPSILON * 100) return null

  return rounded
    .toFixed(4)
    .replace(/\.?0+$/, '')
    .replace(/^-0$/, '0')
}

function canonicalizeSpacingCandidate(token, design) {
  const { prefix, base } = splitVariantPrefix(token)
  const match = /^(-?)([a-z][a-z0-9-]*)-\[(-?\d+(?:\.\d+)?)(px|rem)\]$/.exec(
    base,
  )

  if (!match) return null

  const [, negativePrefix, utilityName, rawValue, unit] = match
  if (!spacingUtilityNames.has(utilityName)) return null

  const numericValue = Number(rawValue)
  const spacingUnits = unit === 'px' ? numericValue / 4 : numericValue * 4
  const formattedValue = formatSpacingNumber(Math.abs(spacingUnits))
  if (!formattedValue) return null

  const isNegative = negativePrefix === '-' || spacingUnits < 0
  const canonicalToken = `${prefix}${isNegative ? '-' : ''}${utilityName}-${formattedValue}`

  if (canonicalToken === token) return null
  if (design.candidatesToCss([canonicalToken])[0] == null) return null

  return canonicalToken
}

function formatIssue(issue) {
  return `${issue.filePath}:${issue.line} ${issue.message}`
}

function isCanonicalSpacingException(candidate, token) {
  return (
    canonicalSpacingExceptions.has(path.normalize(candidate.filePath)) &&
    canonicalSpacingExceptionTokens.has(token)
  )
}

const design = await loadDesignSystem()
const files = await filesToCheck()
const invalid = []
const canonical = []
const seen = new Set()

for (const filePath of files) {
  const sourceText = await fs.readFile(filePath, 'utf8')

  for (const candidate of collectFromSource(filePath, sourceText)) {
    const token = normalizeToken(candidate.token)
    if (!token || token.includes('${') || token.startsWith('http')) continue

    const key = `${candidate.filePath}:${candidate.line}:${token}`
    if (seen.has(key)) continue
    seen.add(key)

    const css = design.candidatesToCss([token])[0]
    if (css == null && !isKnownNoCssMarker(token)) {
      invalid.push({
        ...candidate,
        token,
        message: `invalid Tailwind class "${token}"`,
      })
      continue
    }

    const designCanonicalToken = design.canonicalizeCandidates([token])[0]
    const canonicalToken =
      designCanonicalToken !== token
        ? designCanonicalToken
        : canonicalizeSpacingCandidate(token, design)

    if (
      canonicalToken &&
      canonicalToken !== token &&
      !isCanonicalSpacingException(candidate, token)
    ) {
      canonical.push({
        ...candidate,
        token,
        message: `"${token}" can be written as "${canonicalToken}"`,
      })
    }
  }
}

if (invalid.length > 0 || canonical.length > 0) {
  console.error('Tailwind class check failed.')

  if (canonical.length > 0) {
    console.error('\nCanonical replacements:')
    for (const issue of canonical) {
      console.error(formatIssue(issue))
    }
  }

  if (invalid.length > 0) {
    console.error('\nInvalid classes:')
    for (const issue of invalid) {
      console.error(formatIssue(issue))
    }
  }

  process.exit(1)
}

console.log('Tailwind class check passed.')
