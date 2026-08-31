import { readFile } from 'node:fs/promises'

import { renderToStaticMarkup } from 'react-dom/server'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { HomepageContent } from '@/lib/sanity/home-page'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/homepage-json-ld'

import * as pageModule from './page'

const routeMocks = vi.hoisted(() => ({
  draftMode: vi.fn(),
  getDraftHomepage: vi.fn(),
  getHomepage: vi.fn(),
  sendNewsletterSignupFormAction: vi.fn(),
  submitContactFormAction: vi.fn(),
  withNoindexRobots: vi.fn((metadata: unknown) => metadata),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/sanity/home-page', () => ({
  getDraftHomepage: routeMocks.getDraftHomepage,
  getHomepage: routeMocks.getHomepage,
}))

vi.mock('next/headers', () => ({
  draftMode: routeMocks.draftMode,
}))

vi.mock('@/lib/contact/actions', () => ({
  sendNewsletterSignupFormAction: routeMocks.sendNewsletterSignupFormAction,
  submitContactFormAction: routeMocks.submitContactFormAction,
}))

vi.mock('@/lib/seo/noindex', () => ({
  withNoindexRobots: routeMocks.withNoindexRobots,
}))

vi.mock('@/components/homepage/certification-coverage', () => ({
  CertificationCoverage: (props: {
    items: HomepageContent['certificationCoverage']['items']
  }) => <div data-section="CertificationCoverage">{props.items[0]?.label}</div>,
}))

vi.mock('@/components/homepage/catalogues', () => ({
  Cta: (props: HomepageContent['catalogueCta']) => (
    <div data-section="Cta">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/homepage/faq', () => ({
  Faq: (props: HomepageContent['faq']) => (
    <div data-section="Faq">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/homepage/hero', () => ({
  HomepageHero: (props: { hero: HomepageContent['hero'] }) => (
    <div data-section="HomepageHero">
      <h1>{props.hero.title}</h1>
      <a href={props.hero.cta.href}>{props.hero.cta.children}</a>
    </div>
  ),
}))

vi.mock('@/components/homepage/newsletter', () => ({
  HomepageNewsletter: (props: {
    action: unknown
    intro: HomepageContent['newsletter']['intro']
  }) => (
    <div data-section="HomepageNewsletter">
      {props.intro.title}
      {props.action === routeMocks.sendNewsletterSignupFormAction
        ? 'newsletter-action'
        : 'wrong-newsletter-action'}
    </div>
  ),
}))

vi.mock('@/components/homepage/organic-herbs', () => ({
  OrganicHerbs: (props: HomepageContent['organicHerbs']) => (
    <div data-section="OrganicHerbs">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/homepage/private-label', () => ({
  PrivateLabel: (props: HomepageContent['privateLabel']) => (
    <div data-section="PrivateLabel">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/homepage/product-range', () => ({
  ProductRange: (props: HomepageContent['productRange']) => (
    <div data-section="ProductRange">
      {props.intro.title}
      {props.cards[0]?.title}
    </div>
  ),
}))

vi.mock('@/components/homepage/supply-chain', () => ({
  SupplyChain: (props: HomepageContent['supplyChain']) => (
    <div data-section="SupplyChain">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/homepage/supply-chain-protection', () => ({
  SupplyChainProtection: (props: HomepageContent['supplyChainProtection']) => (
    <div data-section="SupplyChainProtection">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/homepage/tea-journal', () => ({
  TeaJournal: (props: HomepageContent['teaJournal']) => (
    <div data-section="TeaJournal">
      {props.intro.title}
      {props.blogHandle}
      {props.maxPosts}
    </div>
  ),
}))

vi.mock('@/components/homepage/testimonials', () => ({
  Testimonials: (props: HomepageContent['testimonials']) => (
    <div data-section="Testimonials">{props.intro.title}</div>
  ),
}))

vi.mock('@/components/contact/contact-section', () => ({
  ContactSection: (props: {
    action: unknown
    intro: HomepageContent['contact']['intro']
  }) => (
    <div data-section="ContactSection">
      {props.intro.title}
      {props.action === routeMocks.submitContactFormAction
        ? 'contact-action'
        : 'wrong-contact-action'}
    </div>
  ),
}))

type JsonLdNode = Record<string, unknown>

const SECTION_ORDER = [
  'HomepageHero',
  'ProductRange',
  'Testimonials',
  'PrivateLabel',
  'OrganicHerbs',
  'SupplyChain',
  'CertificationCoverage',
  'SupplyChainProtection',
  'TeaJournal',
  'ContactSection',
  'Cta',
  'Faq',
  'HomepageNewsletter',
] as const

function image(id: string): HomepageContent['hero']['image'] {
  return {
    alt: `${id} alt`,
    height: 800,
    lqip: `data:image/jpeg;base64,${id}`,
    src: `https://cdn.sanity.io/images/project/dataset/${id}.jpg`,
    width: 1200,
  }
}

function intro(title: string): HomepageContent['productRange']['intro'] {
  return {
    copy: `${title} copy`,
    eyebrow: `${title} eyebrow`,
    title,
  }
}

function link(children: string, href = '/collections') {
  return { children, href }
}

function card(index: number): HomepageContent['productRange']['cards'][number] {
  return {
    action: 'Shop Now',
    href: `/collections/cms-card-${index}`,
    image: image(`card-${index}`),
    title: `CMS Product Card ${index}`,
  }
}

function homepageFixture(
  overrides: Partial<HomepageContent> = {},
): HomepageContent {
  const base = {
    id: 'homePage',
    title: 'CMS Homepage',
    hero: {
      copy: 'CMS hero copy',
      cta: link('CMS Explore CTA'),
      eyebrow: 'CMS hero eyebrow',
      image: image('hero'),
      proofPoints: [
        {
          description: 'CMS proof description',
          icon: 'Truck',
          title: 'CMS proof',
        },
      ],
      title: 'CMS Hero Title',
      trustMarks: image('trust-marks'),
    },
    productRange: {
      cards: Array.from({ length: 11 }, (_, index) => card(index)),
      intro: intro('CMS Product Range'),
    },
    newsletter: {
      intro: intro('CMS Newsletter'),
    },
    privateLabel: {
      cards: Array.from({ length: 3 }, (_, index) => ({
        ...card(index),
        action: 'Explore',
        href: `/pages/cms-service-${index}`,
      })),
      intro: intro('CMS Private Label'),
    },
    organicHerbs: {
      checklist: ['CMS checklist item'],
      cta: link('CMS Herbs CTA', '/collections/herbs-and-spices'),
      image: image('organic-herbs'),
      intro: intro('CMS Organic Herbs'),
    },
    supplyChain: {
      cta: link('CMS Contact CTA', '/pages/contact'),
      intro: intro('CMS Supply Chain'),
    },
    certificationCoverage: {
      items: [{ iconKey: 'Shield', label: 'CMS Certification' }],
    },
    supplyChainProtection: {
      intro: intro('CMS Supply Protection'),
      marks: [image('mark')],
    },
    testimonials: {
      intro: intro('CMS Testimonials'),
      items: [
        {
          brand: 'CMS Brand',
          logo: image('logo'),
          name: 'CMS Person',
          quote: 'CMS quote',
          role: 'CMS Role',
        },
      ],
    },
    teaJournal: {
      blogHandle: 'cms-blog',
      intro: intro('CMS Tea Journal'),
      linkLabel: 'CMS View all',
      maxPosts: 2,
    },
    contact: {
      intro: intro('CMS Contact'),
      methods: [
        { href: 'tel:1300000000', label: 'Call CMS', value: '1300 000 000' },
      ],
    },
    catalogueCta: {
      cta: link('CMS Catalogue CTA', '/pages/download-catalogues'),
      intro: intro('CMS Catalogue'),
      secondaryCta: link('CMS Browse', '/collections'),
    },
    faq: {
      intro: intro('CMS FAQ'),
      items: [{ answer: 'CMS answer', question: 'CMS question?' }],
    },
    seo: {
      canonicalPath: '/',
      description: 'CMS meta description',
      noIndex: false,
      ogImage: image('og'),
      title: 'CMS Meta Title',
    },
  } satisfies HomepageContent

  return {
    ...base,
    ...overrides,
  }
}

function collectJsonLdNodes(value: unknown): JsonLdNode[] {
  if (Array.isArray(value)) return value.flatMap(collectJsonLdNodes)
  if (typeof value !== 'object' || value === null) return []

  const node = value as JsonLdNode
  const graph = collectJsonLdNodes(node['@graph'])

  return [node, ...graph]
}

function readJsonLdNodes(html: string): JsonLdNode[] {
  return [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g,
    ),
  ].flatMap((match) => collectJsonLdNodes(JSON.parse(match[1] ?? 'null')))
}

function readSectionOrder(html: string): string[] {
  return [...html.matchAll(/data-section="([^"]+)"/g)].map(
    (match) => match[1] ?? '',
  )
}

async function renderHomePage(homepage = homepageFixture()) {
  routeMocks.getHomepage.mockResolvedValue(homepage)

  const element = await pageModule.default()

  return renderToStaticMarkup(element as ReactNode)
}

function getGenerateMetadata() {
  return (pageModule as { generateMetadata?: () => Promise<Metadata> })
    .generateMetadata
}

describe('HomePage route cutover', () => {
  beforeEach(() => {
    routeMocks.getHomepage.mockReset()
    routeMocks.getDraftHomepage.mockReset()
    routeMocks.draftMode.mockReset()
    routeMocks.sendNewsletterSignupFormAction.mockReset()
    routeMocks.submitContactFormAction.mockReset()
    routeMocks.withNoindexRobots.mockReset()
    routeMocks.withNoindexRobots.mockImplementation((metadata) => metadata)
    routeMocks.draftMode.mockResolvedValue({ isEnabled: false })
  })

  it('renders CMS content from getHomepage in the exact fixed section order', async () => {
    const html = await renderHomePage()

    expect(routeMocks.getHomepage).toHaveBeenCalledTimes(1)
    expect(readSectionOrder(html)).toEqual(SECTION_ORDER)
    expect(html).toContain('CMS Hero Title')
    expect(html).toContain('CMS Product Range')
    expect(html).toContain('CMS Product Card 0')
    expect(html).toContain('cms-blog')
    expect(html).toContain('newsletter-action')
    expect(html).toContain('contact-action')
  })

  it('keeps the homepage H1 singular and emits code-owned JSON-LD in the default route output', async () => {
    const html = await renderHomePage()
    const jsonLdNodes = readJsonLdNodes(html)

    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(jsonLdNodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': organizationJsonLd['@type'],
          name: organizationJsonLd.name,
        }),
        expect.objectContaining({
          '@type': websiteJsonLd['@type'],
          name: websiteJsonLd.name,
        }),
      ]),
    )
  })

  it('generates CMS metadata and preserves noindex processing', async () => {
    const homepage = homepageFixture({
      seo: {
        canonicalPath: '/',
        description: 'CMS noindex description',
        noIndex: true,
        ogImage: image('metadata-og'),
        title: 'CMS Noindex Title',
      },
    })
    routeMocks.getHomepage.mockResolvedValue(homepage)

    const generateMetadata = getGenerateMetadata()

    expect(generateMetadata).toBeTypeOf('function')

    const metadata = await generateMetadata?.()

    expect(routeMocks.getHomepage).toHaveBeenCalledTimes(1)
    expect(routeMocks.withNoindexRobots).toHaveBeenCalledWith(
      expect.objectContaining({
        alternates: { canonical: '/' },
        description: 'CMS noindex description',
        openGraph: expect.objectContaining({
          description: 'CMS noindex description',
          title: 'CMS Noindex Title',
          url: '/',
        }),
        robots: { follow: false, index: false },
        title: { absolute: 'CMS Noindex Title' },
      }),
    )
    expect(metadata).toMatchObject({
      robots: { follow: false, index: false },
      title: { absolute: 'CMS Noindex Title' },
    })
    expect(routeMocks.getDraftHomepage).not.toHaveBeenCalled()
    expect(routeMocks.draftMode).not.toHaveBeenCalled()
  })

  it('renders draft homepage body content in Draft Mode without changing published metadata', async () => {
    const publishedHomepage = homepageFixture()
    const draftHomepage = homepageFixture({
      hero: {
        ...publishedHomepage.hero,
        copy: 'Draft-only hero copy',
        title: 'Draft-only Hero Title',
      },
      productRange: {
        ...publishedHomepage.productRange,
        intro: intro('Draft-only Product Range'),
      },
      seo: {
        ...publishedHomepage.seo,
        description: 'Draft-only meta description',
        title: 'Draft-only Meta Title',
      },
    })
    routeMocks.draftMode.mockResolvedValue({ isEnabled: true })
    routeMocks.getHomepage.mockResolvedValue(publishedHomepage)
    routeMocks.getDraftHomepage.mockResolvedValue(draftHomepage)

    const element = await pageModule.default()
    const html = renderToStaticMarkup(element as ReactNode)
    const generateMetadata = getGenerateMetadata()
    const metadata = await generateMetadata?.()

    expect(routeMocks.getDraftHomepage).toHaveBeenCalledTimes(1)
    expect(routeMocks.getHomepage).toHaveBeenCalledTimes(1)
    expect(html).toContain('Draft-only Hero Title')
    expect(html).toContain('Draft-only Product Range')
    expect(html).not.toContain('CMS Hero Title')
    expect(routeMocks.withNoindexRobots).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'CMS meta description',
        title: { absolute: 'CMS Meta Title' },
      }),
    )
    expect(metadata).toMatchObject({
      description: 'CMS meta description',
      title: { absolute: 'CMS Meta Title' },
    })
  })

  it('keeps published HTML free of draft, stega, and source-map marker text', async () => {
    const html = await renderHomePage()

    expect(html).not.toContain('Draft-only')
    expect(html).not.toContain('data-sanity')
    expect(html).not.toContain('stega')
    expect(html).not.toContain('source-map')
    expect(html).not.toContain('sourceMappingURL')
  })

  it('keeps static homepage fixture content and blank streamed shells out of the live route source', async () => {
    const source = await readFile(
      new URL('./page.tsx', import.meta.url),
      'utf8',
    )

    expect(source).not.toContain('@/components/homepage/content')
    expect(source).not.toContain('HOME_TITLE')
    expect(source).not.toContain('HOME_DESCRIPTION')
    expect(source).not.toContain('HOMEPAGE_HERO_FIXTURE')
    expect(source).not.toContain("from 'next/server'")
    expect(source).not.toContain('connection()')
    expect(source).not.toContain('fallback={null}')
    expect(source).not.toContain('<Suspense')
  })
})
