/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CartCheckoutForm } from './checkout-form'

describe('CartCheckoutForm', () => {
  it('links terms acceptance to the terms of service page', () => {
    const html = renderToStaticMarkup(
      <CartCheckoutForm accountContextState={null} cartIdPresent={true} />,
    )

    expect(html).toContain('href="/pages/terms-of-service"')
    expect(html).not.toContain('href="/pages/terms-conditions"')
  })
})
