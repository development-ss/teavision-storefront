// Owner-approved public tag ID carried over from the pre-migration Shopify
// theme (SEO migration checklist, "Migrate GSC, GA & GTM Tracking Codes").
// GA4 is configured inside this container.
export const PRODUCTION_GTM_CONTAINER_ID = 'GTM-KF2Z76H'

type DestinationEnv = Record<string, string | undefined>

// An explicit NEXT_PUBLIC_GTM_CONTAINER_ID always wins. Without one, only a
// Vercel production build falls back to the live container, so preview, local
// and CI builds never send data to it. Consent gating still applies at runtime.
export function resolveGtmContainerId(env: DestinationEnv): string | undefined {
  const configured = env.NEXT_PUBLIC_GTM_CONTAINER_ID?.trim()
  if (configured) return configured

  return env.VERCEL_ENV === 'production'
    ? PRODUCTION_GTM_CONTAINER_ID
    : undefined
}
