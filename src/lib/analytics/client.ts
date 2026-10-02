import { DEFAULT_CONSENT } from '@/lib/consent/adapter'
import { readStoredConsent } from '@/lib/consent/storage'

import {
  dispatchAnalyticsEvent,
  type AnalyticsDispatchResult,
  type AnalyticsDestination,
} from './adapter'
import { createDefaultAnalyticsDestinations } from './destinations'
import type { AnalyticsEvent } from './events'

// Literal process.env reads, so Next.js inlines the public values into the
// browser bundle. A spread or dynamic lookup of process.env is empty there.
const clientDestinations = createDefaultAnalyticsDestinations({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_ANALYTICS_MODE: process.env.NEXT_PUBLIC_ANALYTICS_MODE,
  NEXT_PUBLIC_GA4_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
  NEXT_PUBLIC_GTM_CONTAINER_ID: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
})

export async function dispatchClientAnalyticsEvent(
  event: AnalyticsEvent,
  destinations: readonly AnalyticsDestination[] = clientDestinations,
): Promise<AnalyticsDispatchResult> {
  try {
    return await dispatchAnalyticsEvent(
      event,
      readStoredConsent() ?? DEFAULT_CONSENT,
      destinations,
    )
  } catch {
    return {
      dispatched: 0,
      skipped: destinations.length,
    }
  }
}
