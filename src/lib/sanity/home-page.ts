import 'server-only'

import type { SanityImageSource } from '@sanity/image-url'
import { cacheLife, cacheTag } from 'next/cache'

import {
  getSanityImageUrl,
  sanityDraftFetch,
  sanityFetch,
} from '@/lib/sanity/client'
import type { SanityImageUrlOptions } from '@/lib/sanity/client'
import { homePageQuery } from '@/lib/sanity/queries/home-page'
import type {
  SanityHomeCertificationItem,
  SanityHomeContactMethod,
  SanityHomeFaqItem,
  SanityHomeHero,
  SanityHomeImageCard,
  SanityHomeLink,
  SanityHomePageResult,
  SanityHomeProofPoint,
  SanityHomeSection,
  SanityHomeTestimonial,
  SanityImageWithAlt,
  SanitySeo,
} from '@/lib/sanity/types'
import { getCollectionDisplayTitle } from '@/lib/shopify/collection-title'

const IMAGE_OPTIONS_CARD: SanityImageUrlOptions = {
  fit: 'max',
  quality: 75,
  width: 900,
}
const IMAGE_OPTIONS_MARK: SanityImageUrlOptions = {
  fit: 'max',
  quality: 75,
  width: 640,
}
const IMAGE_OPTIONS_OG: SanityImageUrlOptions = {
  fit: 'max',
  quality: 75,
  width: 1200,
}

export type HomepageImage = {
  src: string
  alt: string
  width: number
  height: number
  lqip?: string | null
}

export type HomepageLink = {
  children: string
  href: string
}

export type HomepageSectionIntro = {
  eyebrow: string | null
  title: string
  copy: string | null
}

export type HomepageProofPoint = {
  icon?: string
  image?: HomepageImage
  title: string
  description: string
}

export type HomepageImageCard = {
  title: string
  href: string
  image: HomepageImage
  action: string
  badge?: HomepageImage
  body?: string
}

export type HomepageSeo = {
  title: string
  description: string
  canonicalPath: '/'
  noIndex: boolean
  ogImage: HomepageImage | null
}

export type HomepageContent = {
  id: string
  title: string
  hero: {
    eyebrow: string
    title: string
    copy: string
    cta: HomepageLink
    image: HomepageImage
    trustMarks: HomepageImage
    proofPoints: HomepageProofPoint[]
  }
  productRange: {
    intro: HomepageSectionIntro
    cards: HomepageImageCard[]
  }
  newsletter: {
    intro: HomepageSectionIntro
  }
  privateLabel: {
    intro: HomepageSectionIntro
    cards: HomepageImageCard[]
  }
  organicHerbs: {
    intro: HomepageSectionIntro
    image: HomepageImage
    checklist: string[]
    cta: HomepageLink
  }
  supplyChain: {
    intro: HomepageSectionIntro
    cta: HomepageLink
  }
  certificationCoverage: {
    items: Array<{
      label: string
      iconKey: string | null
    }>
  }
  supplyChainProtection: {
    intro: HomepageSectionIntro
    marks: HomepageImage[]
  }
  testimonials: {
    intro: HomepageSectionIntro
    items: Array<{
      logo: HomepageImage
      name: string
      role: string | null
      brand: string | null
      quote: string
    }>
  }
  teaJournal: {
    intro: HomepageSectionIntro
    blogHandle: string
    linkLabel: string
    maxPosts: number
  }
  contact: {
    intro: HomepageSectionIntro
    methods: Array<{
      label: string
      value: string
      href: string
    }>
  }
  catalogueCta: {
    intro: HomepageSectionIntro
    cta: HomepageLink
    secondaryCta: HomepageLink
  }
  faq: {
    intro: HomepageSectionIntro
    items: Array<{
      question: string
      answer: string
    }>
  }
  seo: HomepageSeo
}

function fail(path: string, reason: string): never {
  throw new Error(`Invalid homePage content at ${path}: ${reason}`)
}

function requireString(value: string | null | undefined, path: string): string {
  const trimmed = value?.trim()
  if (!trimmed) fail(path, 'required string is missing')

  return trimmed
}

function optionalString(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed || null
}

function requireObject<T>(value: T | null | undefined, path: string): T {
  if (!value) fail(path, 'required object is missing')

  return value
}

function requireArray<T>(value: T[] | null | undefined, path: string): T[] {
  if (!Array.isArray(value)) fail(path, 'required array is missing')

  return value
}

function isSafeHomeHref(value: string): boolean {
  return (
    value.startsWith('/') ||
    value.startsWith('https://') ||
    value.startsWith('mailto:') ||
    value.startsWith('tel:')
  )
}

function requireHref(value: string | null | undefined, path: string): string {
  const href = requireString(value, path)
  if (!isSafeHomeHref(href)) {
    fail(path, 'href must start with /, https://, mailto:, or tel:')
  }

  return href
}

function reshapeLink(link: SanityHomeLink | null, path: string): HomepageLink {
  const requiredLink = requireObject(link, path)

  return {
    children: requireString(requiredLink.label, `${path}.label`),
    href: requireHref(requiredLink.href, `${path}.href`),
  }
}

function reshapeSection(
  section: SanityHomeSection | null,
  path: string,
): HomepageSectionIntro {
  const requiredSection = requireObject(section, path)

  return {
    eyebrow: optionalString(requiredSection.eyebrow),
    title: requireString(requiredSection.title, `${path}.title`),
    copy: optionalString(requiredSection.copy),
  }
}

function requireImageDimensions(
  image: SanityImageWithAlt,
  path: string,
): { width: number; height: number } {
  const dimensions = image.image?.asset?.metadata?.dimensions
  const width = dimensions?.width
  const height = dimensions?.height

  if (
    typeof width !== 'number' ||
    width <= 0 ||
    typeof height !== 'number' ||
    height <= 0
  ) {
    fail(path, 'image dimensions are missing')
  }

  return { width, height }
}

function reshapeImage(
  image: SanityImageWithAlt | null,
  path: string,
  options: SanityImageUrlOptions | 'original',
): HomepageImage {
  const requiredImage = requireObject(image, path)
  const source = requireObject(requiredImage.image, `${path}.image`)
  const asset = requireObject(source.asset, `${path}.image.asset`)

  if (!asset._id && !asset.url) {
    fail(`${path}.image.asset`, 'asset id or URL is required')
  }

  const alt = requireString(requiredImage.alt, `${path}.alt`)
  const { width, height } = requireImageDimensions(requiredImage, path)
  const src =
    options === 'original'
      ? asset.url
      : asset._id
        ? getSanityImageUrl(source as SanityImageSource, options)
        : asset.url

  if (!src) fail(`${path}.image.asset.url`, 'image URL is required')

  return {
    src,
    alt,
    width,
    height,
    lqip: asset.metadata?.lqip ?? null,
  }
}

function reshapeOptionalImage(
  image: SanityImageWithAlt | null | undefined,
  path: string,
  options: SanityImageUrlOptions,
): HomepageImage | null {
  return image ? reshapeImage(image, path, options) : null
}

function reshapeProofPoint(
  point: SanityHomeProofPoint,
  index: number,
): HomepageProofPoint {
  const path = `hero.proofPoints[${index}]`
  const image = point.image
    ? reshapeImage(point.image, `${path}.image`, IMAGE_OPTIONS_MARK)
    : undefined
  const icon = optionalString(point.iconKey) ?? undefined

  if (!image && !icon) fail(path, 'image or iconKey is required')

  return {
    ...(icon ? { icon } : {}),
    ...(image ? { image } : {}),
    title: requireString(point.title, `${path}.title`),
    description: requireString(point.description, `${path}.description`),
  }
}

function reshapeImageCard(
  card: SanityHomeImageCard,
  path: string,
): HomepageImageCard {
  const badge = reshapeOptionalImage(
    card.badge,
    `${path}.badge`,
    IMAGE_OPTIONS_MARK,
  )
  const body = optionalString(card.body)
  const href = requireHref(card.href, `${path}.href`)
  const title = requireString(card.title, `${path}.title`)

  return {
    title: href.startsWith('/collections/')
      ? getCollectionDisplayTitle(title)
      : title,
    href,
    image: reshapeImage(card.image, `${path}.image`, IMAGE_OPTIONS_CARD),
    action: requireString(card.action, `${path}.action`),
    ...(badge ? { badge } : {}),
    ...(body ? { body } : {}),
  }
}

function reshapeHero(hero: SanityHomeHero | null): HomepageContent['hero'] {
  const requiredHero = requireObject(hero, 'hero')
  const cta = reshapeLink(requiredHero.cta, 'hero.cta')

  return {
    eyebrow: requireString(requiredHero.eyebrow, 'hero.eyebrow'),
    title: requireString(requiredHero.title, 'hero.title'),
    copy: requireString(requiredHero.copy, 'hero.copy'),
    cta: {
      ...cta,
      href: cta.href === '/collections' ? '#product-range' : cta.href,
    },
    // Keep the CMS upload as the single high-quality master. Next/Image owns
    // responsive sizing and final AVIF/WebP encoding for this LCP asset.
    image: reshapeImage(requiredHero.image, 'hero.image', 'original'),
    trustMarks: reshapeImage(
      requiredHero.trustMarks,
      'hero.trustMarks',
      IMAGE_OPTIONS_MARK,
    ),
    proofPoints: requireArray(requiredHero.proofPoints, 'hero.proofPoints').map(
      reshapeProofPoint,
    ),
  }
}

function reshapeCertificationItem(
  item: SanityHomeCertificationItem,
  index: number,
): HomepageContent['certificationCoverage']['items'][number] {
  const path = `certificationCoverage.items[${index}]`

  return {
    label: requireString(item.label, `${path}.label`),
    iconKey: optionalString(item.iconKey),
  }
}

function reshapeTestimonial(
  testimonial: SanityHomeTestimonial,
  index: number,
): HomepageContent['testimonials']['items'][number] {
  const path = `testimonials.items[${index}]`

  return {
    logo: reshapeImage(testimonial.logo, `${path}.logo`, IMAGE_OPTIONS_MARK),
    name: requireString(testimonial.name, `${path}.name`),
    role: optionalString(testimonial.role),
    brand: optionalString(testimonial.brand),
    quote: requireString(testimonial.quote, `${path}.quote`),
  }
}

function reshapeContactMethod(
  method: SanityHomeContactMethod,
  index: number,
): HomepageContent['contact']['methods'][number] {
  const path = `contact.methods[${index}]`

  return {
    label: requireString(method.label, `${path}.label`),
    value: requireString(method.value, `${path}.value`),
    href: requireHref(method.href, `${path}.href`),
  }
}

function reshapeFaqItem(
  item: SanityHomeFaqItem,
  index: number,
): HomepageContent['faq']['items'][number] {
  const path = `faq.items[${index}]`

  return {
    question: requireString(item.question, `${path}.question`),
    answer: requireString(item.answer, `${path}.answer`),
  }
}

function reshapeSeo(seo: SanitySeo | null): HomepageSeo {
  const requiredSeo = requireObject(seo, 'seo')
  const canonicalPath = requireString(
    requiredSeo.canonicalPath,
    'seo.canonicalPath',
  )

  if (canonicalPath !== '/') {
    fail('seo.canonicalPath', 'canonical path must be /')
  }

  return {
    title: requireString(requiredSeo.metaTitle, 'seo.metaTitle'),
    description: requireString(
      requiredSeo.metaDescription,
      'seo.metaDescription',
    ),
    canonicalPath: '/',
    noIndex: requiredSeo.noIndex ?? false,
    ogImage: reshapeOptionalImage(
      requiredSeo.ogImage,
      'seo.ogImage',
      IMAGE_OPTIONS_OG,
    ),
  }
}

function reshapeHomepage(data: SanityHomePageResult): HomepageContent {
  const productRange = requireObject(data.productRange, 'productRange')
  const newsletter = requireObject(data.newsletter, 'newsletter')
  const privateLabel = requireObject(data.privateLabel, 'privateLabel')
  const organicHerbs = requireObject(data.organicHerbs, 'organicHerbs')
  const supplyChain = requireObject(data.supplyChain, 'supplyChain')
  const certificationCoverage = requireObject(
    data.certificationCoverage,
    'certificationCoverage',
  )
  const supplyChainProtection = requireObject(
    data.supplyChainProtection,
    'supplyChainProtection',
  )
  const testimonials = requireObject(data.testimonials, 'testimonials')
  const teaJournal = requireObject(data.teaJournal, 'teaJournal')
  const contact = requireObject(data.contact, 'contact')
  const catalogueCta = requireObject(data.catalogueCta, 'catalogueCta')
  const faq = requireObject(data.faq, 'faq')
  const maxPosts = teaJournal.maxPosts

  if (
    typeof maxPosts !== 'number' ||
    !Number.isInteger(maxPosts) ||
    maxPosts < 1 ||
    maxPosts > 3
  ) {
    fail('teaJournal.maxPosts', 'must be an integer from 1 to 3')
  }

  return {
    id: data._id,
    title: requireString(data.title, 'title'),
    hero: reshapeHero(data.hero),
    productRange: {
      intro: reshapeSection(productRange.intro, 'productRange.intro'),
      cards: requireArray(productRange.cards, 'productRange.cards').map(
        (card, index) => reshapeImageCard(card, `productRange.cards[${index}]`),
      ),
    },
    newsletter: {
      intro: reshapeSection(newsletter.intro, 'newsletter.intro'),
    },
    privateLabel: {
      intro: reshapeSection(privateLabel.intro, 'privateLabel.intro'),
      cards: requireArray(privateLabel.cards, 'privateLabel.cards').map(
        (card, index) => reshapeImageCard(card, `privateLabel.cards[${index}]`),
      ),
    },
    organicHerbs: {
      intro: reshapeSection(organicHerbs.intro, 'organicHerbs.intro'),
      image: reshapeImage(
        organicHerbs.image,
        'organicHerbs.image',
        IMAGE_OPTIONS_CARD,
      ),
      checklist: requireArray(
        organicHerbs.checklist,
        'organicHerbs.checklist',
      ).map((item, index) =>
        requireString(item, `organicHerbs.checklist[${index}]`),
      ),
      cta: reshapeLink(organicHerbs.cta, 'organicHerbs.cta'),
    },
    supplyChain: {
      intro: reshapeSection(supplyChain.intro, 'supplyChain.intro'),
      cta: reshapeLink(supplyChain.cta, 'supplyChain.cta'),
    },
    certificationCoverage: {
      items: requireArray(
        certificationCoverage.items,
        'certificationCoverage.items',
      ).map(reshapeCertificationItem),
    },
    supplyChainProtection: {
      intro: reshapeSection(
        supplyChainProtection.intro,
        'supplyChainProtection.intro',
      ),
      marks: requireArray(
        supplyChainProtection.marks,
        'supplyChainProtection.marks',
      ).map((mark, index) =>
        reshapeImage(
          mark,
          `supplyChainProtection.marks[${index}]`,
          IMAGE_OPTIONS_MARK,
        ),
      ),
    },
    testimonials: {
      intro: reshapeSection(testimonials.intro, 'testimonials.intro'),
      items: requireArray(testimonials.items, 'testimonials.items').map(
        reshapeTestimonial,
      ),
    },
    teaJournal: {
      intro: reshapeSection(teaJournal.intro, 'teaJournal.intro'),
      blogHandle: requireString(teaJournal.blogHandle, 'teaJournal.blogHandle'),
      linkLabel: requireString(teaJournal.linkLabel, 'teaJournal.linkLabel'),
      maxPosts,
    },
    contact: {
      intro: reshapeSection(contact.intro, 'contact.intro'),
      methods: requireArray(contact.methods, 'contact.methods').map(
        reshapeContactMethod,
      ),
    },
    catalogueCta: {
      intro: reshapeSection(catalogueCta.intro, 'catalogueCta.intro'),
      cta: reshapeLink(catalogueCta.cta, 'catalogueCta.cta'),
      secondaryCta: reshapeLink(
        catalogueCta.secondaryCta,
        'catalogueCta.secondaryCta',
      ),
    },
    faq: {
      intro: reshapeSection(faq.intro, 'faq.intro'),
      items: requireArray(faq.items, 'faq.items').map(reshapeFaqItem),
    },
    seo: reshapeSeo(data.seo),
  }
}

export async function getHomepage(): Promise<HomepageContent> {
  'use cache'
  cacheTag('homePage', 'sanity-homepage')
  cacheLife('hours')

  const data = await sanityFetch<SanityHomePageResult | null>(homePageQuery)
  if (!data) fail('homePage', 'singleton document is missing')

  return reshapeHomepage(data)
}

export async function getDraftHomepage(): Promise<HomepageContent> {
  const data = await sanityDraftFetch<SanityHomePageResult | null>(
    homePageQuery,
  )
  if (!data) fail('homePage', 'singleton draft document is missing')

  return reshapeHomepage(data)
}
