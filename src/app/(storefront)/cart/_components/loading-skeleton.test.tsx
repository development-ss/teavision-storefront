import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CartLoadingSkeleton } from './loading-skeleton'

describe('CartLoadingSkeleton', () => {
  it('matches the filled cart layout while cart content streams', () => {
    const html = renderToStaticMarkup(<CartLoadingSkeleton />)

    expect(html).toContain('role="status"')
    expect(html).toContain('Loading cart')
    expect(html).toContain('xl:grid-cols-[minmax(0,1fr)_22rem]')
    expect(html).toContain('aria-label="Loading cart items"')
    expect(html).toContain('aria-label="Loading checkout form"')
    expect(html).toContain('aria-label="Loading order summary"')
    expect(html).not.toContain('aria-label="Loading mobile checkout"')
    expect(html).toContain('xl:sticky xl:top-24')
    expect(html).not.toContain('fixed inset-x-0 bottom-0')
  })

  it('keeps skeleton rows aligned to the filled cart desktop grid', () => {
    const html = renderToStaticMarkup(<CartLoadingSkeleton />)
    const gridPattern = 'xl:grid-cols-[6rem_minmax(0,1fr)_7rem_10rem_7rem]'
    const occurrences = html.split(gridPattern).length - 1

    expect(occurrences).toBeGreaterThanOrEqual(3)
    expect(html).toContain('size-19 shrink-0 rounded-lg xl:size-24')
    expect(html).toContain('xl:flex-none')
    expect(html).toContain('hidden xl:block xl:pt-1')
    expect(html).toContain('hidden xl:flex xl:justify-center xl:pt-0.5')
    expect(html).toContain('hidden xl:block xl:pt-1 xl:text-right')
  })

  it('mirrors the cart notes and summary sequence without a sidebar checkout pill', () => {
    const html = renderToStaticMarkup(<CartLoadingSkeleton />)

    expect(html).toContain('data-skeleton="packaging-note"')
    expect(html).toContain('h-18')
    expect(html).toContain('sm:h-12')
    expect(html).toContain('xl:h-9')
    expect(html).toContain('data-skeleton="checkout-note"')
    expect(html).toContain('data-skeleton="terms"')
    expect(html).toContain('h-12 w-72 max-w-full sm:h-5')
    expect(html).toContain('data-skeleton="checkout-actions"')
    expect(html).not.toContain('data-skeleton="freight-note"')
    expect(html).not.toContain('data-skeleton="summary-checkout-pill"')
    expect(html).not.toContain('mt-5 h-12 w-full rounded-full')
  })
})
