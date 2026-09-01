import { syncCartBuyerIdentityForCurrentSession } from '@/lib/cart/actions'
import { logEvent } from '@/lib/observability/logger'
import { discoverCustomerAccountEndpoints } from '@/lib/shopify/customer-account/discovery'
import { getCustomerAccountRedirectOrigin } from '@/lib/shopify/customer-account/env'
import {
  decodeIdTokenClaims,
  exchangeCustomerAccountCode,
} from '@/lib/shopify/customer-account/oauth'
import { getCustomerAccountIdentity } from '@/lib/shopify/customer-account/operations'
import {
  clearPendingCustomerAuth,
  getPendingCustomerAuth,
  setCustomerAccountSession,
  setCustomerFlash,
} from '@/lib/shopify/customer-account/session'

function getAccountRedirectUrl(path: string): URL {
  return new URL(path, getCustomerAccountRedirectOrigin())
}

type CallbackFailureStep =
  | 'customer-identity'
  | 'invalid-request'
  | 'invalid-id-token'
  | 'missing-customer-identity'
  | 'nonce-mismatch'
  | 'session-setup'
  | 'token-exchange'

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

async function failCallback(step: CallbackFailureStep): Promise<Response> {
  logEvent('error', 'account_oauth_failed', { step })
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
    return await failCallback('invalid-request')
  }

  let tokenExchange
  try {
    const endpoints = await discoverCustomerAccountEndpoints()
    tokenExchange = await exchangeCustomerAccountCode({
      code,
      codeVerifier: pendingAuth.codeVerifier,
      tokenEndpoint: endpoints.tokenEndpoint,
    })
  } catch {
    return await failCallback('token-exchange')
  }

  const claims = decodeIdTokenClaims(tokenExchange.idToken)
  if (!claims) return await failCallback('invalid-id-token')
  if (claims.nonce !== pendingAuth.nonce) {
    return await failCallback('nonce-mismatch')
  }

  let customerId = claims.sub
  if (!customerId) {
    try {
      customerId = (
        await getCustomerAccountIdentity({
          accessToken: tokenExchange.accessToken,
        })
      )?.customerId
    } catch {
      return await failCallback('customer-identity')
    }
  }
  if (!customerId) return await failCallback('missing-customer-identity')

  try {
    await setCustomerAccountSession({
      accessToken: tokenExchange.accessToken,
      customerId,
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
    return await failCallback('session-setup')
  }
}
