// Products that exist only so checkout can add a charge (for example the
// freight line). They stay buyable, but search engines should not index them,
// list them in the sitemap, or see Product structured data for them.
const NON_INDEXABLE_PRODUCT_HANDLES = new Set(['freight'])

export function isProductIndexable(handle: string): boolean {
  return !NON_INDEXABLE_PRODUCT_HANDLES.has(handle)
}
