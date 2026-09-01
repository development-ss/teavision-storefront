import {
  getAccountLoginStartHref,
  normalizeAccountReturnPath,
} from './return-path'

export type LegacyAccountSearchParams = {
  checkout_url?: string | string[]
  redirect?: string | string[]
  returnTo?: string | string[]
  [key: string]: string | string[] | undefined
}

export type LegacyAccountBridgeCopy = {
  body: string
  heading: string
  primaryHref: string
  primaryLabel?: string
}

const LEGACY_RETURN_PARAM_NAMES = [
  'returnTo',
  'checkout_url',
  'redirect',
] as const

function getFirstSearchParamValue(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) return value[0] ?? null

  return value ?? null
}

export function normalizeLegacyAccountReturn(value: string | null): string {
  if (!value) return '/account'

  let decoded = value.trim()
  try {
    decoded = decodeURIComponent(decoded)
  } catch {
    return '/account'
  }

  if (decoded.includes('{{') || decoded.includes('}}')) return '/account'
  if (decoded.includes('{%') || decoded.includes('%}')) return '/account'

  return normalizeAccountReturnPath(decoded)
}

function getLegacyAccountReturnFromSearchParams(
  searchParams: LegacyAccountSearchParams,
): string {
  for (const name of LEGACY_RETURN_PARAM_NAMES) {
    const value = getFirstSearchParamValue(searchParams[name])
    const normalized = normalizeLegacyAccountReturn(value)
    if (normalized !== '/account') return normalized
  }

  return '/account'
}

export function getLegacyAccountLoginStartHref(
  searchParams: LegacyAccountSearchParams = {},
): string {
  return getAccountLoginStartHref(
    getLegacyAccountReturnFromSearchParams(searchParams),
  )
}

export function getLegacyAccountBridgeCopy(
  slug: string[],
): LegacyAccountBridgeCopy {
  const firstSegment = slug[0] ?? ''
  const joinedSlug = slug.join('/')

  if (firstSegment === 'register') {
    return {
      body: 'Classic account registration has moved to the modern Shopify customer account flow.',
      heading: 'Create your account with Shopify',
      primaryHref: getAccountLoginStartHref('/account'),
      primaryLabel: 'Create account with Shopify',
    }
  }

  if (firstSegment === 'recover') {
    return {
      body: 'Classic password recovery has moved. Start Shopify sign-in and use the hosted account recovery options when prompted.',
      heading: 'Recover your account with Shopify',
      primaryHref: getAccountLoginStartHref('/account'),
    }
  }

  if (firstSegment === 'reset') {
    return {
      body: 'Classic password reset links are no longer used by this storefront. Start a fresh Shopify sign-in to continue securely.',
      heading: 'Reset your account with Shopify',
      primaryHref: getAccountLoginStartHref('/account'),
    }
  }

  if (firstSegment === 'activate') {
    return {
      body: 'Classic activation links are no longer required. Shopify now verifies account access during hosted sign-in.',
      heading: 'Activate your account with Shopify',
      primaryHref: getAccountLoginStartHref('/account'),
    }
  }

  if (joinedSlug.includes('verification-failed')) {
    return {
      body: 'We could not verify that account link. Start sign-in again to continue through the secure Shopify account flow.',
      heading: 'Account link could not be verified',
      primaryHref: getAccountLoginStartHref('/account'),
    }
  }

  return {
    body: 'This classic account link is no longer used by the headless storefront. Start Shopify sign-in or contact support if you need help finding an order.',
    heading: 'Account access has moved',
    primaryHref: getAccountLoginStartHref('/account'),
  }
}
