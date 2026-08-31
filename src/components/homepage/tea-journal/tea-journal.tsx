import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import {
  CANONICAL_BLOG_LISTING_PATH,
  formatArticleDate,
  getArticlePath,
  getHomepageArticles,
  type BlogArticleSummary,
} from '@/lib/blog/operations'
import type { HomepageContent } from '@/lib/sanity/home-page'

export type TeaJournalProps = HomepageContent['teaJournal']

export type TeaJournalSectionProps = {
  articles: BlogArticleSummary[]
  config: TeaJournalProps
}

export async function TeaJournal(config: TeaJournalProps) {
  const articles = await getHomepageArticles(config.blogHandle, config.maxPosts)

  if (articles.length === 0) return null

  return <TeaJournalSection articles={articles} config={config} />
}

export function TeaJournalSection({
  articles,
  config,
}: TeaJournalSectionProps) {
  const visibleArticles = articles.slice(0, config.maxPosts)

  return (
    <Section.Root tone="surface">
      <Section.Container>
        {/* Header per design .range__head: items-end, h2 + View-all link-arrow, 40px below */}
        <div className="flex flex-wrap items-end justify-between gap-7.5">
          <div>
            {config.intro.eyebrow && <Eyebrow>{config.intro.eyebrow}</Eyebrow>}
            <h2 className="type-heading-01 text-ink mt-4">
              {config.intro.title}
            </h2>
            {config.intro.copy && (
              <p className="type-lede text-ink-soft mt-4 max-w-[62ch]">
                {config.intro.copy}
              </p>
            )}
          </div>

          <Link
            href={CANONICAL_BLOG_LISTING_PATH}
            className="focus-visible:ring-ring border-hairline text-ink hover:border-brand hover:text-brand inline-flex items-center gap-2 border-b-[1.5px] pb-0.75 text-[0.92rem] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&_svg]:transition-transform hover:[&_svg]:translate-x-1"
          >
            {config.linkLabel}
            <ArrowRight
              className="size-3.75"
              aria-hidden="true"
              strokeWidth={1.8}
            />
          </Link>
        </div>

        <ul className="mt-8 grid min-w-0 gap-8 md:mt-10 md:grid-cols-3 md:gap-5.5">
          {visibleArticles.map((article) => (
            <li key={article.id} className="min-w-0 overflow-hidden">
              <Link
                href={getArticlePath(config.blogHandle, article.handle)}
                className="group focus-visible:ring-ring flex min-w-0 flex-col overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:h-full"
              >
                {/* Standard 3:2 ratio — scales with column width instead of a fixed 220px */}
                <div className="bg-paper-2 relative mb-4.5 aspect-3/2 overflow-hidden rounded-lg">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage.url}
                      alt={article.featuredImage.altText ?? article.title}
                      fill
                      sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <div
                      className="bg-brand-tint size-full"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-col overflow-hidden">
                  <p className="type-mono-meta text-ink-faint flex gap-3">
                    <span className="text-brand">
                      {article.tags[0] ?? 'Tea Journal'}
                    </span>
                    <span aria-hidden="true">·</span>
                    {formatArticleDate(article.publishedAt)}
                  </p>
                  <h3 className="font-display text-ink group-hover:text-brand mt-2.5 line-clamp-2 text-[1.25rem] leading-[1.18] wrap-break-word transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-ink-soft mt-2.5 line-clamp-3 text-sm leading-relaxed wrap-break-word">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
