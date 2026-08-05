import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'

import { Toolbar } from '@/components/collection'
import { SearchPageSearchForm } from '@/components/search/search-results-view/search-page-search-form'
import { Section } from '@/components/ui'
import { getVisibleProductReviewSummary } from '@/lib/reviews/summary'
import { getTrustooProductRatings } from '@/lib/reviews/trustoo'
import { SITE_URL } from '@/lib/seo/site-url'
import {
  COLLECTION_PRODUCT_PAGE_SIZE,
  getCollection,
  getCollectionPageIndex,
  getCollectionProductsPage,
  getCollectionSummaries,
  getCollectionTagCounts,
} from '@/lib/shopify/operations/collection'
import type {
  CollectionProductFilter,
  ProductFilter,
} from '@/lib/shopify/types'

import {
  buildCategoryFilter,
  filterProductsByCategoryTags,
  findCategoryTagForPath,
  getCategoryFilterInput,
  getHeroImage,
  getHref,
  getPaginationHref,
  getPath,
  getSidebarCollections,
  isAvailabilityFilter,
  isCategoryFilter,
  isPriceFilter,
  isVendorFilter,
  matchCategoryTag,
  SORT_MAP,
} from '../_lib/page-helpers'
import { JsonLd } from './json-ld'
import { ProductList } from './product-list'
import { Sidebar } from './sidebar'

type ResultsProps = {
  handle: string
  category?: string
  query?: string
  sort: string
  page: number
  selectedFilters: string[]
  productFilters: ProductFilter[]
  // JsonLd and rel=prev/next must render exactly once in the served HTML, so
  // only the query-resolved PageContent emits them — never the Suspense
  // fallback copy of this view.
  includeMeta: boolean
}

export async function Results({
  handle,
  category,
  query = '',
  sort,
  page,
  selectedFilters,
  productFilters,
  includeMeta,
}: ResultsProps) {
  const { sortKey, reverse } = SORT_MAP[sort]

  // Resolve category tag and validate from initial (no-cursor) products fetch
  // We need filters for category tag lookup — fetch page 1 without cursor for filter metadata
  const [collection, initialProductsResult, collectionSummaries] =
    await Promise.all([
      getCollection(handle),
      getCollectionProductsPage(
        handle,
        1,
        COLLECTION_PRODUCT_PAGE_SIZE,
        sortKey,
        reverse,
        productFilters,
      ),
      getCollectionSummaries(),
    ])

  if (!collection) notFound()

  const sidebarCollections = getSidebarCollections(collectionSummaries)
  let selectedCategoryTag = findCategoryTagForPath(
    category,
    initialProductsResult.filters,
    initialProductsResult.products,
  )
  // Category tags are only visible on fetched products (Shopify exposes no
  // tag facet for this store), so a category whose products all sit beyond
  // page 1 can't resolve from the initial fetch — rescue it from the full
  // cursor index before 404ing.
  if (category && !selectedCategoryTag) {
    const baseTagCounts = await getCollectionTagCounts(
      handle,
      sortKey,
      reverse,
      productFilters,
    )
    selectedCategoryTag = matchCategoryTag(category, Object.keys(baseTagCounts))
  }
  if (category && !selectedCategoryTag) notFound()

  const activeProductFilters = selectedCategoryTag
    ? [{ tag: selectedCategoryTag }, ...productFilters]
    : productFilters
  const activeSelectedFilters = selectedCategoryTag
    ? [getCategoryFilterInput(selectedCategoryTag), ...selectedFilters]
    : selectedFilters

  // Get cursor index for true total pages and resolve the requested page.
  // Shopify silently ignores the category `{ tag }` filter (no tag facets
  // enabled), so the index passes selectedCategoryTag to derive display
  // pages from the raw pages that actually contain matching products.
  // Both calls read the same cached index entry — no extra Shopify requests.
  const [pageIndex, indexTagCounts] = await Promise.all([
    getCollectionPageIndex(
      handle,
      COLLECTION_PRODUCT_PAGE_SIZE,
      sortKey,
      reverse,
      activeProductFilters,
      selectedCategoryTag,
    ),
    getCollectionTagCounts(handle, sortKey, reverse, activeProductFilters),
  ])

  // Redirect out-of-range pages to last valid page (D-24)
  // Pagination hrefs use the plain selectedFilters: the category is already
  // encoded in the URL path, so re-serialising it as a ?filter= param would
  // emit a second, non-canonical URL variant for every category page.
  if (page > pageIndex.totalPages && pageIndex.totalPages > 0) {
    const lastPageHref = getPaginationHref({
      category,
      handle,
      page: pageIndex.totalPages,
      selectedFilters,
      sort,
    })
    redirect(lastPageHref)
  }

  // Fetch the actual products for this page. With a category active, display
  // page N maps to the raw index page that holds its matching products.
  const rawPage = pageIndex.displayPageToRawPage?.[page - 1] ?? page
  const collectionProductsResult =
    page === 1 && !selectedCategoryTag
      ? initialProductsResult
      : await getCollectionProductsPage(
          handle,
          rawPage,
          COLLECTION_PRODUCT_PAGE_SIZE,
          sortKey,
          reverse,
          activeProductFilters,
        )

  const products = filterProductsByCategoryTags(
    collectionProductsResult.products,
    selectedCategoryTag,
  )

  // Stale-cursor fallback (D-22): the index and page caches can disagree after
  // a collection shrinks, so an in-range page can come back empty. Checked on
  // the visible (category-filtered) list so a category page whose raw page no
  // longer holds matches also falls back. Always step strictly downward so we
  // can never redirect to the URL currently being served — the chain
  // terminates at page 1, which renders the normal empty state instead of
  // redirecting.
  if (products.length === 0 && page > 1) {
    const fallbackPage = Math.min(page - 1, pageIndex.totalPages)
    redirect(
      getPaginationHref({
        category,
        handle,
        page: fallbackPage,
        selectedFilters,
        sort,
      }),
    )
  }

  const trustooProductRatings = await getTrustooProductRatings(
    products.map((product) => product.handle),
  )
  const productsWithRatings = products.map((product) => {
    const visibleRating = getVisibleProductReviewSummary(
      trustooProductRatings[product.handle] ?? {
        rating: product.rating,
        reviewCount: product.reviewCount,
      },
    )

    return {
      ...product,
      rating: visibleRating?.rating,
      reviewCount: visibleRating?.reviewCount,
    }
  })
  const normalizedQuery = query.toLocaleLowerCase()
  const displayedProducts = normalizedQuery
    ? productsWithRatings.filter((product) =>
        product.title.toLocaleLowerCase().includes(normalizedQuery),
      )
    : productsWithRatings

  const clearFiltersHref = getHref(handle, sort)
  const categoryFilter = buildCategoryFilter({
    products: initialProductsResult.products,
    sourceFilter: initialProductsResult.filters.find(isCategoryFilter),
    handle,
    selectedCategoryTag,
    sort,
    selectedFilters,
    indexTagCounts,
  })

  const totalPages = pageIndex.totalPages
  const currentPage = page
  const visibleFilters = [
    categoryFilter,
    ...collectionProductsResult.filters.filter(
      (filter) =>
        !isVendorFilter(filter) &&
        !isAvailabilityFilter(filter) &&
        !isPriceFilter(filter) &&
        !isCategoryFilter(filter),
    ),
  ].filter((filter): filter is CollectionProductFilter => Boolean(filter))
  const collectionPath = category
    ? `${getPath(handle)}/${category}`
    : getPath(handle)
  const collectionUrl = `${SITE_URL}${collectionPath}`
  const clearSearchHref = getPaginationHref({
    category,
    handle,
    page: 1,
    selectedFilters,
    sort,
  })
  const collectionHeroImage = getHeroImage(
    collection.featuredImage,
    collection.descriptionHtml,
  )
  const hasRenderableCollectionHeroImage = Boolean(
    !category && collectionHeroImage?.width && collectionHeroImage.height,
  )

  // Prev/next link tags for adjacent pages — hoisted to <head> by React 19 (D-05)
  // The Next 16 Metadata API has no prev/next field, so we render them as JSX links.
  const prevPageHref =
    currentPage > 1
      ? `${SITE_URL}${getPaginationHref({ category, handle, page: currentPage - 1, selectedFilters, sort })}`
      : null
  const nextPageHref =
    currentPage < totalPages
      ? `${SITE_URL}${getPaginationHref({ category, handle, page: currentPage + 1, selectedFilters, sort })}`
      : null

  return (
    <>
      {includeMeta && prevPageHref && <link rel="prev" href={prevPageHref} />}
      {includeMeta && nextPageHref && <link rel="next" href={nextPageHref} />}

      {includeMeta && (
        <JsonLd
          baseUrl={SITE_URL}
          collection={collection}
          collectionUrl={collectionUrl}
          products={productsWithRatings}
        />
      )}

      <Section.Root tone="transparent" className="pt-8 md:pt-10">
        <Section.Container>
          <Toolbar
            currentSort={sort}
            productCount={
              normalizedQuery ? displayedProducts.length : pageIndex.totalCount
            }
            filters={visibleFilters}
            selectedFilters={activeSelectedFilters}
            clearHref={clearFiltersHref}
            className="mb-8"
            search={
              <SearchPageSearchForm
                action={collectionPath}
                className="mt-0 max-w-none"
                inputId="collection-search-query"
                label="Filter products on this page"
                labelClassName="type-label text-ink block sm:col-span-2"
                placeholder="Filter visible products"
                query={query}
                submitLabel="Filter"
              >
                {sort !== 'featured' ? (
                  <input type="hidden" name="sort" value={sort} />
                ) : null}
                {selectedFilters.map((filter) => (
                  <input
                    key={filter}
                    type="hidden"
                    name="filter"
                    value={filter}
                  />
                ))}
              </SearchPageSearchForm>
            }
          />

          <div className="grid gap-10 lg:grid-cols-[252px_1fr] lg:items-start">
            <Sidebar
              activeSelectedFilters={activeSelectedFilters}
              clearFiltersHref={clearFiltersHref}
              handle={handle}
              productsLength={displayedProducts.length}
              sidebarCollections={sidebarCollections}
              visibleFilters={visibleFilters}
            />

            <ProductList
              clearActionLabel={
                normalizedQuery ? 'Clear search' : 'Clear filters'
              }
              clearFiltersHref={
                normalizedQuery ? clearSearchHref : clearFiltersHref
              }
              currentPage={currentPage}
              emptyMessage={
                normalizedQuery
                  ? 'No products on this page match your search.'
                  : undefined
              }
              totalPages={normalizedQuery ? 1 : totalPages}
              buildPageHref={
                normalizedQuery
                  ? undefined
                  : (p) =>
                      getPaginationHref({
                        category,
                        handle,
                        page: p,
                        selectedFilters,
                        sort,
                      })
              }
              preloadFirstImage={!hasRenderableCollectionHeroImage}
              products={displayedProducts}
            />
          </div>
        </Section.Container>
      </Section.Root>
    </>
  )
}
