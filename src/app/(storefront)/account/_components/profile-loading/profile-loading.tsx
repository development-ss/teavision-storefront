import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileLoading() {
  return (
    <Card
      padding="lg"
      radius="lg"
      tone="surface"
      className="mx-auto w-full max-w-3xl"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading profile</span>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 rounded-sm" />
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 rounded-sm" />
          </div>
        </div>

        <div className="grid gap-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-12 rounded-sm" />
          <Skeleton className="h-4 w-60 max-w-full" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Skeleton className="h-11 w-full rounded-full sm:w-36" />
          <Skeleton className="h-11 w-full rounded-full sm:w-32" />
        </div>
      </div>
    </Card>
  )
}
