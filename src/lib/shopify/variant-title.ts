export const STANDARD_VARIANT_TITLE = 'Standard'

export function isPlaceholderVariantTitle(title: string): boolean {
  const normalizedTitle = title.trim().toLowerCase()

  return normalizedTitle === '' || normalizedTitle === 'default title'
}

export function getVariantDisplayTitle(title: string): string {
  const trimmedTitle = title.trim()

  return isPlaceholderVariantTitle(trimmedTitle)
    ? STANDARD_VARIANT_TITLE
    : trimmedTitle
}
