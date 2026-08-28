import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { CUSTOMER_SESSION_COOKIE } from '@/lib/shopify/customer-account/session'

const PROTECTED_ACCOUNT_PATHS = [
  '/account/addresses',
  '/account/orders',
  '/account/profile',
] as const

function isProtectedAccountPath(pathname: string): boolean {
  return (
    pathname === '/account' ||
    PROTECTED_ACCOUNT_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )
  )
}

export function proxy(request: NextRequest) {
  if (
    !isProtectedAccountPath(request.nextUrl.pathname) ||
    request.cookies.has(CUSTOMER_SESSION_COOKIE)
  ) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/account/login', request.url)
  loginUrl.searchParams.set(
    'returnTo',
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  )

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: '/account/:path*',
}
