import type { Collection, ShopifyImage } from '@/lib/shopify/types'

import { getLegacyHeroImage } from './collection-images'

export type HeroImage = ShopifyImage

export function getCollectionPageNumber(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw || !/^\d+$/.test(raw)) return 1
  const page = Number(raw)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export type CollectionRichHeroAction = {
  href: string
  label: string
}

export type CollectionRichHero = {
  title: string
  introHtml: string
  image: HeroImage | null
  actions: CollectionRichHeroAction[]
  footnote: string | null
}

const LEGACY_COLLECTION_BANNER_BLOCK_PATTERN =
  /<div\b[^>]*\bid=["']kk-collection-banner["'][^>]*>[\s\S]*?<h1\b[\s\S]*?<\/h1>\s*<\/div>/gi

const LEGACY_COLLECTION_BANNER_OPENING_TAG_PATTERN =
  /<div\b(?=[^>]*\bid=["']kk-collection-banner["'])[^>]*>/i

const CSS_BACKGROUND_IMAGE_URL_PATTERN =
  /background-image\s*:\s*url\(\s*(?:"([^"]+)"|'([^']+)'|([^)\s]+))\s*\)/i

const LEGACY_READ_MORE_LINK_PATTERN =
  /<a\b(?=[^>]*(?:\bid=["']show-(?:more|less)["']|\bhref=["']#read-(?:more|less)["']))[^>]*>[\s\S]*?<\/a>/gi

const RICH_HERO_MARKER_CLASS = ['bulk', 'header'].join('-')
const IMAGE_TAG_PATTERN = /<img\b[^>]*>/i
const ATTRIBUTE_PATTERN =
  /\s([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g

export function truncateMetaDescription(value: string): string {
  return value.length > 160 ? `${value.slice(0, 157).trimEnd()}…` : value
}

function plainTextFromHtml(html: string): string {
  return removeCitationMarkers(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function removeCitationMarkers(value: string): string {
  return value.replace(/:contentReference\[[^\]]+\]\{[^}]+\}/g, ' ')
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function decodeHtmlText(value: string): string {
  return decodeHtmlAttribute(value).replace(/\u00a0/g, ' ')
}

function getHtmlAttribute(tag: string, name: string): string | null {
  ATTRIBUTE_PATTERN.lastIndex = 0

  for (const match of tag.matchAll(ATTRIBUTE_PATTERN)) {
    if (match[1]?.toLowerCase() !== name.toLowerCase()) continue

    return decodeHtmlAttribute(match[2] ?? match[3] ?? match[4] ?? '')
  }

  return null
}

function getClassNames(tag: string): string[] {
  return (getHtmlAttribute(tag, 'class') ?? '')
    .split(/\s+/)
    .map((className) => className.trim())
    .filter(Boolean)
}

function getRichHeroSectionHtml(descriptionHtml: string): string | null {
  const sectionPattern = /<section\b[^>]*>[\s\S]*?<\/section>/gi

  for (const match of descriptionHtml.matchAll(sectionPattern)) {
    const sectionHtml = match[0]
    const openingTag = sectionHtml.match(/<section\b[^>]*>/i)?.[0]
    if (!openingTag) continue
    if (getClassNames(openingTag).includes(RICH_HERO_MARKER_CLASS)) {
      return sectionHtml
    }
  }

  return null
}

function getTagInnerHtml(html: string, tagName: string): string[] {
  const tagPattern = new RegExp(
    `<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`,
    'gi',
  )

  return Array.from(html.matchAll(tagPattern), (match) => match[1] ?? '')
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function textFromInlineHtml(html: string): string {
  return decodeHtmlText(stripHtmlTags(html))
}

function sanitizeInlineHtml(html: string): string {
  const allowedInlineTags = new Set(['b', 'em', 'i', 'strong'])

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (tag, tagName: string) => {
      const normalizedTagName = tagName.toLowerCase()
      if (!allowedInlineTags.has(normalizedTagName)) return ''

      return tag.startsWith('</')
        ? `</${normalizedTagName}>`
        : `<${normalizedTagName}>`
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function getRichHeroActions(sectionHtml: string): CollectionRichHeroAction[] {
  const linkPattern = /<a\b[^>]*>[\s\S]*?<\/a>/gi

  return Array.from(sectionHtml.matchAll(linkPattern), (match) => {
    const linkHtml = match[0]
    const openingTag = linkHtml.match(/<a\b[^>]*>/i)?.[0] ?? ''
    const href = getHtmlAttribute(openingTag, 'href') ?? ''
    const label = textFromInlineHtml(linkHtml)

    return { href, label }
  }).filter(
    (action) =>
      action.label &&
      /^(?:https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(action.href),
  )
}

function isFootnoteText(value: string): boolean {
  return value.toLowerCase().startsWith('minimum order quantity:')
}

function normalizeImageSource(source: string): string {
  if (source.startsWith('//')) return `https:${source}`
  if (source.startsWith('/cdn/shop/'))
    return `https://www.teavision.com.au${source}`

  return source
}

function parsePositiveInteger(value: string | null): number | null {
  if (!value) return null

  const parsedValue = Number.parseInt(value, 10)
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null
}

function parseImageSizeFromSource(
  source: string,
): Pick<HeroImage, 'width' | 'height'> {
  const sizeMatch = source.match(/(?:^|[-_/])(\d{3,5})x(\d{3,5})(?:[._/?-]|$)/i)

  return {
    width: parsePositiveInteger(sizeMatch?.[1] ?? null),
    height: parsePositiveInteger(sizeMatch?.[2] ?? null),
  }
}

export function getDescriptionHeroImage(
  descriptionHtml: string,
): HeroImage | null {
  const imageTag = descriptionHtml.match(IMAGE_TAG_PATTERN)?.[0]
  if (!imageTag) return null

  const source = getHtmlAttribute(imageTag, 'src')
  if (!source) return null

  const sourceSize = parseImageSizeFromSource(source)

  return {
    url: normalizeImageSource(source),
    altText: getHtmlAttribute(imageTag, 'alt'),
    width:
      parsePositiveInteger(getHtmlAttribute(imageTag, 'width')) ??
      sourceSize.width,
    height:
      parsePositiveInteger(getHtmlAttribute(imageTag, 'height')) ??
      sourceSize.height,
  }
}

export function getLegacyCollectionBannerImage(
  descriptionHtml: string,
): HeroImage | null {
  const openingTag = descriptionHtml.match(
    LEGACY_COLLECTION_BANNER_OPENING_TAG_PATTERN,
  )?.[0]
  if (!openingTag) return null

  const style = getHtmlAttribute(openingTag, 'style')
  if (!style) return null

  const backgroundImage = style.match(CSS_BACKGROUND_IMAGE_URL_PATTERN)
  const source =
    backgroundImage?.[1] ?? backgroundImage?.[2] ?? backgroundImage?.[3]
  if (!source) return null

  return {
    url: normalizeImageSource(source),
    altText: null,
    ...parseImageSizeFromSource(source),
  }
}

export function parseCollectionRichHero(
  descriptionHtml: string,
): CollectionRichHero | null {
  const sectionHtml = getRichHeroSectionHtml(descriptionHtml)
  if (!sectionHtml) return null

  const title = textFromInlineHtml(getTagInnerHtml(sectionHtml, 'h1')[0] ?? '')
  const image = getDescriptionHeroImage(sectionHtml)
  const paragraphHtml = getTagInnerHtml(sectionHtml, 'p')
  const introHtml = paragraphHtml.find(
    (paragraph) =>
      Boolean(textFromInlineHtml(paragraph)) &&
      !isFootnoteText(textFromInlineHtml(paragraph)),
  )
  const footnote =
    paragraphHtml.map(textFromInlineHtml).find(isFootnoteText) ?? null
  // Links within body paragraphs/sections remain story links, not hero actions.
  const actions = getRichHeroActions(
    sectionHtml.split(/<h[2-6]\b/i)[0].replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, ''),
  )
  return {
    title,
    introHtml: sanitizeInlineHtml(introHtml ?? ''),
    image,
    actions: actions.filter(
      (action, index) =>
        actions.findIndex((other) => other.href === action.href) === index,
    ),
    footnote,
  }
}

export function cleanHeroDescription(value: string): string {
  const withoutMarkers = removeCitationMarkers(value)
    .replace(/\s+/g, ' ')
    .trim()
  const lowerValue = withoutMarkers.toLowerCase()
  const discoverIndex = lowerValue.indexOf('discover ')
  const cleaned =
    lowerValue.startsWith('read more about') && discoverIndex > -1
      ? withoutMarkers.slice(discoverIndex)
      : /^read (?:more|less)/i.test(withoutMarkers)
        ? ''
        : withoutMarkers

  return cleaned
}

export function normalizeHtml(html: string): string {
  const richSection = getRichHeroSectionHtml(html)
  // Extract only content promoted into the hero; keep additional story sections.
  let remainingSection = richSection ?? ''
  if (richSection) {
    const actions = parseCollectionRichHero(richSection)?.actions ?? []
    let removedIntro = false
    remainingSection = richSection
      .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, '')
      .replace(IMAGE_TAG_PATTERN, '')
      .replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (paragraph) => {
        const text = textFromInlineHtml(paragraph)
        if (isFootnoteText(text)) return ''
        if (!removedIntro && text) {
          removedIntro = true
          return ''
        }
        return paragraph
      })
      .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (link) => {
        const tag = link.match(/<a\b[^>]*>/i)?.[0] ?? ''
        return actions.some(
          (action) =>
            action.href === getHtmlAttribute(tag, 'href') &&
            action.label === textFromInlineHtml(link),
        )
          ? ''
          : link
      })
  }
  const body = removeCitationMarkers(
    richSection ? html.replace(richSection, remainingSection) : html,
  )
    .replace(LEGACY_COLLECTION_BANNER_BLOCK_PATTERN, '')
    .replace(LEGACY_READ_MORE_LINK_PATTERN, '')
    .replace(/<button\b[^>]*>[\s\S]*?<\/button>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<img\b[^>]*>/gi, (tag) =>
      getLegacyHeroImage(getHtmlAttribute(tag, 'src') ?? '') !== undefined
        ? ''
        : tag,
    )
    .replace(/<summary\b[\s\S]*?<\/summary>/gi, '')
    .replace(/<\/?details\b[^>]*>/gi, '')
    .replace(/\s(?:style|class|id|data-[^=]+)="[^"]*"/gi, '')
    .replace(/\s(?:style|class|id|data-[^=]+)='[^']*'/gi, '')
    .replace(/<h1(\s[^>]*)?>/gi, '<h2>')
    .replace(/<\/h1>/gi, '</h2>')
  // Legacy Shopify stories sometimes start at H3 or H4 for visual sizing.
  // Move their whole hierarchy together so sections begin at H2.
  const levels = Array.from(body.matchAll(/<h([2-6])\b/gi), (match) =>
    Number(match[1]),
  )
  const offset = levels.length ? Math.min(...levels) - 2 : 0
  return offset
    ? body.replace(
        /<(\/?)h([2-6])\b/gi,
        (_, closing: string, level: string) =>
          `<${closing}h${Number(level) - offset}`,
      )
    : body
}

export function shouldRenderRichDescription(descriptionHtml: string): boolean {
  const text = plainTextFromHtml(descriptionHtml)
  return Boolean(text || /<img\b/i.test(descriptionHtml))
}

export function getHeroImage(
  featuredImage: HeroImage | null,
  descriptionHtml = '',
  explicitImage?: HeroImage | null,
): HeroImage | null {
  const migratedImage = Array.from(
    descriptionHtml.matchAll(/<img\b[^>]*>/gi),
    (match) => getLegacyHeroImage(getHtmlAttribute(match[0], 'src') ?? ''),
  ).find((image) => image !== undefined)
  if (explicitImage) return explicitImage
  if (migratedImage) return migratedImage
  return (
    getLegacyCollectionBannerImage(descriptionHtml) ??
    parseCollectionRichHero(descriptionHtml)?.image ??
    featuredImage
  )
}

export function getCollectionHeading(
  collection: Pick<Collection, 'handle' | 'title' | 'hero'>,
): string {
  return (
    collection.hero?.heading?.trim() ||
    (collection.handle === 'all'
      ? 'Wholesale tea, herbs & spices'
      : collection.title.trim())
  )
}

/** Only storefront test collections are hidden; their direct URLs stay reviewable. */
export function isPublicCollection(handle: string): boolean {
  return handle !== 'frontpage' && !/^test(?:-|$)/i.test(handle)
}

export function getCollectionIntro(collection: Collection): string {
  if (collection.hero?.intro?.trim())
    return cleanHeroDescription(collection.hero.intro)
  const richHero = parseCollectionRichHero(collection.descriptionHtml)
  if (richHero?.introHtml)
    return cleanHeroDescription(plainTextFromHtml(richHero.introHtml))
  const body = normalizeHtml(collection.descriptionHtml)
  const paragraph = getTagInnerHtml(body, 'p')
    .map(plainTextFromHtml)
    .find((text) => text && !/^read (?:more|less)/i.test(text))
  return cleanHeroDescription(paragraph || collection.description)
}

export function getCollectionHero(collection: Collection) {
  const richHero = parseCollectionRichHero(collection.descriptionHtml)
  return {
    title:
      collection.hero?.heading?.trim() ||
      richHero?.title ||
      getCollectionHeading(collection),
    intro: getCollectionIntro(collection),
    image: getHeroImage(
      collection.featuredImage,
      collection.descriptionHtml,
      collection.hero?.image,
    ),
    actions: richHero?.actions ?? [],
    footnote: richHero?.footnote ?? null,
  }
}
