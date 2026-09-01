function optionalPublicEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim()

  return trimmed ? trimmed : undefined
}

function publicFlag(value: string | undefined): boolean {
  return optionalPublicEnv(value) === 'true'
}

export function normalizeZotaboxEmbedUrl(
  value: string | undefined,
): string | undefined {
  const configuredValue = optionalPublicEnv(value)
  if (!configuredValue) return undefined

  try {
    const url = new URL(
      configuredValue.startsWith('//')
        ? `https:${configuredValue}`
        : configuredValue,
    )

    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'static.zotabox.com' ||
      !url.pathname.endsWith('/widgets.js') ||
      url.username ||
      url.password
    ) {
      return undefined
    }

    return url.toString()
  } catch {
    return undefined
  }
}

export const searchanisePublicConfig = {
  apiKey: optionalPublicEnv(process.env.NEXT_PUBLIC_SEARCHANISE_API_KEY),
  enabled: publicFlag(process.env.NEXT_PUBLIC_SEARCHANISE_ENABLED),
}

export const trustooShopDomain = optionalPublicEnv(
  process.env.NEXT_PUBLIC_TRUSTOO_SHOP_DOMAIN,
)

export const zotaboxPublicConfig = {
  embedUrl: normalizeZotaboxEmbedUrl(process.env.NEXT_PUBLIC_ZOTABOX_EMBED_URL),
}
