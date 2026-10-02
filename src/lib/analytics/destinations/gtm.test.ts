import { afterEach, describe, expect, test } from 'vitest'

import {
  grantOptionalConsent,
  rejectOptionalConsent,
} from '@/lib/consent/adapter'

import { dispatchAnalyticsEvent } from '../adapter'
import {
  createLeadSubmitEvent,
  createProductViewEvent,
  createSearchEvent,
} from '../events'
import { createDefaultAnalyticsDestinations } from './index'
import {
  createGtmAnalyticsDestination,
  mapAnalyticsEventToDataLayer,
} from './gtm'

const target = globalThis as typeof globalThis & { dataLayer?: unknown[] }

afterEach(() => {
  delete target.dataLayer
})

describe('GTM analytics destination', () => {
  test('production builds with a GTM container send events to GTM only', () => {
    const ids = (
      env: Parameters<typeof createDefaultAnalyticsDestinations>[0],
    ) => createDefaultAnalyticsDestinations(env).map(({ id }) => id)

    expect(
      ids({ NODE_ENV: 'production', NEXT_PUBLIC_GTM_CONTAINER_ID: 'GTM-TEST' }),
    ).toEqual(['gtm'])
    // A direct GA4 ID as well must not double-count events GTM already sends.
    expect(
      ids({
        NODE_ENV: 'production',
        NEXT_PUBLIC_GTM_CONTAINER_ID: 'GTM-TEST',
        NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEST',
      }),
    ).toEqual(['gtm'])
    expect(
      ids({
        NODE_ENV: 'production',
        NEXT_PUBLIC_ANALYTICS_MODE: 'ga4',
        NEXT_PUBLIC_GTM_CONTAINER_ID: 'GTM-TEST',
        NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEST',
      }),
    ).toEqual(['ga4'])
    // Live production config on 2 October 2026: ga4 mode, no GA4 ID, GTM set.
    expect(
      ids({
        NODE_ENV: 'production',
        NEXT_PUBLIC_ANALYTICS_MODE: 'ga4',
        NEXT_PUBLIC_GTM_CONTAINER_ID: 'GTM-TEST',
      }),
    ).toEqual(['gtm'])
    expect(
      ids({
        NODE_ENV: 'development',
        NEXT_PUBLIC_GTM_CONTAINER_ID: 'GTM-TEST',
      }),
    ).toEqual(['fake'])
    expect(
      ids({ NODE_ENV: 'production', NEXT_PUBLIC_GTM_CONTAINER_ID: '  ' }),
    ).toEqual([])
  })

  test('maps events to GA4 names with items under ecommerce', () => {
    expect(
      mapAnalyticsEventToDataLayer(
        createProductViewEvent({ id: 'gid://shopify/Product/1', title: 'Tea' }),
      ),
    ).toEqual({
      event: 'view_item',
      ecommerce: {
        items: [{ item_id: 'gid://shopify/Product/1', item_name: 'Tea' }],
      },
    })
    expect(
      mapAnalyticsEventToDataLayer(createLeadSubmitEvent('contact')),
    ).toEqual({ event: 'generate_lead', lead_kind: 'contact' })
    expect(
      mapAnalyticsEventToDataLayer(createSearchEvent({ resultCount: 3 })),
    ).toEqual({ event: 'search', results_count: 3 })
  })

  test('pushes to the dataLayer only with analytics consent', async () => {
    const destination = createGtmAnalyticsDestination('GTM-TEST')

    await dispatchAnalyticsEvent(
      createLeadSubmitEvent('newsletter'),
      rejectOptionalConsent(),
      [destination],
    )
    expect(target.dataLayer).toBeUndefined()

    await dispatchAnalyticsEvent(
      createLeadSubmitEvent('newsletter'),
      grantOptionalConsent(),
      [destination],
    )
    await dispatchAnalyticsEvent(
      createProductViewEvent({ id: 'gid://shopify/Product/1', title: 'Tea' }),
      grantOptionalConsent(),
      [destination],
    )
    expect(target.dataLayer).toEqual([
      { event: 'generate_lead', lead_kind: 'newsletter' },
      { ecommerce: null },
      {
        event: 'view_item',
        ecommerce: {
          items: [{ item_id: 'gid://shopify/Product/1', item_name: 'Tea' }],
        },
      },
    ])
  })

  test('keeps entries already queued by the GTM loader', async () => {
    target.dataLayer = [{ event: 'gtm.js' }]

    await dispatchAnalyticsEvent(
      createLeadSubmitEvent('contact'),
      grantOptionalConsent(),
      [createGtmAnalyticsDestination('GTM-TEST')],
    )

    expect(target.dataLayer).toEqual([
      { event: 'gtm.js' },
      { event: 'generate_lead', lead_kind: 'contact' },
    ])
  })
})
