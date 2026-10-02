import { canUseAnalytics, type ConsentState } from '@/lib/consent/adapter'

import type { AnalyticsDestination } from '../adapter'
import type { AnalyticsEvent } from '../events'
import { mapAnalyticsEventToGa4 } from './ga4'

type DataLayerEntry = Record<string, unknown>

type DataLayerWindow = typeof globalThis & {
  dataLayer?: unknown[]
}

// Turns a storefront event into the dataLayer entries GTM expects. Event
// names match GA4 (view_item, search, add_to_cart, generate_lead, ...) so a
// GTM "Custom Event" trigger can forward them to GA4 without renaming.
// Item lists go under `ecommerce`, the GA4 ecommerce convention.
export function mapAnalyticsEventToDataLayer(
  event: AnalyticsEvent,
): DataLayerEntry {
  const { eventName, payload } = mapAnalyticsEventToGa4(event)
  const { items, ...parameters } = payload

  return items === undefined
    ? { event: eventName, ...parameters }
    : { event: eventName, ...parameters, ecommerce: { items } }
}

// Sends storefront events to Google Tag Manager. GTM owns GA4 and Google Ads
// on production, so events go through the dataLayer rather than a second,
// direct GA4 connection (which would double-count page views).
export function createGtmAnalyticsDestination(
  containerId: string | undefined,
): AnalyticsDestination {
  return {
    id: 'gtm',
    category: 'analytics',
    isEnabled(consent: ConsentState) {
      return canUseAnalytics(consent) && Boolean(containerId)
    },
    dispatch(event, consent) {
      if (!canUseAnalytics(consent) || !containerId) return

      const target = globalThis as DataLayerWindow
      const dataLayer = (target.dataLayer ??= [])
      const entry = mapAnalyticsEventToDataLayer(event)

      // Clear the previous ecommerce object so items never leak between events.
      if ('ecommerce' in entry) dataLayer.push({ ecommerce: null })
      dataLayer.push(entry)
    },
  }
}
