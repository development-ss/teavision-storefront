import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'node:crypto'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { isProductionRuntime } from '@/lib/env/runtime'

import { getCustomerAccountConfig } from './env'
import { normalizeReturnTo } from './oauth'
import type {
  CustomerAccountSession,
  PendingCustomerAccountAuth,
} from './types'

export const CUSTOMER_SESSION_COOKIE = 'teavision_customer_session'
export const CUSTOMER_AUTH_COOKIE = 'teavision_customer_auth'
export const CUSTOMER_FLASH_COOKIE = 'teavision_customer_flash'

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
} as const

type SealedValue = {
  ciphertext: string
  iv: string
  tag: string
  version: 1
}

function getSecretKey(): Buffer {
  return createHash('sha256')
    .update(getCustomerAccountConfig().sessionSecret)
    .digest()
}

function sealJson(value: unknown): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getSecretKey(), iv)
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ])
  const sealed: SealedValue = {
    ciphertext: ciphertext.toString('base64url'),
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    version: 1,
  }

  return Buffer.from(JSON.stringify(sealed), 'utf8').toString('base64url')
}

function unsealJson<T>(value: string): T | null {
  try {
    const sealed = JSON.parse(
      Buffer.from(value, 'base64url').toString('utf8'),
    ) as SealedValue
    if (sealed.version !== 1) return null

    const decipher = createDecipheriv(
      'aes-256-gcm',
      getSecretKey(),
      Buffer.from(sealed.iv, 'base64url'),
    )
    decipher.setAuthTag(Buffer.from(sealed.tag, 'base64url'))
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(sealed.ciphertext, 'base64url')),
      decipher.final(),
    ])

    return JSON.parse(plaintext.toString('utf8')) as T
  } catch {
    return null
  }
}

function cookieOptions(maxAge?: number) {
  return {
    ...COOKIE_OPTIONS,
    maxAge,
    secure: isProductionRuntime(),
  }
}

function isCustomerSession(value: unknown): value is CustomerAccountSession {
  if (typeof value !== 'object' || value === null) return false

  const session = value as Partial<CustomerAccountSession>
  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.idToken === 'string' &&
    typeof session.expiresAt === 'number' &&
    typeof session.customerId === 'string' &&
    session.customerId.length > 0
  )
}

function isPendingAuth(value: unknown): value is PendingCustomerAccountAuth {
  if (typeof value !== 'object' || value === null) return false

  const pendingAuth = value as Partial<PendingCustomerAccountAuth>
  return (
    typeof pendingAuth.codeVerifier === 'string' &&
    typeof pendingAuth.createdAt === 'number' &&
    typeof pendingAuth.nonce === 'string' &&
    typeof pendingAuth.returnTo === 'string' &&
    typeof pendingAuth.state === 'string'
  )
}

export function sealCustomerSession(payload: CustomerAccountSession): string {
  return sealJson(payload)
}

export function unsealCustomerSession(
  value: string,
): CustomerAccountSession | null {
  const session = unsealJson<unknown>(value)
  return isCustomerSession(session) ? session : null
}

export function sealPendingCustomerAuth(
  payload: PendingCustomerAccountAuth,
): string {
  return sealJson(payload)
}

export function unsealPendingCustomerAuth(
  value: string,
): PendingCustomerAccountAuth | null {
  const pendingAuth = unsealJson<unknown>(value)
  return isPendingAuth(pendingAuth) ? pendingAuth : null
}

export async function getCustomerAccountSession(): Promise<CustomerAccountSession | null> {
  const cookieStore = await cookies()
  const sealedSession = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value
  if (!sealedSession) return null

  const session = unsealCustomerSession(sealedSession)
  if (!session || session.expiresAt <= Date.now()) return null

  return session
}

export async function setCustomerAccountSession(
  session: CustomerAccountSession,
): Promise<void> {
  const cookieStore = await cookies()
  const maxAge = Math.max(
    0,
    Math.floor((session.expiresAt - Date.now()) / 1000),
  )

  cookieStore.set(
    CUSTOMER_SESSION_COOKIE,
    sealCustomerSession(session),
    cookieOptions(maxAge),
  )
}

export async function setPendingCustomerAuth(
  pendingAuth: PendingCustomerAccountAuth,
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(
    CUSTOMER_AUTH_COOKIE,
    sealPendingCustomerAuth(pendingAuth),
    cookieOptions(600),
  )
}

export async function getPendingCustomerAuth(): Promise<PendingCustomerAccountAuth | null> {
  const cookieStore = await cookies()
  const sealedAuth = cookieStore.get(CUSTOMER_AUTH_COOKIE)?.value
  if (!sealedAuth) return null

  return unsealPendingCustomerAuth(sealedAuth)
}

export async function requireCustomerAccountSession(
  returnTo = '/account',
): Promise<CustomerAccountSession> {
  const session = await getCustomerAccountSession()
  if (session) return session

  const loginUrl = new URL('http://teavision.local/account/login')
  loginUrl.searchParams.set('returnTo', normalizeReturnTo(returnTo))
  redirect(`${loginUrl.pathname}${loginUrl.search}`)
}

export async function clearCustomerAccountCookies(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_SESSION_COOKIE)
  cookieStore.delete(CUSTOMER_AUTH_COOKIE)
  cookieStore.delete(CUSTOMER_FLASH_COOKIE)
}

export async function clearPendingCustomerAuth(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_AUTH_COOKIE)
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_SESSION_COOKIE)
}

export async function setCustomerFlash(message: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CUSTOMER_FLASH_COOKIE, message, cookieOptions(300))
}

export async function consumeCustomerFlash(): Promise<string | null> {
  const cookieStore = await cookies()
  const message = cookieStore.get(CUSTOMER_FLASH_COOKIE)?.value ?? null
  cookieStore.delete(CUSTOMER_FLASH_COOKIE)

  return message
}
