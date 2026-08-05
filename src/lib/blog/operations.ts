import type { SanityImageSource } from '@sanity/image-url'
import { cacheLife, cacheTag } from 'next/cache'

import { formatAustralianDate } from '@/lib/date-formatting'
import {
  blogArticleQuery,
  blogListingQuery,
  defaultBlogListingQuery,
  homepageBlogPostsQuery,
} from '@/lib/sanity/queries/blog'
import { getSanityImageUrl, sanityFetch } from '@/lib/sanity/client'
import type { SanityImageUrlOptions } from '@/lib/sanity/client'
import type {
  SanityBlogPost,
  SanityBlogPostSummary,
  SanityBlogListingResult,
  SanityDefaultBlogListingResult,
  SanityBlogPostResult,
  SanityImageWithAlt,
  SanityPortableTextBlock,
  SanitySeo,
} from '@/lib/sanity/types'

import { DEFAULT_BLOG_HANDLE, normalizeBlogHandle, slugifyTag } from './paths'

export {
  CANONICAL_BLOG_LISTING_PATH,
  DEFAULT_BLOG_HANDLE,
  LEGACY_BLOG_HANDLE,
  getArticlePath,
  getBlogPath,
  getCanonicalBlogListingPath,
  getTagPath,
  normalizeBlogHandle,
  slugifyTag,
} from './paths'

const WORDS_PER_MINUTE = 220
const FALLBACK_PUBLISHED_AT = '1970-01-01T00:00:00.000Z'
const HIDDEN_AUTHOR_PATTERN = /\bking\s+kong\b/i

export const ARTICLES_PER_PAGE = 6

export type BlogImage = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
  lqip?: string | null
}

export type BlogSeo = {
  title: string | null
  description: string | null
  canonicalPath: string | null
  noIndex: boolean
  ogImage: BlogImage | null
}

export type BlogComment = {
  id: string
  authorName: string
  contentHtml: string
}

export type BlogArticleSummary = {
  id: string
  handle: string
  title: string
  excerpt: string
  featuredImage: BlogImage | null
  publishedAt: string
  tags: string[]
  authorName: string | null
  seo: BlogSeo
  readingTimeMinutes: number
}

export type BlogArticle = BlogArticleSummary & {
  body: SanityPortableTextBlock[]
  comments: BlogComment[]
  updatedAt: string
}

export type BlogIndex = {
  id: string
  handle: string
  title: string
  description: string
  heroImage: BlogImage | null
  seo: BlogSeo
  articles: BlogArticleSummary[]
  featuredArticles: BlogArticleSummary[]
}

export type PaginatedArticles = {
  articles: BlogArticleSummary[]
  currentPage: number
  totalPages: number
  totalArticles: number
}

/**
 * Lightweight listing result for the unfiltered default /blogs/[handle] route.
 * articles contains only the first page of latest articles (no bodyText).
 * featuredArticles contains up to 2 configured featured articles.
 * paginated contains server-computed pagination metadata for the non-featured remainder.
 * allTags is the deduplicated union of all article categories and tags for tag navigation.
 *
 * Tag/search pages use getBlog() + in-memory filtering instead of this type.
 */
export type DefaultBlogListing = {
  id: string
  handle: string
  title: string
  description: string
  heroImage: BlogImage | null
  seo: BlogSeo
  featuredArticles: BlogArticleSummary[]
  paginated: PaginatedArticles
  allTags: string[]
}

// Bounded Sanity image URL options by use case.
// Quality is constrained to the values allowed in next.config.ts (68 or 75).
const IMAGE_OPTIONS_HERO: SanityImageUrlOptions = {
  width: 1920,
  quality: 75,
  fit: 'max',
}
const IMAGE_OPTIONS_FEATURED_CARD: SanityImageUrlOptions = {
  width: 900,
  quality: 75,
  fit: 'max',
}
const IMAGE_OPTIONS_CARD: SanityImageUrlOptions = {
  width: 960,
  quality: 75,
  fit: 'max',
}

function isNonEmpty(value: string | null | undefined): value is string {
  return Boolean(value?.trim())
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  return `${text.slice(0, maxLength).trimEnd()}…`
}

function normalizeBodyText(bodyText: string | null): string {
  return bodyText?.replace(/\s+/g, ' ').trim() ?? ''
}

export function getPublicArticleAuthorName(
  name: string | null | undefined,
): string | null {
  const normalized = name?.trim()

  if (!normalized || HIDDEN_AUTHOR_PATTERN.test(normalized)) {
    return null
  }

  return normalized
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

function reshapeImage(
  image: SanityImageWithAlt | null,
  imageOptions?: SanityImageUrlOptions,
): BlogImage | null {
  const source = image?.image
  const asset = source?.asset
  if (!asset?._id && !asset?.url) return null

  let url = asset.url
  if (asset._id && source) {
    try {
      url = getSanityImageUrl(source as SanityImageSource, imageOptions)
    } catch {
      url = asset.url
    }
  }

  if (!url) return null

  return {
    url,
    altText: image?.alt ?? null,
    width: asset.metadata?.dimensions?.width ?? null,
    height: asset.metadata?.dimensions?.height ?? null,
    lqip: asset.metadata?.lqip ?? null,
  }
}

function reshapeSeo(
  seo: SanitySeo | null,
  fallbackDescription?: string,
): BlogSeo {
  return {
    title: seo?.metaTitle ?? null,
    description: seo?.metaDescription ?? fallbackDescription ?? null,
    canonicalPath: seo?.canonicalPath ?? null,
    noIndex: seo?.noIndex ?? false,
    ogImage: reshapeImage(seo?.ogImage ?? null),
  }
}

function uniqueLabels(labels: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const label of labels) {
    const normalized = label.trim()
    const key = normalized.toLowerCase()
    if (!normalized || seen.has(key)) continue

    seen.add(key)
    unique.push(normalized)
  }

  return unique
}

function reshapeTags(article: SanityBlogPostSummary): string[] {
  return uniqueLabels([
    ...(article.categories ?? [])
      .map((category) => category.title)
      .filter(isNonEmpty),
    ...(article.tags ?? []).filter(isNonEmpty),
  ])
}

function reshapeArticleSummary(
  article: SanityBlogPostSummary,
  imageOptions: SanityImageUrlOptions = IMAGE_OPTIONS_CARD,
): BlogArticleSummary {
  const bodyText = normalizeBodyText(article.bodyText)
  const excerpt = article.excerpt?.trim() || truncateText(bodyText, 180)
  const title = article.title?.trim() || 'Untitled article'

  return {
    id: article._id,
    handle: article.slug ?? article._id,
    title,
    excerpt,
    featuredImage: reshapeImage(article.featuredImage, imageOptions),
    publishedAt: article.publishedAt ?? FALLBACK_PUBLISHED_AT,
    tags: reshapeTags(article),
    authorName: getPublicArticleAuthorName(article.author?.name),
    seo: reshapeSeo(article.seo, excerpt),
    readingTimeMinutes: estimateReadingTime(bodyText || excerpt),
  }
}

function reshapeComment(
  comment: NonNullable<SanityBlogPost['legacyComments']>[number],
  index: number,
): BlogComment {
  return {
    id: comment.id ?? comment._key ?? `legacy-comment-${index}`,
    authorName: comment.authorName?.trim() || 'Reader',
    contentHtml: comment.contentHtml ?? '',
  }
}

function reshapeArticle(article: SanityBlogPost): BlogArticle {
  const summary = reshapeArticleSummary(article)

  return {
    ...summary,
    body: article.body ?? [],
    comments: (article.legacyComments ?? []).map(reshapeComment),
    updatedAt: article._updatedAt ?? summary.publishedAt,
  }
}

export function isLocalCanonicalPath(
  canonicalPath: string | null,
  localPath: string,
  baseUrl: string,
): boolean {
  return (
    !canonicalPath ||
    canonicalPath === localPath ||
    canonicalPath === `${baseUrl}${localPath}`
  )
}

export function findTagBySlug(tags: string[], slug?: string): string | null {
  if (!slug) return null
  return (
    tags.find(
      (tag) => slugifyTag(tag) === slugifyTag(decodeURIComponent(slug)),
    ) ?? null
  )
}

export function formatArticleDate(iso: string): string {
  return formatAustralianDate(iso) ?? 'Date unavailable'
}

export function getUniqueArticleTags(articles: BlogArticleSummary[]): string[] {
  return Array.from(new Set(articles.flatMap((article) => article.tags))).sort(
    (a, b) => a.localeCompare(b, 'en-AU', { sensitivity: 'base' }),
  )
}

export function filterArticles({
  articles,
  activeTag,
  query,
}: {
  articles: BlogArticleSummary[]
  activeTag?: string | null
  query?: string | null
}): BlogArticleSummary[] {
  const term = query?.trim().toLowerCase()

  return articles.filter((article) => {
    if (activeTag && !article.tags.includes(activeTag)) return false
    if (!term) return true

    const searchable = [
      article.title,
      article.excerpt,
      article.authorName ?? '',
      article.tags.join(' '),
    ]
      .join(' ')
      .toLowerCase()

    return searchable.includes(term)
  })
}

export function paginateArticles({
  articles,
  page,
  perPage = ARTICLES_PER_PAGE,
}: {
  articles: BlogArticleSummary[]
  page: number
  perPage?: number
}): PaginatedArticles {
  const totalPages = Math.max(1, Math.ceil(articles.length / perPage))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * perPage

  return {
    articles: articles.slice(start, start + perPage),
    currentPage,
    totalPages,
    totalArticles: articles.length,
  }
}

export function getFeaturedArticles(
  articles: BlogArticleSummary[],
  preferredArticles: BlogArticleSummary[] = [],
): BlogArticleSummary[] {
  const byId = new Map(articles.map((article) => [article.id, article]))
  const featured: BlogArticleSummary[] = []
  const seen = new Set<string>()

  for (const article of preferredArticles) {
    const publishedArticle = byId.get(article.id)
    if (!publishedArticle || seen.has(publishedArticle.id)) continue

    seen.add(publishedArticle.id)
    featured.push(publishedArticle)
  }

  for (const article of articles) {
    if (featured.length >= 2) break
    if (seen.has(article.id)) continue

    seen.add(article.id)
    featured.push(article)
  }

  return featured
}

export async function getBlog(handle: string): Promise<BlogIndex | null> {
  'use cache'
  const normalizedHandle = normalizeBlogHandle(handle)
  cacheTag('blog', `blog-${normalizedHandle}`)
  cacheLife('hours')

  const data = await sanityFetch<SanityBlogListingResult>(blogListingQuery, {
    blogHandle: normalizedHandle,
  })

  if (!data.blog) return null

  const articles = data.articles.map((a) =>
    reshapeArticleSummary(a, IMAGE_OPTIONS_CARD),
  )
  const featuredArticles = getFeaturedArticles(
    articles,
    (data.blog.featuredPosts ?? []).map((a) =>
      reshapeArticleSummary(a, IMAGE_OPTIONS_FEATURED_CARD),
    ),
  )
  const description = data.blog.description?.trim() ?? ''

  return {
    id: data.blog._id,
    handle: data.blog.slug ?? normalizedHandle,
    title: data.blog.title?.trim() || 'Tea Journal',
    description,
    heroImage: reshapeImage(data.blog.heroImage, IMAGE_OPTIONS_HERO),
    seo: reshapeSeo(data.blog.seo, description),
    articles,
    featuredArticles,
  }
}

export async function getArticle(
  blogHandle: string,
  articleHandle: string,
): Promise<BlogArticle | null> {
  'use cache'
  const normalizedHandle = normalizeBlogHandle(blogHandle)
  cacheTag(
    'blog',
    `blog-${normalizedHandle}`,
    `article-${normalizedHandle}-${articleHandle}`,
  )
  cacheLife('hours')

  const data = await sanityFetch<SanityBlogPostResult>(blogArticleQuery, {
    articleHandle,
    blogHandle: normalizedHandle,
  })

  return data.article ? reshapeArticle(data.article) : null
}

/**
 * Light fetch for the unfiltered default /blogs/[handle] listing.
 * Fetches only blog metadata, featured posts, and the first page of non-featured articles.
 * bodyText is omitted — reading time is estimated from excerpt instead.
 *
 * Use getBlog() for tag/search paths where full article list is required for in-memory filtering.
 */
export async function getDefaultBlogListing(
  handle: string,
  page: number,
): Promise<DefaultBlogListing | null> {
  'use cache'
  const normalizedHandle = normalizeBlogHandle(handle)
  cacheTag('blog', `blog-${normalizedHandle}`)
  cacheLife('hours')

  const requestedPage = Math.max(1, page)
  const offset = (requestedPage - 1) * ARTICLES_PER_PAGE
  const limit = offset + ARTICLES_PER_PAGE

  const data = await sanityFetch<SanityDefaultBlogListingResult>(
    defaultBlogListingQuery,
    {
      blogHandle: normalizedHandle,
      offset,
      limit,
    },
  )

  if (!data.blog) return null

  const rawFeatured = (data.blog.featuredPosts ?? []) as SanityBlogPostSummary[]
  const featuredArticles = rawFeatured
    .slice(0, 2)
    .map((a) => reshapeArticleSummary(a, IMAGE_OPTIONS_FEATURED_CARD))

  const totalArticles = data.totalCount
  const totalPages = Math.max(1, Math.ceil(totalArticles / ARTICLES_PER_PAGE))
  const currentPage = Math.min(requestedPage, totalPages)

  // An out-of-range page lands past the article window — refetch the clamped
  // last page so the grid shows content instead of rendering empty (matches
  // the filtered path, which clamps before slicing).
  let rawArticles = data.articles as SanityBlogPostSummary[]
  if (currentPage !== requestedPage) {
    const clampedOffset = (currentPage - 1) * ARTICLES_PER_PAGE
    const clamped = await sanityFetch<SanityDefaultBlogListingResult>(
      defaultBlogListingQuery,
      {
        blogHandle: normalizedHandle,
        offset: clampedOffset,
        limit: clampedOffset + ARTICLES_PER_PAGE,
      },
    )
    rawArticles = (clamped.articles ?? []) as SanityBlogPostSummary[]
  }

  const pageArticles = rawArticles.map((a) =>
    reshapeArticleSummary(a, IMAGE_OPTIONS_CARD),
  )
  const description = data.blog.description?.trim() ?? ''

  // Derive all unique tags from the lightweight allTagArrays subquery
  const allTags = uniqueLabels(
    (data.allTagArrays ?? []).flatMap((entry) => [
      ...(entry.categories ?? []).filter((v): v is string => Boolean(v)),
      ...(entry.tags ?? []).filter((v): v is string => Boolean(v)),
    ]),
  ).sort((a, b) => a.localeCompare(b, 'en-AU', { sensitivity: 'base' }))

  return {
    id: data.blog._id,
    handle: data.blog.slug ?? normalizedHandle,
    title: data.blog.title?.trim() || 'Tea Journal',
    description,
    heroImage: reshapeImage(data.blog.heroImage, IMAGE_OPTIONS_HERO),
    seo: reshapeSeo(data.blog.seo, description),
    featuredArticles,
    paginated: {
      articles: pageArticles,
      currentPage,
      totalPages,
      totalArticles,
    },
    allTags,
  }
}

export type TagListingResult = {
  activeTag: string
  tags: string[]
  paginated: PaginatedArticles
}

/**
 * Tag-filtered listing for /blogs/[blog]/tagged/[tag]. Filters the cached blog
 * articles in memory and paginates. Returns null when the blog or tag is unknown
 * so the route can render notFound().
 */
export async function getTagListing(
  handle: string,
  tagSlug: string,
  page: number,
): Promise<TagListingResult | null> {
  const blogData = await getBlog(handle)
  if (!blogData) return null

  const tags = getUniqueArticleTags(blogData.articles)
  const activeTag = findTagBySlug(tags, tagSlug)
  if (!activeTag) return null

  const filteredArticles = filterArticles({
    articles: blogData.articles,
    activeTag,
    query: null,
  })
  const paginated = paginateArticles({ articles: filteredArticles, page })

  return { activeTag, tags, paginated }
}

export type SearchListingResult = {
  tags: string[]
  paginated: PaginatedArticles
}

/**
 * Query-filtered listing for the dedicated /blogs/[blog]/search route. Matches
 * are shown on a single page (the journal is small), so no path-based pagination
 * is needed and the query never leaks into pagination URLs.
 */
export async function getBlogSearchListing(
  handle: string,
  query: string,
): Promise<SearchListingResult | null> {
  const blogData = await getBlog(handle)
  if (!blogData) return null

  const tags = getUniqueArticleTags(blogData.articles)
  const matches = filterArticles({
    articles: blogData.articles,
    activeTag: null,
    query,
  })

  return {
    tags,
    paginated: {
      articles: matches,
      currentPage: 1,
      totalPages: 1,
      totalArticles: matches.length,
    },
  }
}

export async function getHomepageArticles(
  blogHandle = DEFAULT_BLOG_HANDLE,
  maxPosts = 3,
): Promise<BlogArticleSummary[]> {
  'use cache'
  const normalizedHandle = normalizeBlogHandle(blogHandle)
  const limit = normalizeHomepageArticleLimit(maxPosts)
  cacheTag('blog', `blog-${normalizedHandle}`)
  cacheLife('hours')

  const articles = await sanityFetch<SanityBlogPostSummary[]>(
    homepageBlogPostsQuery,
    { blogHandle: normalizedHandle, limit },
  )

  return articles.map((a) => reshapeArticleSummary(a))
}

function normalizeHomepageArticleLimit(maxPosts: number): number {
  if (!Number.isFinite(maxPosts)) return 3

  return Math.min(Math.max(1, Math.trunc(maxPosts)), 3)
}
