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

test('reports visual styling classes on Button className', async () => {
  const messages = await lintText(
    `import { Button } from '@/components/ui/button'

    export function HeroCta() {
      return (
        <Button href="/pages/wholesale" className="px-8 text-brand">
          Apply for wholesale
        </Button>
      )
    }`,
    'src/components/homepage/hero/hero.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
  )
})

test('allows layout-only classes on Button className', async () => {
  const messages = await lintText(
    `import { Button } from '@/components/ui/button'

    export function FullWidthCta() {
      return (
        <Button href="/collections" className="mt-8 w-full sm:w-auto">
          Browse products
        </Button>
      )
    }`,
    'src/components/homepage/hero/hero.tsx',
  )

  assert.equal(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
    false,
  )
})

test('reports visual styling classes inside cn calls on Button className', async () => {
  const messages = await lintText(
    `import { Button } from '@/components/ui/button'
    import { cn } from '@/lib/utils'

    export function HeaderTrigger({ open }) {
      return (
        <Button className={cn('mt-2', open && 'text-brand')}>
          Shop
        </Button>
      )
    }`,
    'src/components/layout/header/header-mega-nav.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
  )
})

test('reports dynamic Button className expressions that cannot be checked', async () => {
  const messages = await lintText(
    `import { Button } from '@/components/ui/button'

    export function UnknownCta({ classes }) {
      return <Button className={classes}>Submit</Button>
    }`,
    'src/components/homepage/contact-form/contact-form.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
  )
})

test('reports visual classes on aliased Button imports', async () => {
  const messages = await lintText(
    `import { Button as CtaButton } from '@/components/ui/button'

    export function HeroCta() {
      return <CtaButton className="text-brand">Apply</CtaButton>
    }`,
    'src/components/homepage/hero/hero.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
  )
})

test('reports visual classes on namespaced Button imports', async () => {
  const messages = await lintText(
    `import * as UI from '@/components/ui/button'

    export function HeroCta() {
      return <UI.Button className="text-brand">Apply</UI.Button>
    }`,
    'src/components/homepage/hero/hero.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
  )
})

test('reports visual classes on local aliased Button imports', async () => {
  const messages = await lintText(
    `import { Button as StoryButton } from './button'

    export function ButtonExample() {
      return <StoryButton className="text-brand">Apply</StoryButton>
    }`,
    'src/components/ui/button/button.stories.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-button-style-class',
    ),
  )
})
