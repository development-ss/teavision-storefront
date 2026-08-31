import type { CustomerAccountAddress } from '@/lib/shopify/customer-account/types'

export function formatAddressLines(address: CustomerAccountAddress): string[] {
  if (address.formatted.length > 0) return address.formatted

  const locality = [address.city, address.provinceCode, address.zip]
    .filter(Boolean)
    .join(' ')

  return [
    [address.firstName, address.lastName].filter(Boolean).join(' '),
    address.address1,
    address.address2,
    locality,
    address.countryCodeV2,
  ].filter((line): line is string => Boolean(line))
}

export function getAddressDisplayName(address: CustomerAccountAddress): string {
  const name = [address.firstName, address.lastName].filter(Boolean).join(' ')
  if (name) return name

  return address.address1 ?? 'Saved address'
}

export function sortDefaultAddressFirst(
  addresses: CustomerAccountAddress[],
  defaultAddressId: string | null,
): CustomerAccountAddress[] {
  return [...addresses].sort((left, right) => {
    if (left.id === defaultAddressId) return -1
    if (right.id === defaultAddressId) return 1

    return 0
  })
}
