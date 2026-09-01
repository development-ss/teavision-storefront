import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'

type AddressFormAction = (
  previousState: CustomerAccountFormState,
  formData: FormData,
) => Promise<CustomerAccountFormState>

const harness = vi.hoisted(() => ({
  action: null as AddressFormAction | null,
  replace: vi.fn(),
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()

  return {
    ...actual,
    useActionState: vi.fn(
      (action: AddressFormAction, initialState: CustomerAccountFormState) => {
        harness.action = action
        return [initialState, vi.fn(), false]
      },
    ),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: harness.replace }),
}))

import { AddressForm } from './address-form'

const initialState: CustomerAccountFormState = {
  fieldErrors: {},
  message: null,
  status: 'idle',
}

function captureFormAction(action: AddressFormAction): AddressFormAction {
  AddressForm({ action, mode: 'create' })

  if (!harness.action) throw new Error('Address form action was not captured')
  return harness.action
}

describe('AddressForm', () => {
  beforeEach(() => {
    harness.action = null
  })

  it('returns to the refreshed address list after a successful save', async () => {
    const successState: CustomerAccountFormState = {
      fieldErrors: {},
      message: 'Address saved.',
      status: 'success',
    }
    const action = vi.fn(async () => successState)
    const formAction = captureFormAction(action)
    const formData = new FormData()

    const result = await formAction(initialState, formData)

    expect(action).toHaveBeenCalledWith(initialState, formData)
    expect(harness.replace).toHaveBeenCalledWith('/account/addresses')
    expect(result).toBe(successState)
  })

  it('keeps the user on the form when saving fails', async () => {
    const errorState: CustomerAccountFormState = {
      fieldErrors: { address1: 'Enter an address.' },
      message: null,
      status: 'error',
    }
    const formAction = captureFormAction(vi.fn(async () => errorState))

    const result = await formAction(initialState, new FormData())

    expect(harness.replace).not.toHaveBeenCalled()
    expect(result).toBe(errorState)
  })
})
