import {
  firstParam,
  paramValues,
  parsePageParam,
  parseSelectedFilterParams,
  SORT_MAP,
} from '../_lib/page-helpers'
import type { PageProps } from '../_lib/page-types'
import { Results } from './results'

export async function PageContent({ params, searchParams }: PageProps) {
  const [{ handle, category }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ])

  const sortParam = firstParam(resolvedSearchParams.sort)
  const sort = sortParam && sortParam in SORT_MAP ? sortParam : 'featured'
  const query = (firstParam(resolvedSearchParams.q) ?? '').trim().slice(0, 128)
  const page = parsePageParam(resolvedSearchParams.page)
  const { selectedFilters, productFilters } = parseSelectedFilterParams(
    paramValues(resolvedSearchParams.filter),
  )

  return Results({
    handle,
    category,
    query,
    sort,
    page,
    selectedFilters,
    productFilters,
    includeMeta: true,
  })
}
