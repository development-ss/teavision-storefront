const COLLECTION_SUFFIX = /\s+Collection$/i

export function getCollectionDisplayTitle(title: string): string {
  return title.replace(COLLECTION_SUFFIX, '').trim()
}
