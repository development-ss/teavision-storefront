import { clearCartCookie } from '@/lib/cart/actions'
import { getCustomerAccountConfig } from '@/lib/shopify/customer-account/env'
import { discoverCustomerAccountEndpoints } from '@/lib/shopify/customer-account/discovery'
import {
  clearCustomerAccountCookies,
  getCustomerAccountSession,
} from '@/lib/shopify/customer-account/session'

function getLocalLogoutRedirectUrl(): URL {
  const config = getCustomerAccountConfig()
  const loginUrl = new URL(config.logoutRedirectUri)
  loginUrl.searchParams.set('reason', 'logged-out')

  return loginUrl
}

async function redirectAfterLocalLogout(): Promise<Response> {
  await clearCartCookie()
  await clearCustomerAccountCookies()

  return Response.redirect(getLocalLogoutRedirectUrl())
}

async function logout(): Promise<Response> {
  const session = await getCustomerAccountSession()
  if (!session) return await redirectAfterLocalLogout()

  await clearCartCookie()
  const endpoints = await discoverCustomerAccountEndpoints()
  const config = getCustomerAccountConfig()
  const logoutUrl = new URL(endpoints.logoutEndpoint)
  logoutUrl.searchParams.set(
    'post_logout_redirect_uri',
    config.logoutRedirectUri,
  )
  logoutUrl.searchParams.set('id_token_hint', session.idToken)
  await clearCustomerAccountCookies()

  return Response.redirect(logoutUrl)
}

export async function GET(): Promise<Response> {
  return await logout()
}

export async function POST(): Promise<Response> {
  return await logout()
}
