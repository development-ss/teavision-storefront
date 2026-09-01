import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)

const imageBudgets = [
  ['public/images/homepage/homepage-hero-tea-harvest-lcp.avif', 350000],
  ['public/images/homepage/bulk-wholesale-lcp.avif', 120000],
]

const sourceFiles = [
  'src/components/homepage/hero/hero.tsx',
  'src/components/product/product-gallery/product-gallery.tsx',
  'src/components/collection/product-card/product-card.tsx',
  'src/app/(storefront)/collections/[handle]/_components/hero.tsx',
  'src/app/(storefront)/collections/[handle]/_components/collection-rich-hero.tsx',
]

function sourcePath(relativePath) {
  return path.join(repoRoot, ...relativePath.split('/'))
}

async function readSource(relativePath) {
  return readFile(sourcePath(relativePath), 'utf8')
}

function imageBlocks(source) {
  return source.match(/<Image[\s\S]*?\/>/g) ?? []
}

test('launch-critical AVIF assets stay within byte budgets', async () => {
  for (const [relativePath, maxBytes] of imageBudgets) {
    const file = await stat(sourcePath(relativePath))
    assert.ok(file.isFile(), `${relativePath} should exist`)
    assert.ok(
      file.size <= maxBytes,
      `${relativePath} should be <= ${maxBytes} bytes, received ${file.size}`,
    )
  }
})

test('home uses its original source and fake Shopify uses its launch AVIF', async () => {
  const homeContent = await readSource('src/components/homepage/content.ts')
  const fakeShopify = await readSource('tests/mocks/shopify-graphql-server.ts')

  assert.match(homeContent, /homepage-hero-tea-harvest\.png/)
  assert.match(fakeShopify, /bulk-wholesale-lcp\.avif/)
})

const HERO_PATH = 'src/components/homepage/hero/hero.tsx'

test('launch image components avoid deprecated priority and invalid preload combinations', async () => {
  for (const relativePath of sourceFiles) {
    const source = await readSource(relativePath)
    const blocks = imageBlocks(source)

    assert.ok(blocks.length > 0, `${relativePath} should contain Image usage`)
    assert.doesNotMatch(
      source,
      /isLocalLaunchLcpImage|unoptimized/,
      `${relativePath} should not branch around normal Image optimization for local launch assets`,
    )

    for (const block of blocks) {
      assert.doesNotMatch(
        block,
        /\bpriority\s*=/,
        `${relativePath} should not use deprecated Image priority`,
      )
      const combinesPreloadAndFetchPriority =
        block.includes('preload') && block.includes('fetchPriority="high"')
      assert.ok(
        !combinesPreloadAndFetchPriority,
        `${relativePath} should not combine preload with high fetchPriority`,
      )
    }
  }

  const heroSource = await readSource(HERO_PATH)
  const heroBlocks = imageBlocks(heroSource)
  const heroLcpBlock = heroBlocks.find((block) => block.includes('fill'))
  assert.ok(heroLcpBlock, `${HERO_PATH} should contain the fill hero Image`)
  assert.doesNotMatch(heroLcpBlock, /\bpreload\b/)
  assert.match(
    heroLcpBlock,
    /fetchPriority="high"/,
    `${HERO_PATH} LCP image should be discovered at high priority`,
  )
  assert.match(heroLcpBlock, /quality=\{82\}/)

  const [homeHero, productGallery, productCard] = await Promise.all([
    readSource('src/components/homepage/hero/hero.tsx'),
    readSource('src/components/product/product-gallery/product-gallery.tsx'),
    readSource('src/components/collection/product-card/product-card.tsx'),
  ])

  assert.doesNotMatch(homeHero, /\bpreload\b/)
  assert.match(productGallery, /\bpreload\b/)
  assert.match(productGallery, /quality=\{68\}/)
  assert.match(productGallery, /\(min-width: 1480px\) 41rem/)
  assert.match(productCard, /preload=\{priority\}/)
  assert.match(productCard, /quality=\{68\}/)
  assert.match(productCard, /\(min-width: 1480px\) 336px/)
  assert.doesNotMatch(productGallery, /isLocalLaunchLcpImage/)
  assert.doesNotMatch(productCard, /isLocalLaunchLcpImage/)
  assert.doesNotMatch(productCard, /loading=\{priority \? 'eager' : 'lazy'\}/)
  assert.doesNotMatch(
    productCard,
    /fetchPriority=\{priority \? 'high' : 'auto'\}/,
  )

  const collectionHero = await readSource(
    'src/app/(storefront)/collections/[handle]/_components/hero.tsx',
  )
  const collectionHeroBlocks = imageBlocks(collectionHero)
  const collectionBannerBlock = collectionHeroBlocks.find((block) =>
    block.includes('className="w-full object-cover"'),
  )
  assert.ok(
    collectionBannerBlock,
    'collection hero should contain the banner Image',
  )
  assert.match(collectionBannerBlock, /loading="eager"/)
  assert.match(collectionBannerBlock, /fetchPriority="high"/)
  assert.doesNotMatch(collectionBannerBlock, /\bpreload\b/)

  for (const block of collectionHeroBlocks) {
    assert.match(block, /loading="eager"/)
    assert.match(block, /fetchPriority="high"/)
    assert.doesNotMatch(block, /\bpreload\b/)
  }

  const collectionRichHero = await readSource(
    'src/app/(storefront)/collections/[handle]/_components/collection-rich-hero.tsx',
  )
  const collectionRichHeroBlock = imageBlocks(collectionRichHero)[0]
  assert.ok(
    collectionRichHeroBlock,
    'collection rich hero should contain its LCP Image',
  )
  assert.match(collectionRichHeroBlock, /loading="eager"/)
  assert.match(collectionRichHeroBlock, /fetchPriority="high"/)
  assert.doesNotMatch(collectionRichHeroBlock, /\bpreload\b/)
})

test('product and collection routes preserve crawlable content and layout-stable streaming', async () => {
  const [collectionPage, collectionSkeleton, productPage] = await Promise.all([
    readSource('src/app/(storefront)/collections/[handle]/page.tsx'),
    readSource(
      'src/components/collection/loading-skeleton/loading-skeleton.tsx',
    ),
    readSource('src/app/(storefront)/products/[handle]/page.tsx'),
  ])

  assert.doesNotMatch(collectionPage, /fallback=\{null\}/)
  assert.match(collectionPage, /<HeroContent params=\{params\} \/>/)
  assert.match(
    collectionPage,
    /fallback=\{<DefaultResults params=\{params\} \/>\}/,
  )
  // The category route still falls back to the skeleton, which must keep the
  // product-card aspect ratio for layout-stable streaming.
  assert.match(collectionSkeleton, /aspect-square/)
  assert.doesNotMatch(collectionSkeleton, /aspect-25\/28/)

  assert.doesNotMatch(productPage, /await searchParams/)
  assert.doesNotMatch(productPage, /searchParams\.then/)
  assert.match(productPage, /<DynamicPurchaseForm/)
  assert.match(productPage, /<ProductContent params=\{params\} \/>/)
  assert.doesNotMatch(productPage, /Loading product/)
})
