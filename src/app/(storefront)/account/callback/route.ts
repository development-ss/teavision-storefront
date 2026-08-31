import { syncCartBuyerIdentityForCurrentSession } from '@/lib/cart/actions'
import { discoverCustomerAccountEndpoints } from '@/lib/shopify/customer-account/discovery'
import { getCustomerAccountRedirectOrigin } from '@/lib/shopify/customer-account/env'
import {
  decodeIdTokenClaims,
  exchangeCustomerAccountCode,
} from '@/lib/shopify/customer-account/oauth'
import {
  clearPendingCustomerAuth,
  getPendingCustomerAuth,
  setCustomerAccountSession,
  setCustomerFlash,
} from '@/lib/shopify/customer-account/session'

function getAccountRedirectUrl(path: string): URL {
  return new URL(path, getCustomerAccountRedirectOrigin())
}

function redirectToLoginFailure(): Response {
  return Response.redirect(
    getAccountRedirectUrl('/account/login?reason=verification-failed'),
  )
}

function getCartIdentitySyncFailedRedirect(returnTo: string): URL | null {
  if (returnTo !== '/cart') return null

  const cartUrl = getAccountRedirectUrl('/cart')
  cartUrl.searchParams.set('checkout', 'identity-sync-failed')

  return cartUrl
}

async function failCallback(): Promise<Response> {
  await clearPendingCustomerAuth()
  await setCustomerFlash(
    'We could not verify that sign-in. Start sign-in again.',
  )

  return redirectToLoginFailure()
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const pendingAuth = await getPendingCustomerAuth()

  if (!code || !state || !pendingAuth || pendingAuth.state !== state) {
    return await failCallback()
  }

  try {
    const endpoints = await discoverCustomerAccountEndpoints()
    const tokenExchange = await exchangeCustomerAccountCode({
      code,
      codeVerifier: pendingAuth.codeVerifier,
      nonce: pendingAuth.nonce,
      tokenEndpoint: endpoints.tokenEndpoint,
    })
    const claims = decodeIdTokenClaims(tokenExchange.idToken)

    if (!claims || claims.nonce !== pendingAuth.nonce || !claims.sub) {
      return await failCallback()
    }

    await setCustomerAccountSession({
      accessToken: tokenExchange.accessToken,
      customerId: claims.sub,
      expiresAt: Date.now() + tokenExchange.expiresIn * 1000,
      idToken: tokenExchange.idToken,
      refreshToken: tokenExchange.refreshToken,
    })
    const syncResult = await syncCartBuyerIdentityForCurrentSession()
    await clearPendingCustomerAuth()

    if (syncResult.message) {
      await setCustomerFlash(syncResult.message)

      const cartRedirect = getCartIdentitySyncFailedRedirect(
        pendingAuth.returnTo,
      )
      if (cartRedirect) return Response.redirect(cartRedirect)
    }

    return Response.redirect(getAccountRedirectUrl(pendingAuth.returnTo))
  } catch {
    return await failCallback()
  }
}
