import { prepareCheckoutHandoff } from '@/lib/cart/actions'
import { logEvent } from '@/lib/observability/logger'
import { getCustomerAccountSession } from '@/lib/shopify/customer-account/session'

function redirectToCart(request: Request, checkout: string): Response {
  const url = new URL('/cart', request.url)
  url.searchParams.set('checkout', checkout)

  return Response.redirect(url)
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData()
  const agreedToTerms = formData.get('terms') === 'accepted'
  const noteValue = formData.get('note')
  const note = typeof noteValue === 'string' ? noteValue.trim() : ''

  if (!(await getCustomerAccountSession())) {
    const loginUrl = new URL('/account/login', request.url)
    loginUrl.searchParams.set('returnTo', '/cart')
    return Response.redirect(loginUrl)
  }

  const result = await prepareCheckoutHandoff(agreedToTerms, note)

  if (result.status === 'ready') {
    logEvent('info', 'checkout_handoff_ready', {
      cartIdHash: result.cartIdHash,
      status: result.status,
    })

    return Response.redirect(result.checkoutUrl)
  }

  if (result.status === 'identity-sync-failed') {
    logEvent('error', 'checkout_handoff_failed', {
      cartIdHash: result.cartIdHash,
      status: result.status,
    })

    return redirectToCart(request, 'identity-sync-failed')
  }

  if (result.status === 'note-update-failed') {
    logEvent('error', 'checkout_handoff_failed', {
      cartIdHash: result.cartIdHash,
      status: result.status,
    })

    return redirectToCart(request, 'note-update-failed')
  }

  if (result.status === 'terms-required') {
    logEvent('warn', 'checkout_handoff_failed', {
      status: result.status,
    })

    return redirectToCart(request, 'terms-required')
  }

  logEvent('warn', 'checkout_handoff_failed', {
    cartIdHash: result.cartIdHash,
    status: result.status,
  })

  return redirectToCart(request, 'missing-cart')
}
