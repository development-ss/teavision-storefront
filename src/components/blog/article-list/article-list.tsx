import { ArticleCard } from '@/components/ui/article-card'
import type { BlogArticleSummary } from '@/lib/blog/operations'
import { formatArticleDate, getArticlePath } from '@/lib/blog/operations'

type ArticleListProps = {
  articles: BlogArticleSummary[]
  blogHandle: string
}

export function ArticleList({ articles, blogHandle }: ArticleListProps) {
  return (
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
    >
      {articles.map((article) => (
        <li key={article.id}>
          <ArticleCard
            article={article}
            href={getArticlePath(blogHandle, article.handle)}
            publishedLabel={formatArticleDate(article.publishedAt)}
            headingLevel="h3"
          />
        </li>
      ))}
    </ul>
  )
}
