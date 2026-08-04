import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { PortableTextContent } from '@/components/blog'
import { RichText } from '@/components/ui/rich-text'
import { Card, Section } from '@/components/ui'
import {
  formatArticleDate,
  getArticle,
  getArticlePath,
  getBlog,
  getCanonicalBlogListingPath,
  getPublicArticleAuthorName,
  getTagPath,
  normalizeBlogHandle,
} from '@/lib/blog/operations'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { serializeInlineJson } from '@/lib/seo/serialize-inline-json'
import { sanitizeShopifyArticleHtml } from '@/lib/shopify/html-content'

type Props = {
  params: Promise<{ blog: string; article: string }>
}

function articleDescription(article: Awaited<ReturnType<typeof getArticle>>) {
  return article?.seo.description ?? article?.excerpt.slice(0, 160) ?? ''
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { blog, article: handle } = await params
  const normalizedBlog = normalizeBlogHandle(blog)
  const article = await getArticle(normalizedBlog, handle)
  if (!article) return withNoindexRobots({ title: 'Article not found' })

  const description = articleDescription(article)
  const title = article.seo.title ?? article.title
  const canonical =
    article.seo.canonicalPath ?? getArticlePath(normalizedBlog, handle)
  const openGraphImage = article.seo.ogImage ?? article.featuredImage

  return withNoindexRobots({
    title,
    description,
    robots: article.seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
      publishedTime: article.publishedAt,
      images: openGraphImage
        ? [
            {
              url: openGraphImage.url,
              alt: openGraphImage.altText ?? article.title,
            },
          ]
        : undefined,
    },
    alternates: { canonical },
  })
}

async function ArticleContent({ params }: Props) {
  const { blog, article: handle } = await params
  const normalizedBlog = normalizeBlogHandle(blog)
  const [article, blogData] = await Promise.all([
    getArticle(normalizedBlog, handle),
    getBlog(normalizedBlog),
  ])

  if (!article || !blogData) notFound()

  const authorName = getPublicArticleAuthorName(article.authorName)
  const articleIndex = blogData.articles.findIndex(
    (item) => item.handle === article.handle,
  )
  const newerArticle =
    articleIndex > 0 ? blogData.articles[articleIndex - 1] : null
  const olderArticle =
    articleIndex >= 0 && articleIndex < blogData.articles.length - 1
      ? blogData.articles[articleIndex + 1]
      : null
  const description = articleDescription(article)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: authorName ?? 'Teavision Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Teavision',
    },
    image: article.featuredImage ? [article.featuredImage.url] : undefined,
    mainEntityOfPage: getArticlePath(normalizedBlog, article.handle),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeInlineJson(jsonLd) }}
      />

      <article className="max-w-wide px-gutter mx-auto w-full py-12 lg:py-16">
        <nav
          aria-label="Breadcrumb"
          className="type-mono-meta text-ink-faint mb-8"
        >
          <ol className="flex min-w-0 items-center gap-2" role="list">
            <li className="shrink-0">
              <Link
                href={getCanonicalBlogListingPath(normalizedBlog)}
                className="text-brand hover:text-brand-deep focus-visible:ring-ring hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Tea Journal
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ink min-w-0 truncate" aria-current="page">
              {article.title}
            </li>
          </ol>
        </nav>

        {article.tags.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={getTagPath(normalizedBlog, tag)}
                className="type-mono-meta text-brand border-hairline bg-card hover:border-brand focus-visible:ring-ring inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        <h1 className="font-display text-ink text-[clamp(2rem,4vw,3.4rem)] leading-[1.04] tracking-[-0.01em] text-pretty">
          {article.title}
        </h1>

        <div className="type-mono-meta text-ink-faint mt-5 flex flex-wrap items-center gap-3">
          <time dateTime={article.publishedAt}>
            {formatArticleDate(article.publishedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{article.readingTimeMinutes} min read</span>
          {authorName && (
            <>
              <span aria-hidden="true">·</span>
              <span>{authorName}</span>
            </>
          )}
        </div>

        {article.featuredImage &&
          article.featuredImage.width &&
          article.featuredImage.height && (
            <div className="bg-paper-2 mt-8 overflow-hidden rounded-lg">
              <Image
                src={article.featuredImage.url}
                alt={article.featuredImage.altText ?? article.title}
                width={article.featuredImage.width}
                height={article.featuredImage.height}
                preload
                sizes="(min-width: 1280px) 1152px, (min-width: 1024px) calc(100vw - 4rem), 100vw"
                className="h-auto w-full object-cover"
              />
            </div>
          )}

        {article.excerpt && (
          <Card className="mt-8" padding="md">
            <p className="type-lede text-ink-soft italic">{article.excerpt}</p>
          </Card>
        )}

        <PortableTextContent value={article.body} className="mt-10" />

        {(newerArticle || olderArticle) && (
          <nav
            aria-label="Adjacent articles"
            className="border-hairline mt-12 grid gap-4 border-t pt-8 sm:grid-cols-2"
          >
            {olderArticle ? (
              <Card interactive>
                <Link
                  href={getArticlePath(normalizedBlog, olderArticle.handle)}
                  className="focus-visible:ring-ring block h-full p-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="type-mono-meta text-ink-faint">
                    Previous Post
                  </span>
                  <span className="type-heading-03 text-ink mt-2 block">
                    {olderArticle.title}
                  </span>
                </Link>
              </Card>
            ) : (
              <span />
            )}

            {newerArticle && (
              <Card interactive className="sm:text-right">
                <Link
                  href={getArticlePath(normalizedBlog, newerArticle.handle)}
                  className="focus-visible:ring-ring block h-full p-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <span className="type-mono-meta text-ink-faint">
                    Next Post
                  </span>
                  <span className="type-heading-03 text-ink mt-2 block">
                    {newerArticle.title}
                  </span>
                </Link>
              </Card>
            )}
          </nav>
        )}

        {article.comments.length > 0 && (
          <Section.Root
            tone="transparent"
            spacing="none"
            className="border-hairline mt-12 border-t pt-8"
          >
            <h2 className="type-heading-03 text-ink">
              Comments {article.comments.length}
            </h2>
            <ul className="mt-5 space-y-4" role="list">
              {article.comments.map((comment) => (
                <Card as="li" key={comment.id} padding="sm">
                  <p className="type-label text-ink">{comment.authorName}</p>
                  <RichText
                    html={sanitizeShopifyArticleHtml(comment.contentHtml)}
                    variant="compact"
                    className="mt-3"
                  />
                </Card>
              ))}
            </ul>
          </Section.Root>
        )}

        <div className="border-hairline mt-12 border-t pt-8">
          <Link
            href={getCanonicalBlogListingPath(normalizedBlog)}
            className="type-label text-brand hover:text-brand-deep focus-visible:ring-ring inline-flex min-h-11 items-center hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Back to Tea Journal
          </Link>
        </div>
      </article>
    </div>
  )
}

export default function ArticlePage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div
          className="type-body text-ink-soft max-w-wide px-gutter mx-auto py-12"
          role="status"
          aria-live="polite"
        >
          Loading article…
        </div>
      }
    >
      <ArticleContent params={params} />
    </Suspense>
  )
}
