import { getListingHref } from '@/lib/blog/listing'

export type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right'

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage])
  if (currentPage > 2) pages.add(currentPage - 1)
  if (currentPage < totalPages - 1) pages.add(currentPage + 1)

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const items: PaginationItem[] = []

  for (const page of sorted) {
    const previous = items[items.length - 1]
    if (typeof previous === 'number' && page - previous > 1) {
      items.push(previous === 1 ? 'ellipsis-left' : 'ellipsis-right')
    }
    items.push(page)
  }

  return items
}

export function getPaginationHref({
  activeTag,
  blogHandle,
  page,
}: {
  activeTag: string | null
  blogHandle: string
  page: number
}) {
  const path = getListingHref({
    activeTag,
    blogHandle,
    page,
  })

  return `${path}#articles`
}
