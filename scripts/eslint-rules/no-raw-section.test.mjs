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

test('reports raw section elements in the blog listing route', async () => {
  const messages = await lintText(
    `export function BlogListing() {
      return <section className="bg-surface px-4 py-12" />
    }`,
    'src/app/(storefront)/blogs/[blog]/blog-listing.tsx',
  )

  assert.ok(
    messages.some((message) => message.ruleId === 'teavision/no-raw-section'),
  )
})

test('reports raw section elements in storefront pages', async () => {
  const messages = await lintText(
    `export function CollectionsPage() {
      return <section className="bg-surface-sunken border-b" />
    }`,
    'src/app/(storefront)/collections/page.tsx',
  )

  assert.ok(
    messages.some((message) => message.ruleId === 'teavision/no-raw-section'),
  )
})

test('reports raw section elements in shared components', async () => {
  const messages = await lintText(
    `export function FooterNewsletter() {
      return <section aria-labelledby="footer-newsletter-heading" />
    }`,
    'src/components/layout/footer/footer.tsx',
  )

  assert.ok(
    messages.some((message) => message.ruleId === 'teavision/no-raw-section'),
  )
})

test('allows the Section primitive to render the native section element', async () => {
  const messages = await lintText(
    `export function Root() {
      return <section />
    }`,
    'src/components/ui/section/section.tsx',
  )

  assert.equal(
    messages.some((message) => message.ruleId === 'teavision/no-raw-section'),
    false,
  )
})

test('reports background and foreground tone classes on Section.Root', async () => {
  const messages = await lintText(
    `import { Section } from '@/components/ui/section'

    export function HomepageBand() {
      return (
        <Section.Root className="bg-surface text-on-brand">
          <Section.Container />
        </Section.Root>
      )
    }`,
    'src/components/homepage/example-section/example-section.tsx',
  )

  assert.ok(
    messages.some(
      (message) => message.ruleId === 'teavision/no-section-root-tone-class',
    ),
  )
})
