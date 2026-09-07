import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import Page from './page'

vi.mock('server-only', () => ({}))

describe('FAQ page presentation', () => {
  it('starts with the FAQ heading without the wholesale banner or broken collection link', () => {
    const html = renderToStaticMarkup(<Page />)

    expect(html).toContain('<h1')
    expect(html).toContain('Wholesale Tea Supplier FAQ')
    expect(html).toContain('General Wholesale Tea Questions')
    expect(html).toContain('Wholesale Pricing &amp; Ordering')
    expect(html).toContain('Private Label, Rebranding &amp; Manufacturing')
    expect(html).toContain('How does Teavision wholesale pricing work?')
    expect(html).toContain('Teavision specialises in B2B wholesale supply')
    expect(html).not.toContain('Terms of Service')
    expect(html).not.toContain('BULK WHOLESALE ACCOUNT')
    expect(html).not.toContain('Wholesale Partnership')
    expect(html).not.toContain('href="/collections"')
  })
})
