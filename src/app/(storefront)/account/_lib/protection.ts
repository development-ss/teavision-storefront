import { requireCustomerAccountSession } from '@/lib/shopify/customer-account/session'

export async function requireAccountSessionForPath(returnTo: string) {
  return await requireCustomerAccountSession(returnTo)
}
