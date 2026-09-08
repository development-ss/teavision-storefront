import { Section } from '@/components/ui/section'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type LoadingSkeletonProps = {
  className?: string
  productCount?: number
  showHero?: boolean
  sidebarRowCount?: number
}

export function LoadingSkeleton({
  className,
  productCount = 6,
  showHero = true,
  sidebarRowCount = 5,
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Loading collection</span>
      {showHero ? (
        <Section.Root tone="transparent" spacing="none" className="pt-6">
          <Section.Container>
            <div aria-hidden="true">
              <Skeleton className="mb-5 h-5 w-64 max-w-full" />
              <div
                className="bg-paper grid md:min-h-120 lg:min-h-132 lg:grid-cols-2"
                data-skeleton="hero"
              >
                <div className="grid content-center gap-6 px-6 py-10 sm:px-8 md:py-14 lg:px-12 lg:py-16">
                  <Skeleton className="h-12 w-4/5" />
                  <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="aspect-3/2 w-full self-center rounded-none" />
              </div>
            </div>
          </Section.Container>
        </Section.Root>
      ) : null}
      <Section.Root tone="transparent" className="pt-8 md:pt-10">
        <Section.Container>
          <div className="mb-6" aria-hidden="true">
            <div className="mb-4 flex items-center justify-between gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-42" />
            </div>

            <div className="bg-paper border-hairline mt-2 h-12 animate-pulse rounded-lg border motion-reduce:animate-none lg:hidden" />
          </div>
          <div className="grid gap-10 lg:grid-cols-[252px_1fr] lg:items-start">
            <div className="hidden gap-5 lg:grid" aria-hidden="true">
              <div className="bg-brand-tint border-brand/20 rounded-lg border p-5.5">
                <div className="bg-paper/70 h-6 w-36 animate-pulse rounded motion-reduce:animate-none" />
                <div className="mt-3 grid gap-2">
                  <div className="bg-paper/70 h-3 w-full animate-pulse rounded motion-reduce:animate-none" />
                  <div className="bg-paper/70 h-3 w-11/12 animate-pulse rounded motion-reduce:animate-none" />
                  <div className="bg-paper/70 h-3 w-4/5 animate-pulse rounded motion-reduce:animate-none" />
                </div>
                <div className="bg-brand/20 mt-4 h-10 w-full animate-pulse rounded-full motion-reduce:animate-none" />
              </div>
              {Array.from({ length: sidebarRowCount }, (_, index) => (
                <Skeleton key={index} className="h-9" data-skeleton="sidebar" />
              ))}
            </div>
            <ul className="grid gap-4 sm:gap-5" role="list" aria-hidden="true">
              {Array.from({ length: productCount }, (_, index) => (
                <li
                  key={index}
                  className="border-hairline bg-card grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 rounded-lg border p-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-6 sm:p-5 lg:grid-cols-[14rem_minmax(0,1fr)]"
                  data-skeleton="product"
                >
                  <Skeleton className="aspect-square rounded-md sm:row-span-2" />
                  <div>
                    <Skeleton className="mb-1 h-3 w-18" />
                    <Skeleton className="my-1.5 h-6 w-4/5" />
                    <Skeleton className="mt-1.5 h-4 w-20" />
                  </div>
                  <div className="col-span-2 grid gap-2 sm:col-span-1 sm:col-start-2">
                    <Skeleton className="h-5 w-20" />
                    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
                      <Skeleton className="h-11 rounded-full" />
                      <Skeleton className="h-11 rounded-full" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Section.Container>
      </Section.Root>
    </div>
  )
}
