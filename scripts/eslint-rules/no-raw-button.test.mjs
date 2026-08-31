import assert from 'node:assert/strict'
import { test } from 'node:test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)
const configPath = path.join(repoRoot, 'eslint.config.mjs')

async function lintText(code, filePath) {
  const eslint = new ESLint({
    cwd: repoRoot,
    overrideConfigFile: configPath,
  })
  const [result] = await eslint.lintText(code, {
    filePath: path.join(repoRoot, filePath),
  })

  return result.messages
}

test('reports raw button elements in feature components', async () => {
  const messages = await lintText(
    `export function ProductOption() {
      return <button type="button">English Breakfast</button>
    }`,
    'src/components/product/product-form/product-form.tsx',
  )

  assert.ok(
    messages.some((message) => message.ruleId === 'teavision/no-raw-button'),
  )
})

test('reports React.createElement button usage in feature components', async () => {
  const messages = await lintText(
    `import React from 'react'

    export function HeaderTrigger() {
      return React.createElement('button', { type: 'button' }, 'Shop')
    }`,
    'src/components/layout/header/header-mega-nav.tsx',
  )

  assert.ok(
    messages.some((message) => message.ruleId === 'teavision/no-raw-button'),
  )
})

test('allows approved native button primitive implementations', async () => {
  for (const filePath of [
    'src/components/ui/button/button.tsx',
    'src/components/ui/icon-button/icon-button.tsx',
    'src/components/ui/disclosure-button/disclosure-button.tsx',
    'src/components/ui/toggle-button/toggle-button.tsx',
  ]) {
    const messages = await lintText(
      `export function Primitive() {
        return <button type="button">Primitive</button>
      }`,
      filePath,
    )

    assert.equal(
      messages.some((message) => message.ruleId === 'teavision/no-raw-button'),
      false,
      filePath,
    )
  }
})

test('allows the shared Button component to be used', async () => {
  const messages = await lintText(
    `import { Button } from '@/components/ui/button'

    export function HeroCta() {
      return <Button href="/pages/wholesale">Apply for wholesale</Button>
    }`,
    'src/components/homepage/hero/hero.tsx',
  )

  assert.equal(
    messages.some((message) => message.ruleId === 'teavision/no-raw-button'),
    false,
  )
})
