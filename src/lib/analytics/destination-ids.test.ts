import { describe, expect, test } from 'vitest'

import {
  PRODUCTION_GTM_CONTAINER_ID,
  resolveGtmContainerId,
} from './destination-ids'

describe('resolveGtmContainerId', () => {
  test('uses the pre-migration container on Vercel production builds', () => {
    expect(resolveGtmContainerId({ VERCEL_ENV: 'production' })).toBe(
      'GTM-KF2Z76H',
    )
    expect(PRODUCTION_GTM_CONTAINER_ID).toBe('GTM-KF2Z76H')
  })

  test('lets an explicit environment value win', () => {
    expect(
      resolveGtmContainerId({
        NEXT_PUBLIC_GTM_CONTAINER_ID: ' GTM-OTHER ',
        VERCEL_ENV: 'production',
      }),
    ).toBe('GTM-OTHER')
  })

  test('keeps preview, local and CI builds off the live container', () => {
    expect(resolveGtmContainerId({ VERCEL_ENV: 'preview' })).toBeUndefined()
    expect(resolveGtmContainerId({ VERCEL_ENV: 'development' })).toBeUndefined()
    expect(resolveGtmContainerId({})).toBeUndefined()
    expect(
      resolveGtmContainerId({ NEXT_PUBLIC_GTM_CONTAINER_ID: '   ' }),
    ).toBeUndefined()
  })
})
