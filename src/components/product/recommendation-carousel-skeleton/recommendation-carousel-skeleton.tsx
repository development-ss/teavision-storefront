import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type RecommendationCarouselSkeletonProps = {
  className?: string
  /* Matches the lg breakpoint of RelatedProductsCarousel (4 visible slides) */
  count?: number
}

export function RecommendationCarouselSkeleton({
  className,
  count = 4,
}: RecommendationCarouselSkeletonProps) {
  return (
    <div
      className={cn('overflow-hidden', className)}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading recommendations…</span>
      <ul className="-ml-4 flex" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="min-w-0 flex-[0_0_100%] pl-4 min-[360px]:flex-[0_0_50%] sm:flex-[0_0_33.333333%] lg:flex-[0_0_25%]"
          >
            <div className="flex h-full flex-col">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="flex flex-col pt-4">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="my-1.5 h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
