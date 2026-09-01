'use client'

import { useActionState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { CustomerAccountAddress } from '@/lib/shopify/customer-account/types'
import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

import {
  formatAddressLines,
  getAddressDisplayName,
  sortDefaultAddressFirst,
} from '../../_lib/address-formatting'
import { DeleteAddressDialog } from '../delete-address-dialog'

type AddressBookProps = {
  addresses: CustomerAccountAddress[]
  defaultAddressId: string | null
  deleteAddressAction: (
    previousState: CustomerAccountFormState,
    formData: FormData,
  ) => Promise<CustomerAccountFormState>
  initialState?: CustomerAccountFormState
  isPendingOverride?: boolean
  setDefaultAction: (
    previousState: CustomerAccountFormState,
    formData: FormData,
  ) => Promise<CustomerAccountFormState>
}

const initialAddressBookState: CustomerAccountFormState = {
  fieldErrors: {},
  message: null,
  status: 'idle',
}

export function AddressBook({
  addresses,
  defaultAddressId,
  deleteAddressAction,
  initialState = initialAddressBookState,
  isPendingOverride,
  setDefaultAction,
}: AddressBookProps) {
  const [state, formAction, isPending] = useActionState(
    setDefaultAction,
    initialState,
  )
  const pending = isPendingOverride ?? isPending
  const sortedAddresses = sortDefaultAddressFirst(addresses, defaultAddressId)

  if (sortedAddresses.length === 0) {
    return (
      <div className="grid gap-5">
        <div>
          <p className="type-mono-meta text-gold-deep">Addresses</p>
          <h1 className="type-heading-01 text-ink">Saved addresses</h1>
        </div>
        <Card padding="lg" radius="lg" tone="surface">
          <div className="grid gap-3">
            <h2 className="type-heading-05 text-ink">No saved addresses</h2>
            <p className="type-body-sm text-ink-soft">
              Add an address to make Shopify checkout faster when you are signed
              in.
            </p>
            <Button href="/account/addresses/new" variant="brand" size="sm">
              Add address
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="type-mono-meta text-gold-deep">Addresses</p>
          <h1 className="type-heading-01 text-ink">Saved addresses</h1>
        </div>
        <Button href="/account/addresses/new" variant="brand">
          Add address
        </Button>
      </div>

      {state.message ? (
        <p
          className="type-body-sm bg-paper-2 border-hairline text-ink rounded-md border px-3 py-2"
          role={state.status === 'error' ? 'alert' : 'status'}
          aria-live={state.status === 'success' ? 'polite' : undefined}
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {sortedAddresses.map((address) => {
          const isDefault = address.id === defaultAddressId
          const addressLabel = getAddressDisplayName(address)

          return (
            <Card
              key={address.id}
              as="article"
              padding="lg"
              radius="lg"
              tone={isDefault ? 'sunken' : 'surface'}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="type-heading-05 text-ink wrap-break-word">
                    {addressLabel}
                  </h2>
                  {isDefault ? (
                    <Badge
                      variant="gold"
                      label="Default address"
                      className="mt-2"
                    />
                  ) : null}
                </div>
              </div>

              <address className="type-body-sm text-ink-soft mt-4 not-italic">
                {formatAddressLines(address).map((line, index) => (
                  <span key={`${line}-${index}`} className="block">
                    {line}
                  </span>
                ))}
              </address>

              <div className="border-hairline mt-5 flex flex-wrap items-center gap-3 border-t pt-4">
                <Button
                  href={`/account/addresses/${encodeURIComponent(address.id)}/edit`}
                  variant="secondary"
                  size="sm"
                >
                  Edit
                </Button>

                {isDefault ? (
                  <Button variant="secondary" size="sm" disabled>
                    Default address
                  </Button>
                ) : (
                  <form action={formAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={pending}
                      isLoading={pending}
                    >
                      Set default
                    </Button>
                  </form>
                )}

                <DeleteAddressDialog
                  action={deleteAddressAction}
                  addressId={address.id}
                  addressLabel={addressLabel}
                />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
