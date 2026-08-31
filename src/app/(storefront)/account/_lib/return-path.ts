import { normalizeReturnTo } from '@/lib/shopify/customer-account/oauth'

export function normalizeAccountReturnPath(value: string | null): string {
  return normalizeReturnTo(value)
}

export function getAccountLoginStartHref(returnTo: string | null): string {
  const safeReturnTo = normalizeAccountReturnPath(returnTo)
  const searchParams = new URLSearchParams()
  searchParams.set('returnTo', safeReturnTo)

  return `/account/login/start?${searchParams.toString()}`
}
