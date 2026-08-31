import { Skeleton } from '@/components/ui/skeleton'

export function CartLoadingLine() {
  return (
    <li className="border-hairline flex gap-3.5 border-b py-5 last:border-b-0 xl:grid xl:grid-cols-[6rem_minmax(0,1fr)_7rem_10rem_7rem] xl:items-start xl:gap-x-6">
      <Skeleton className="size-19 shrink-0 rounded-lg xl:size-24" />

      <div className="min-w-0 flex-1 xl:flex-none">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-1 h-3.5 w-1/2" />

        <div className="mt-1 xl:hidden">
          <Skeleton className="h-5 w-20" />
        </div>

        <Skeleton className="mt-2 h-4 w-2/3" />

        <div className="mt-1.5 xl:hidden">
          <Skeleton className="h-3.5 w-1/2" />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 xl:hidden">
          <Skeleton className="border-hairline inline-flex h-11 w-28 rounded-full border" />
          <Skeleton className="h-4 w-14" />
        </div>

        <Skeleton className="mt-3 h-4 w-16" />
      </div>

      <div className="hidden xl:block xl:pt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-1 h-3 w-12" />
      </div>

      <div className="hidden xl:flex xl:justify-center xl:pt-0.5">
        <Skeleton className="border-hairline inline-flex h-11 w-28 rounded-full border" />
      </div>

      <div className="hidden xl:block xl:pt-1 xl:text-right">
        <Skeleton className="ml-auto h-4 w-16" />
        <Skeleton className="mt-1 ml-auto h-3 w-12" />
      </div>
    </li>
  )
}
