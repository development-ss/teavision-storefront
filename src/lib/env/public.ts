function optionalPublicEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim()

  return trimmed ? trimmed : undefined
}

function publicFlag(value: string | undefined): boolean {
  return optionalPublicEnv(value) === 'true'
}

export const searchanisePublicConfig = {
  apiKey: optionalPublicEnv(process.env.NEXT_PUBLIC_SEARCHANISE_API_KEY),
  enabled: publicFlag(process.env.NEXT_PUBLIC_SEARCHANISE_ENABLED),
}

export const trustooShopDomain = optionalPublicEnv(
  process.env.NEXT_PUBLIC_TRUSTOO_SHOP_DOMAIN,
)
