import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import Page from './page'

vi.mock('server-only', () => ({}))

describe('Terms of Service page', () => {
  it('renders the complete canonical document with policy and contact links', () => {
    const html = renderToStaticMarkup(<Page />)

    expect(html).toContain('aria-labelledby="terms-of-service-title"')
    expect(html).toContain('Overview')
    expect(html).toContain('Section 1: Online Store Terms')
    expect(html).toContain('Section 20: Contact Information')
    expect(html).toContain('href="/pages/refund-policy"')
    expect(html).toContain('href="/pages/privacy-policy"')
    expect(html).toContain('href="mailto:info@teavision.com.au"')
    expect(html).not.toContain('Pending owner/legal review')
    expect(html).not.toContain('mrteashop.com')
  })
})
