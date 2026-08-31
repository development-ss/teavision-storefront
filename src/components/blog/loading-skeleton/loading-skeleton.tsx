import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type LoadingSkeletonProps = {
  articleCount?: number
  className?: string
  includeFeatured?: boolean
  includeHero?: boolean
}

const FEATURED_ARTICLE_COUNT = 2
const TAG_COUNT = 5

export function BlogLoadingSkeleton({
  articleCount = 6,
  className,
  includeFeatured = true,
  includeHero = false,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading articles</span>

      {includeHero ? (
        <Section.Root
          tone="brand"
          spacing="none"
          className="relative isolate overflow-hidden"
        >
          <div
            className="bg-brand-deep absolute inset-0 -z-20 animate-pulse opacity-70 motion-reduce:animate-none"
            aria-hidden="true"
            data-skeleton="blog-hero"
          />
          <Section.Container
            variant="compact"
            className="relative flex flex-col items-center justify-center py-16 text-center md:py-24"
          >
            <div className="bg-paper/35 mb-4 h-3 w-28 animate-pulse rounded motion-reduce:animate-none" />
            <div className="grid w-full max-w-88 gap-3">
              <div className="bg-paper/50 h-10 animate-pulse rounded motion-reduce:animate-none md:h-13" />
              <div className="bg-paper/50 mx-auto h-10 w-4/5 animate-pulse rounded motion-reduce:animate-none md:h-13" />
            </div>
            <div className="mt-5 grid w-full max-w-2xl gap-2">
              <div className="bg-paper/35 h-4 animate-pulse rounded motion-reduce:animate-none" />
              <div className="bg-paper/35 mx-auto h-4 w-5/6 animate-pulse rounded motion-reduce:animate-none" />
            </div>
            <div className="bg-paper/90 mt-8 h-12 w-full max-w-xl animate-pulse rounded-full motion-reduce:animate-none" />
          </Section.Container>
        </Section.Root>
      ) : null}

      {includeFeatured ? (
        <Section.Root tone="sunken">
          <Section.Container>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div aria-hidden="true">
                <div className="bg-paper h-3 w-24 animate-pulse rounded motion-reduce:animate-none" />
                <div className="bg-paper mt-2 h-9 w-56 max-w-full animate-pulse rounded motion-reduce:animate-none" />
              </div>
            </div>
            <ul className="grid gap-6 md:grid-cols-2" role="list">
              {Array.from({ length: FEATURED_ARTICLE_COUNT }, (_, index) => (
                <li key={index}>
                  <Card
                    as="article"
                    overflow="hidden"
                    className="h-full"
                    aria-hidden="true"
                    data-skeleton="featured-article"
                  >
                    <div className="flex h-full flex-col">
                      <div className="bg-paper relative aspect-16/10 animate-pulse overflow-hidden rounded-lg motion-reduce:animate-none" />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="grid gap-2">
                          <Skeleton className="h-8" />
                          <Skeleton className="h-8 w-4/5" />
                        </div>
                        <div className="mt-4 grid gap-2">
                          <Skeleton className="h-4" />
                          <Skeleton className="h-4 w-11/12" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="mt-auto pt-5">
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </Section.Container>
        </Section.Root>
      ) : null}

      <Section.Root
        tone="sunken"
        className={cn(includeFeatured ? 'pt-0' : undefined)}
      >
        <Section.Container>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div aria-hidden="true">
              <div className="bg-paper h-3 w-24 animate-pulse rounded motion-reduce:animate-none" />
              <div className="bg-paper mt-2 h-9 w-48 animate-pulse rounded motion-reduce:animate-none" />
            </div>
            <div
              className="bg-paper h-3 w-20 animate-pulse rounded motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-2" aria-hidden="true">
            {Array.from({ length: TAG_COUNT }, (_, index) => (
              <div
                key={index}
                className="bg-paper h-9 w-24 animate-pulse rounded-full motion-reduce:animate-none"
                data-skeleton="tag"
              />
            ))}
          </div>

          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {Array.from({ length: articleCount }, (_, index) => (
              <li key={index}>
                <Card
                  as="article"
                  overflow="hidden"
                  className="h-full"
                  aria-hidden="true"
                  data-skeleton="article"
                >
                  <div className="flex h-full flex-col">
                    <div className="bg-paper relative aspect-16/10 animate-pulse overflow-hidden rounded-lg motion-reduce:animate-none" />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-3 flex gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-18" />
                      </div>
                      <div className="grid gap-2">
                        <Skeleton className="h-6" />
                        <Skeleton className="h-6 w-4/5" />
                      </div>
                      <div className="mt-4 grid gap-2">
                        <Skeleton className="h-4" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                      <div className="mt-auto pt-5">
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </Section.Container>
      </Section.Root>
    </div>
  )
}
