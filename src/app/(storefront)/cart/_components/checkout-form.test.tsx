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

  it('shows a retryable error when order notes could not be saved', () => {
    const html = renderToStaticMarkup(
      <CartCheckoutForm
        accountContextState={null}
        cartIdPresent={true}
        checkoutError="note-update-failed"
      />,
    )

    expect(html).toContain('We could not save your order notes.')
    expect(html).toContain('role="alert"')
  })

  it('shows the Teavision confirmation email and Shop Pay clarification', () => {
    const html = renderToStaticMarkup(
      <CartCheckoutForm
        accountContextState="signed-in"
        accountEmail="giladianne@gmail.com"
        cartIdPresent={true}
      />,
    )

    expect(html).toContain('Order confirmation:')
    expect(html).toContain('giladianne@gmail.com')
    expect(html).toContain('Shop Pay may show a different email')
  })
})
