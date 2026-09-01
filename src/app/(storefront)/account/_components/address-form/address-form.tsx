'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormLabel } from '@/components/ui/form-label'
import { Select } from '@/components/ui/select'
import { TextInput } from '@/components/ui/text-input'
import type { CustomerAccountAddress } from '@/lib/shopify/customer-account/types'
import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

type AddressFormProps = {
  action: (
    previousState: CustomerAccountFormState,
    formData: FormData,
  ) => Promise<CustomerAccountFormState>
  address?: CustomerAccountAddress
  isDefaultAddress?: boolean
  isPendingOverride?: boolean
  initialState?: CustomerAccountFormState
  mode: 'create' | 'edit'
}

const initialAddressFormState: CustomerAccountFormState = {
  fieldErrors: {},
  message: null,
  status: 'idle',
}

export function AddressForm({
  action,
  address,
  isDefaultAddress = false,
  isPendingOverride,
  initialState = initialAddressFormState,
  mode,
}: AddressFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const pending = isPendingOverride ?? isPending
  const submitLabel = mode === 'create' ? 'Save address' : 'Save address'
  const title = mode === 'create' ? 'New address' : 'Edit address'
  const address1Error = state.fieldErrors.address1
  const cityError = state.fieldErrors.city
  const countryError = state.fieldErrors.countryCodeV2
  const firstNameError = state.fieldErrors.firstName
  const lastNameError = state.fieldErrors.lastName
  const phoneError = state.fieldErrors.phone
  const provinceError = state.fieldErrors.provinceCode
  const zipError = state.fieldErrors.zip

  return (
    <Card
      padding="lg"
      radius="lg"
      tone="surface"
      className="mx-auto w-full max-w-3xl"
    >
      <form action={formAction} className="grid gap-6">
        <div className="grid gap-2">
          <h1 className="type-heading-01 text-ink">{title}</h1>
          <p className="type-body-sm text-ink-soft">
            Saved addresses are used by Shopify checkout when available.
          </p>
        </div>

        {address?.id ? (
          <input type="hidden" name="addressId" value={address.id} />
        ) : null}

        {state.message ? (
          <p
            className="type-body-sm bg-paper-2 border-hairline text-ink rounded-md border px-3 py-2"
            role={state.status === 'error' ? 'alert' : 'status'}
            aria-live={state.status === 'success' ? 'polite' : undefined}
          >
            {state.message}
          </p>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <FormLabel htmlFor="firstName" required>
              First name
            </FormLabel>
            <TextInput
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              defaultValue={address?.firstName ?? ''}
              required
              aria-invalid={firstNameError ? true : undefined}
              aria-describedby={
                firstNameError ? 'address-first-name-error' : undefined
              }
            />
            {firstNameError ? (
              <p
                id="address-first-name-error"
                className="type-body-sm text-danger"
              >
                {firstNameError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="lastName" required>
              Last name
            </FormLabel>
            <TextInput
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              defaultValue={address?.lastName ?? ''}
              required
              aria-invalid={lastNameError ? true : undefined}
              aria-describedby={
                lastNameError ? 'address-last-name-error' : undefined
              }
            />
            {lastNameError ? (
              <p
                id="address-last-name-error"
                className="type-body-sm text-danger"
              >
                {lastNameError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="grid gap-2">
            <FormLabel htmlFor="address1" required>
              Address line 1
            </FormLabel>
            <TextInput
              id="address1"
              name="address1"
              autoComplete="address-line1"
              defaultValue={address?.address1 ?? ''}
              required
              aria-invalid={address1Error ? true : undefined}
              aria-describedby={
                address1Error ? 'address-line-1-error' : undefined
              }
            />
            {address1Error ? (
              <p id="address-line-1-error" className="type-body-sm text-danger">
                {address1Error}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="address2">Address line 2</FormLabel>
            <TextInput
              id="address2"
              name="address2"
              autoComplete="address-line2"
              defaultValue={address?.address2 ?? ''}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="grid gap-2">
            <FormLabel htmlFor="city" required>
              City
            </FormLabel>
            <TextInput
              id="city"
              name="city"
              autoComplete="address-level2"
              defaultValue={address?.city ?? ''}
              required
              aria-invalid={cityError ? true : undefined}
              aria-describedby={cityError ? 'address-city-error' : undefined}
            />
            {cityError ? (
              <p id="address-city-error" className="type-body-sm text-danger">
                {cityError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="provinceCode">State / province</FormLabel>
            <TextInput
              id="provinceCode"
              name="provinceCode"
              autoComplete="address-level1"
              defaultValue={address?.provinceCode ?? ''}
              aria-invalid={provinceError ? true : undefined}
              aria-describedby={
                provinceError ? 'address-province-error' : undefined
              }
            />
            {provinceError ? (
              <p
                id="address-province-error"
                className="type-body-sm text-danger"
              >
                {provinceError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="zip" required>
              Postcode
            </FormLabel>
            <TextInput
              id="zip"
              name="zip"
              autoComplete="postal-code"
              defaultValue={address?.zip ?? ''}
              required
              aria-invalid={zipError ? true : undefined}
              aria-describedby={zipError ? 'address-zip-error' : undefined}
            />
            {zipError ? (
              <p id="address-zip-error" className="type-body-sm text-danger">
                {zipError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <FormLabel htmlFor="countryCodeV2" required>
              Country
            </FormLabel>
            <Select
              id="countryCodeV2"
              name="countryCodeV2"
              autoComplete="country"
              defaultValue={address?.countryCodeV2 ?? 'AU'}
              required
              aria-invalid={countryError ? true : undefined}
              aria-describedby={
                countryError ? 'address-country-error' : undefined
              }
            >
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
            </Select>
            {countryError ? (
              <p
                id="address-country-error"
                className="type-body-sm text-danger"
              >
                {countryError}
              </p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <FormLabel htmlFor="phone">Phone</FormLabel>
            <TextInput
              id="phone"
              name="phone"
              autoComplete="tel"
              defaultValue={address?.phone ?? ''}
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={phoneError ? 'address-phone-error' : undefined}
            />
            {phoneError ? (
              <p id="address-phone-error" className="type-body-sm text-danger">
                {phoneError}
              </p>
            ) : null}
          </div>
        </div>

        <label className="type-body-sm text-ink flex items-center gap-3">
          <Checkbox name="defaultAddress" defaultChecked={isDefaultAddress} />
          Make this the default address
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button href="/account/addresses" variant="secondary">
            {mode === 'create'
              ? 'Return to addresses'
              : 'Discard address changes'}
          </Button>
          <Button
            type="submit"
            variant="brand"
            disabled={pending}
            isLoading={pending}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  )
}
