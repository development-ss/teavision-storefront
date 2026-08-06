import 'server-only'

import sanitizeHtml from 'sanitize-html'

declare const sanitizedHtmlBrand: unique symbol

export type SanitizedHtml = string & {
  readonly [sanitizedHtmlBrand]: true
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type ShopifyHtmlVariant = 'page' | 'article' | 'compact' | 'collectionStory'
type ShopifyHtmlClassMap = Partial<Record<string, string>>
type HeadingTransform = {
  tagName: HeadingTag
  className?: string
}

const SHOPIFY_HTML_ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'caption',
  'div',
  'em',
  'figcaption',
  'figure',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
] satisfies sanitizeHtml.IOptions['allowedTags']

const SHOPIFY_HTML_ALLOWED_ATTRIBUTES: Record<
  string,
  sanitizeHtml.AllowedAttribute[]
> = {
  a: ['class', 'href', 'rel', 'target', 'title'],
  blockquote: ['class'],
  caption: ['class'],
  figcaption: ['class'],
  figure: ['class'],
  h2: ['class'],
  h3: ['class'],
  h4: ['class'],
  h5: ['class'],
  h6: ['class'],
  hr: ['class'],
  img: ['alt', 'class', 'height', 'loading', 'src', 'title', 'width'],
  li: ['class'],
  ol: ['class'],
  p: ['class'],
  table: ['class'],
  td: ['class', 'colspan', 'rowspan'],
  th: ['class', 'colspan', 'rowspan', 'scope'],
  ul: ['class'],
}

const SAFE_LINK_SCHEMES = ['http', 'https', 'mailto', 'tel']

const PLAIN_TEXT_SEPARATOR_TAGS = new Set([
  'address',
  'article',
  'aside',
  'blockquote',
  'br',
  'caption',
  'dd',
  'div',
  'dl',
  'dt',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'li',
  'main',
  'ol',
  'p',
  'section',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
])

const SHOPIFY_HTML_CLASS_NAMES: Record<
  ShopifyHtmlVariant,
  ShopifyHtmlClassMap
> = {
  page: {
    blockquote: 'font-display italic border-l-2 border-gold pl-5 text-ink my-8',
    caption: 'type-mono-meta text-ink-faint mb-3',
    figcaption: 'type-mono-meta text-ink-faint mt-3',
    figure: 'my-8',
    h2: 'type-heading-02 text-ink mt-10',
    h3: 'type-heading-03 text-ink mt-8',
    h4: 'type-heading-04 text-ink mt-8',
    h5: 'type-heading-05 text-ink mt-6',
    h6: 'type-label text-ink mt-6',
    hr: 'border-hairline',
    img: 'my-8 h-auto max-w-full rounded-lg border border-hairline',
    li: 'text-ink-soft text-[1.02rem] leading-[1.6] pl-1 marker:text-brand',
    ol: 'list-decimal pl-6',
    p: 'text-ink-soft text-[1.02rem] leading-[1.6]',
    table: 'w-full min-w-full border-collapse',
    td: 'type-body-sm border-b border-hairline-2 p-3 align-top',
    th: 'type-mono-meta text-ink-faint border-b border-hairline-2 p-3 text-left align-top',
    ul: 'list-disc pl-6',
  },
  article: {
    blockquote: 'font-display italic border-l-2 border-gold pl-5 text-ink my-8',
    caption: 'type-mono-meta text-ink-faint mb-3',
    figcaption: 'type-mono-meta text-ink-faint mt-3',
    figure: 'my-8',
    h2: 'type-heading-02 text-ink mt-10',
    h3: 'type-heading-03 text-ink mt-8',
    h4: 'type-heading-04 text-ink mt-8',
    h5: 'type-heading-05 text-ink mt-6',
    h6: 'type-label text-ink mt-6',
    hr: 'border-hairline',
    img: 'my-8 h-auto max-w-full rounded-lg border border-hairline',
    li: 'text-ink-soft text-[1.02rem] leading-[1.6] pl-1 marker:text-brand',
    ol: 'list-decimal pl-6',
    p: 'text-ink-soft text-[1.02rem] leading-[1.6]',
    table: 'w-full min-w-full border-collapse',
    td: 'type-body-sm border-b border-hairline-2 p-3 align-top',
    th: 'type-mono-meta text-ink-faint border-b border-hairline-2 p-3 text-left align-top',
    ul: 'list-disc pl-6',
  },
  compact: {
    blockquote: 'font-display italic border-l-2 border-gold pl-4 text-ink my-6',
    caption: 'type-mono-meta text-ink-faint mb-3',
    figcaption: 'type-mono-meta text-ink-faint mt-3',
    figure: 'my-6',
    h2: 'type-heading-04 text-ink mt-6',
    h3: 'type-heading-05 text-ink mt-5',
    h4: 'type-label text-ink mt-5',
    h5: 'type-label text-ink mt-4',
    h6: 'type-label text-ink mt-4',
    hr: 'border-hairline',
    img: 'my-6 h-auto max-w-full rounded-lg border border-hairline',
    li: 'text-ink-soft text-[1.02rem] leading-[1.6] pl-1 marker:text-brand',
    ol: 'list-decimal pl-6',
    p: 'text-ink-soft text-[1.02rem] leading-[1.6]',
    table: 'w-full min-w-full border-collapse',
    td: 'type-body-sm border-b border-hairline-2 p-3 align-top',
    th: 'type-mono-meta text-ink-faint border-b border-hairline-2 p-3 text-left align-top',
    ul: 'list-disc pl-6',
  },
  collectionStory: {
    blockquote: 'font-display italic border-l-2 border-gold pl-4 text-ink my-6',
    caption: 'type-mono-meta text-ink-faint mb-3',
    figcaption: 'type-mono-meta text-ink-faint mt-3',
    figure: 'my-6',
    h2: 'type-heading-04 text-ink mt-6',
    h3: 'type-heading-05 text-ink mt-5',
    h4: 'type-label text-ink mt-5',
    h5: 'type-label text-ink mt-4',
    h6: 'type-label text-ink mt-4',
    hr: 'border-hairline',
    img: 'my-6 h-auto max-w-full rounded-lg border border-hairline',
    li: 'text-ink-soft text-[1.02rem] leading-[1.6] pl-1 marker:text-brand',
    ol: 'list-decimal pl-6',
    p: 'text-ink-soft text-[1.02rem] leading-[1.6]',
    table: 'w-full min-w-full border-collapse',
    td: 'type-body-sm border-b border-hairline-2 p-3 align-top',
    th: 'type-mono-meta text-ink-faint border-b border-hairline-2 p-3 text-left align-top',
    ul: 'list-disc pl-6',
  },
}

const SHOPIFY_HTML_TABLE_REGION_CLASS_NAMES: Record<
  ShopifyHtmlVariant,
  string
> = {
  page: 'focus-visible:ring-ring my-8 overflow-x-auto rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
  article:
    'focus-visible:ring-ring my-8 overflow-x-auto rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
  compact:
    'focus-visible:ring-ring my-6 overflow-x-auto rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
  collectionStory:
    'focus-visible:ring-ring my-6 overflow-x-auto rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
}

const SHOPIFY_HTML_HEADING_TRANSFORMS: Record<
  ShopifyHtmlVariant,
  Partial<Record<HeadingTag, HeadingTransform>>
> = {
  article: { h1: { tagName: 'h2' } },
  compact: { h1: { tagName: 'h3' }, h2: { tagName: 'h3' } },
  collectionStory: {
    h1: { tagName: 'h3' },
    h2: { tagName: 'h3' },
    h3: { tagName: 'h2', className: 'type-heading-05 text-ink mt-5' },
    h4: { tagName: 'h3', className: 'type-label text-ink mt-5' },
  },
  page: { h1: { tagName: 'h2' } },
}

const SHOPIFY_HTML_LINK_CLASS_NAME =
  'text-brand hover:text-brand-deep focus-visible:ring-ring rounded underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'

const SHOPIFY_HTML_ALLOWED_CLASSES = Array.from(
  new Set(
    [
      SHOPIFY_HTML_LINK_CLASS_NAME,
      ...Object.values(SHOPIFY_HTML_CLASS_NAMES).flatMap((classMap) =>
        Object.values(classMap),
      ),
    ]
      .join(' ')
      .split(/\s+/)
      .filter(Boolean),
  ),
)

function withClass(
  attributes: sanitizeHtml.Attributes,
  className?: string,
): sanitizeHtml.Attributes {
  if (!className) {
    const nextAttributes = { ...attributes }
    delete nextAttributes.class
    return nextAttributes
  }

  return {
    ...attributes,
    class: className,
  }
}

function transformExternalLink(
  tagName: string,
  attributes: sanitizeHtml.Attributes,
): sanitizeHtml.Tag {
  const nextAttributes = { ...attributes }

  if (nextAttributes.target === '_blank') {
    nextAttributes.rel = 'noopener noreferrer'
  } else {
    delete nextAttributes.target
    delete nextAttributes.rel
  }

  return {
    tagName,
    attribs: withClass(nextAttributes, SHOPIFY_HTML_LINK_CLASS_NAME),
  }
}

function transformImage(
  tagName: string,
  attributes: sanitizeHtml.Attributes,
  className?: string,
): sanitizeHtml.Tag {
  return {
    tagName,
    attribs: withClass(
      {
        ...attributes,
        alt: attributes.alt ?? '',
        loading: 'lazy',
      },
      className,
    ),
  }
}

function transformWithClass(
  tagName: string,
  attributes: sanitizeHtml.Attributes,
  classMap: ShopifyHtmlClassMap,
): sanitizeHtml.Tag {
  return {
    tagName,
    attribs: withClass(attributes, classMap[tagName]),
  }
}

function buildAllowedClasses(): NonNullable<
  sanitizeHtml.IOptions['allowedClasses']
> {
  return Object.fromEntries(
    SHOPIFY_HTML_ALLOWED_TAGS.map((tagName) => [
      tagName,
      SHOPIFY_HTML_ALLOWED_CLASSES,
    ]),
  )
}

function buildHeadingTransforms(
  classMap: ShopifyHtmlClassMap,
  headingMap: Partial<Record<HeadingTag, HeadingTransform>>,
): NonNullable<sanitizeHtml.IOptions['transformTags']> {
  const transforms: NonNullable<sanitizeHtml.IOptions['transformTags']> = {
    a: transformExternalLink,
    img: (tagName, attributes) =>
      transformImage(tagName, attributes, classMap.img),
  }

  for (const tagName of Object.keys(classMap)) {
    if (tagName === 'a' || tagName === 'img') continue

    transforms[tagName] = (currentTagName, attributes) =>
      transformWithClass(currentTagName, attributes, classMap)
  }

  for (const [from, transform] of Object.entries(headingMap)) {
    if (!transform) continue
    transforms[from] = (_tagName, attributes) => ({
      tagName: transform.tagName,
      attribs: withClass(
        attributes,
        transform.className ?? classMap[transform.tagName],
      ),
    })
  }

  return transforms
}

function buildShopifyHtmlOptions(
  variant: ShopifyHtmlVariant,
): sanitizeHtml.IOptions {
  const classMap = SHOPIFY_HTML_CLASS_NAMES[variant]

  return {
    allowedAttributes: SHOPIFY_HTML_ALLOWED_ATTRIBUTES,
    allowedClasses: buildAllowedClasses(),
    allowedSchemes: SAFE_LINK_SCHEMES,
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowedSchemesByTag: { img: ['https'] },
    allowedTags: SHOPIFY_HTML_ALLOWED_TAGS,
    allowProtocolRelative: false,
    disallowedTagsMode: 'discard',
    transformTags: buildHeadingTransforms(
      classMap,
      SHOPIFY_HTML_HEADING_TRANSFORMS[variant],
    ),
  }
}

function wrapTablesWithScrollRegion(
  html: string,
  variant: ShopifyHtmlVariant,
): string {
  if (!html.includes('<table')) return html

  const className = SHOPIFY_HTML_TABLE_REGION_CLASS_NAMES[variant]
  const regionOpen = `<div class="${className}" role="region" tabindex="0" aria-label="Scrollable rich text table">`

  return html
    .replace(/<table class="([^"]*)">/g, `${regionOpen}<table class="$1">`)
    .replace(/<table>/g, `${regionOpen}<table>`)
    .replace(/<\/table>/g, '</table></div>')
}

function sanitizeShopifyHtml(
  html: string,
  variant: ShopifyHtmlVariant,
): SanitizedHtml {
  const sanitized = sanitizeHtml(html, buildShopifyHtmlOptions(variant))

  return wrapTablesWithScrollRegion(sanitized, variant) as SanitizedHtml
}

export function sanitizeShopifyPageBodyHtml(html: string): SanitizedHtml {
  return sanitizeShopifyHtml(html, 'page')
}

export function sanitizeShopifyArticleHtml(html: string): SanitizedHtml {
  return sanitizeShopifyHtml(html, 'article')
}

export function sanitizeShopifyCompactHtml(html: string): SanitizedHtml {
  return sanitizeShopifyHtml(html, 'compact')
}

export function sanitizeShopifyCollectionStoryHtml(
  html: string,
): SanitizedHtml {
  return sanitizeShopifyHtml(html, 'collectionStory')
}

export function plainTextFromHtml(html: string): string {
  let prependTextSeparator = false

  return decodePlainTextEntities(
    sanitizeHtml(html, {
      allowedAttributes: {},
      allowedTags: [],
      disallowedTagsMode: 'discard',
      onCloseTag(tagName) {
        if (PLAIN_TEXT_SEPARATOR_TAGS.has(tagName)) {
          prependTextSeparator = true
        }
      },
      onOpenTag(tagName) {
        if (PLAIN_TEXT_SEPARATOR_TAGS.has(tagName)) {
          prependTextSeparator = true
        }
      },
      textFilter(text) {
        if (!prependTextSeparator) return text

        prependTextSeparator = false
        return ` ${text}`
      },
    }),
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function decodePlainTextEntities(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}
