#!/usr/bin/env node
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Skip '--' separator if pnpm passes it through
let arg = process.argv[2]
if (arg === '--') {
  arg = process.argv[3]
}

if (!arg || !arg.includes('/')) {
  console.error('Usage: npm run create:component -- <domain>/<component-name>')
  console.error('Example: npm run create:component -- ui/price-tag')
  process.exit(1)
}

const [domain, componentKebab] = arg.split('/')
const root = fileURLToPath(new URL('..', import.meta.url))
const domainDir = join(root, 'src', 'components', domain)

if (!existsSync(domainDir)) {
  console.error(`Domain folder does not exist: src/components/${domain}/`)
  console.error(
    `Available domains: ui, layout, product, collection, cart, contact, homepage`,
  )
  process.exit(1)
}

const componentName = componentKebab
  .split('-')
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join('')

const componentDir = join(domainDir, componentKebab)
const componentPath = join(componentDir, `${componentKebab}.tsx`)
const storyPath = join(componentDir, `${componentKebab}.stories.tsx`)
const componentIndexPath = join(componentDir, 'index.ts')
const barrelPath = join(domainDir, 'index.ts')

if (existsSync(componentDir)) {
  console.error(`Already exists: src/components/${domain}/${componentKebab}/`)
  process.exit(1)
}

const domainTitle = domain.charAt(0).toUpperCase() + domain.slice(1)

mkdirSync(componentDir, { recursive: true })

writeFileSync(
  componentPath,
  `import { cn } from '@/lib/utils'

type ${componentName}Props = {
  className?: string
}

export function ${componentName}({ className }: ${componentName}Props) {
  return <div className={cn('grid gap-4', className)} />
}
`,
)

writeFileSync(
  componentIndexPath,
  `export { ${componentName} } from './${componentKebab}'\n`,
)

writeFileSync(
  storyPath,
  `import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ${componentName} } from './${componentKebab}'

const meta: Meta<typeof ${componentName}> = {
  title: '${domainTitle}/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ${componentName}>

export const Default: Story = {
  args: {},
}
`,
)

const exportLine = `export { ${componentName} } from './${componentKebab}'\n`

if (!existsSync(barrelPath)) {
  writeFileSync(barrelPath, exportLine)
} else {
  const existing = readFileSync(barrelPath, 'utf8')
  if (!existing.includes(`'./${componentKebab}'`)) {
    appendFileSync(barrelPath, exportLine)
  }
}

console.log(
  `✓ src/components/${domain}/${componentKebab}/${componentKebab}.tsx`,
)
console.log(`✓ src/components/${domain}/${componentKebab}/index.ts`)
console.log(
  `✓ src/components/${domain}/${componentKebab}/${componentKebab}.stories.tsx`,
)
console.log(`✓ src/components/${domain}/index.ts updated`)
