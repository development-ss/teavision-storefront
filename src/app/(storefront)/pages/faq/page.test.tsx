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
    expect(html).not.toContain('BULK WHOLESALE ACCOUNT')
    expect(html).not.toContain('Wholesale Partnership')
    expect(html).not.toContain('href="/collections"')
  })
})
