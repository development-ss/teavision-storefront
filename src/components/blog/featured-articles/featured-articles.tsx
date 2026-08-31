import { ArticleCard } from '@/components/ui/article-card'
import { Section } from '@/components/ui/section'
import type { BlogArticleSummary } from '@/lib/blog/operations'
import { formatArticleDate, getArticlePath } from '@/lib/blog/operations'

type FeaturedArticlesProps = {
  articles: BlogArticleSummary[]
  blogHandle: string
  className?: string
}

export function FeaturedArticles({
  articles,
  blogHandle,
  className,
}: FeaturedArticlesProps) {
  return (
    <Section.Root tone="sunken" className={className}>
      <Section.Container>
        <Section.Intro
          align="left"
          eyebrow="Tea Journal"
          title="Featured Articles"
        />
        <ul className="grid gap-6 md:grid-cols-2" role="list">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard
                article={article}
                href={getArticlePath(blogHandle, article.handle)}
                publishedLabel={formatArticleDate(article.publishedAt)}
                variant="featured"
                headingLevel="h3"
              />
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
