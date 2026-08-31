import { Skeleton } from '@/components/ui/skeleton'

const CART_LOADING_HEADER_CELLS = [
  'photo',
  'name',
  'unit-price',
  'quantity',
  'total',
] as const

export function CartLoadingHeader() {
  return (
    <div
      className="border-hairline hidden border-b pb-3 xl:grid xl:grid-cols-[6rem_minmax(0,1fr)_7rem_10rem_7rem] xl:items-center xl:gap-x-6"
      aria-label="Loading cart items"
    >
      {CART_LOADING_HEADER_CELLS.map((cell) => (
        <Skeleton key={cell} className="h-4 w-16" />
      ))}
    </div>
  )
}
