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

test('account login bridge keeps the shared account geometry stable', async () => {
  const wrapperFiles = [
    sourcePath('src', 'app', '(storefront)', 'account', 'layout.tsx'),
    sourcePath('src', 'app', '(storefront)', 'account', 'page.tsx'),
    sourcePath(
      'src',
      'app',
      '(storefront)',
      'account',
      '_components',
      'loading',
      'loading.tsx',
    ),
    sourcePath('src', 'app', '(storefront)', 'account', 'login', 'page.tsx'),
    sourcePath('src', 'app', '(storefront)', 'account', 'login', 'loading.tsx'),
  ]
  const wrapperSources = await Promise.all(
    wrapperFiles.map((filePath) => readFile(filePath, 'utf8')),
  )

  for (const source of wrapperSources) {
    assert.match(source, /min-h-136/)
    assert.match(source, /md:min-h-128/)
    assert.doesNotMatch(source, /min-h-\[34rem\]/)
    assert.doesNotMatch(source, /md:min-h-\[32rem\]/)
  }

  const login = wrapperSources[3]
  const loginLoading = wrapperSources[4]
  const loginPanel = await readFile(
    sourcePath(
      'src',
      'app',
      '(storefront)',
      'account',
      '_components',
      'login-panel',
      'login-panel.tsx',
    ),
    'utf8',
  )

  assert.match(loginPanel, /min-h-72/)
  assert.match(loginPanel, /content-start/)
  assert.match(loginPanel, /reloadDocument/)
  assert.doesNotMatch(login, /<Section\.Root/)
  assert.doesNotMatch(login, /<Section\.Container/)
  assert.match(loginLoading, /<LoginPanel/)
  assert.doesNotMatch(loginLoading, /AccountLoading|Skeleton/)
})
