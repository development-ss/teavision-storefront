import type { AnalyticsDestination } from '../adapter'
import { createFakeAnalyticsDestination } from './fake'
import { createGa4AnalyticsDestination } from './ga4'
import { createGtmAnalyticsDestination } from './gtm'

type AnalyticsMode = 'disabled' | 'fake' | 'ga4' | 'auto'

type AnalyticsDestinationEnv = {
  CI?: string
  NEXT_PUBLIC_ANALYTICS_MODE?: string
  NEXT_PUBLIC_GA4_MEASUREMENT_ID?: string
  NEXT_PUBLIC_GTM_CONTAINER_ID?: string
  NODE_ENV?: string
}

function readAnalyticsMode(value: string | undefined): AnalyticsMode {
  if (value === 'disabled' || value === 'fake' || value === 'ga4') {
    return value
  }

  return 'auto'
}

function isLocalOrCi(env: AnalyticsDestinationEnv): boolean {
  return env.CI === 'true' || env.NODE_ENV !== 'production'
}

export function createDefaultAnalyticsDestinations(
  env: AnalyticsDestinationEnv = process.env,
): AnalyticsDestination[] {
  const mode = readAnalyticsMode(env.NEXT_PUBLIC_ANALYTICS_MODE)
  const ga4MeasurementId = env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

  if (mode === 'disabled') return []
  if (mode === 'fake') return [createFakeAnalyticsDestination()]

  if (isLocalOrCi(env)) return [createFakeAnalyticsDestination()]

  // GTM already loads GA4 and Google Ads, so a configured container takes the
  // events. Sending them to GA4 directly as well would count them twice.
  const gtmContainerId = env.NEXT_PUBLIC_GTM_CONTAINER_ID?.trim()
  if (mode !== 'ga4' && gtmContainerId) {
    return [createGtmAnalyticsDestination(gtmContainerId)]
  }

  if (mode === 'ga4' || ga4MeasurementId) {
    return ga4MeasurementId
      ? [createGa4AnalyticsDestination(ga4MeasurementId)]
      : []
  }

  return []
}
