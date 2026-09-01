import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  makeCustomerAccountAddress,
  makeCustomerAccountProfile,
} from '@/tests/fixtures/shopify/customer-account'

import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
  updateProfileAction,
} from './actions'
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAccountDashboard,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from './operations'
import { requireCustomerAccountSession } from './session'
import type { CustomerAccountFormState, CustomerAccountSession } from './types'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

vi.mock('./session', () => ({
  requireCustomerAccountSession: vi.fn(),
}))

vi.mock('./operations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./operations')>()

  return {
    ...actual,
    createCustomerAddress: vi.fn(),
    deleteCustomerAddress: vi.fn(),
    getCustomerAccountDashboard: vi.fn(),
    setDefaultCustomerAddress: vi.fn(),
    updateCustomerAddress: vi.fn(),
    updateCustomerProfile: vi.fn(),
  }
})

const initialState: CustomerAccountFormState = {
  fieldErrors: {},
  message: null,
  status: 'idle',
}

function makeSession(): CustomerAccountSession {
  return {
    accessToken: 'customer-access-token',
    customerId: 'gid://shopify/Customer/test-customer-1',
    expiresAt: Date.now() + 60000,
    idToken: 'id-token',
    refreshToken: 'customer-refresh-token',
  }
}

function makeFormData(values: Record<string, string>): FormData {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value)
  })

  return formData
}

describe('Customer Account Server Actions', () => {
  beforeEach(() => {
    vi.mocked(requireCustomerAccountSession).mockResolvedValue(makeSession())
    vi.mocked(updateCustomerProfile).mockResolvedValue({
      data: makeCustomerAccountProfile(),
      userErrors: [],
    })
    vi.mocked(createCustomerAddress).mockResolvedValue({
      data: makeCustomerAccountAddress(),
      userErrors: [],
    })
    vi.mocked(updateCustomerAddress).mockResolvedValue({
      data: makeCustomerAccountAddress(),
      userErrors: [],
    })
    vi.mocked(deleteCustomerAddress).mockResolvedValue({
      data: 'gid://shopify/CustomerAddress/test-address-1',
      userErrors: [],
    })
    vi.mocked(setDefaultCustomerAddress).mockResolvedValue({
      data: makeCustomerAccountAddress(),
      userErrors: [],
    })
    vi.mocked(getCustomerAccountDashboard).mockResolvedValue({
      defaultAddress: makeCustomerAccountAddress(),
      profile: makeCustomerAccountProfile(),
      recentOrders: [],
      sectionErrors: {},
    })
  })

  test('missing session returns unauthorized state and does not mutate', async () => {
    vi.mocked(requireCustomerAccountSession).mockRejectedValue(
      new Error('redirect:/account/login'),
    )

    const state = await updateProfileAction(
      initialState,
      makeFormData({ firstName: 'Mira' }),
    )

    expect(state).toEqual({
      fieldErrors: {},
      message: 'Your session has expired. Sign in again to continue.',
      status: 'error',
    })
    expect(updateCustomerProfile).not.toHaveBeenCalled()
  })

  test('profile action revalidates account paths after success', async () => {
    const state = await updateProfileAction(
      initialState,
      makeFormData({
        firstName: 'Mira',
        lastName: 'Patel',
      }),
    )

    expect(updateCustomerProfile).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'customer-access-token' }),
      {
        firstName: 'Mira',
        lastName: 'Patel',
      },
    )
    expect(revalidatePath).toHaveBeenCalledWith('/account')
    expect(revalidatePath).toHaveBeenCalledWith('/account/profile')
    expect(state.status).toBe('success')
  })

  test('profile action rejects missing or malformed names before Shopify mutation', async () => {
    const missingState = await updateProfileAction(
      initialState,
      makeFormData({ firstName: 'Mira' }),
    )

    expect(missingState).toEqual({
      fieldErrors: { lastName: 'This field is required.' },
      message: null,
      status: 'error',
    })

    const malformedState = await updateProfileAction(
      initialState,
      makeFormData({ firstName: 'Mira123', lastName: 'Patel' }),
    )

    expect(malformedState).toEqual({
      fieldErrors: {
        firstName: 'Use letters, spaces, apostrophes, or hyphens for names.',
      },
      message: null,
      status: 'error',
    })
    expect(updateCustomerProfile).not.toHaveBeenCalled()
  })

  test('profile action ignores stale phone fields because Shopify manages phone sign-in', async () => {
    await updateProfileAction(
      initialState,
      makeFormData({
        firstName: 'Mira',
        lastName: 'Patel',
        phone: '+61 411 111 111',
      }),
    )

    expect(updateCustomerProfile).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'customer-access-token' }),
      {
        firstName: 'Mira',
        lastName: 'Patel',
      },
    )
  })

  test('address action ignores client-provided customer identity', async () => {
    await expect(
      createAddressAction(
        initialState,
        makeFormData({
          address1: '99 Tea Road',
          city: 'Brisbane',
          countryCodeV2: 'AU',
          customerId: 'gid://shopify/Customer/not-this-one',
          firstName: 'Mira',
          lastName: 'Patel',
          phone: '+61 411 111 111',
          provinceCode: 'QLD',
          zip: '4000',
        }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(createCustomerAddress).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'customer-access-token' }),
      {
        address1: '99 Tea Road',
        address2: null,
        city: 'Brisbane',
        countryCodeV2: 'AU',
        firstName: 'Mira',
        lastName: 'Patel',
        phone: '+61 411 111 111',
        provinceCode: 'QLD',
        zip: '4000',
      },
    )
    expect(revalidatePath).toHaveBeenCalledWith('/account')
    expect(revalidatePath).toHaveBeenCalledWith('/account/addresses')
    expect(redirect).toHaveBeenCalledWith('/account/addresses')
  })

  test('address user errors become field-level action state', async () => {
    vi.mocked(updateCustomerAddress).mockResolvedValue({
      data: null,
      userErrors: [{ field: ['address1'], message: 'Enter an address.' }],
    })

    const state = await updateAddressAction(
      initialState,
      makeFormData({
        addressId: 'gid://shopify/CustomerAddress/test-address-1',
        address1: 'invalid',
        city: 'Brisbane',
        countryCodeV2: 'AU',
        firstName: 'Mira',
        lastName: 'Patel',
        zip: '4000',
      }),
    )

    expect(state).toEqual({
      fieldErrors: { address1: 'Enter an address.' },
      message: null,
      status: 'error',
    })
  })

  test('successful address edits refresh and return to the address list', async () => {
    await expect(
      updateAddressAction(
        initialState,
        makeFormData({
          addressId: 'gid://shopify/CustomerAddress/test-address-1',
          address1: '100 Tea Road',
          city: 'Brisbane',
          countryCodeV2: 'AU',
          firstName: 'Mira',
          lastName: 'Patel',
          zip: '4000',
        }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(updateCustomerAddress).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'customer-access-token' }),
      'gid://shopify/CustomerAddress/test-address-1',
      {
        address1: '100 Tea Road',
        address2: null,
        city: 'Brisbane',
        countryCodeV2: 'AU',
        firstName: 'Mira',
        lastName: 'Patel',
        phone: null,
        provinceCode: null,
        zip: '4000',
      },
    )
    expect(revalidatePath).toHaveBeenCalledWith('/account')
    expect(revalidatePath).toHaveBeenCalledWith('/account/addresses')
    expect(redirect).toHaveBeenCalledWith('/account/addresses')
  })

  test('address action rejects missing required fields before Shopify mutation', async () => {
    const state = await createAddressAction(
      initialState,
      makeFormData({ firstName: 'Mira', city: 'Brisbane' }),
    )

    expect(state).toEqual({
      fieldErrors: {
        lastName: 'This field is required.',
        address1: 'This field is required.',
        zip: 'This field is required.',
      },
      message: null,
      status: 'error',
    })
    expect(createCustomerAddress).not.toHaveBeenCalled()
  })

  test('delete action requires a session before reading mutation id', async () => {
    vi.mocked(requireCustomerAccountSession).mockRejectedValue(
      new Error('redirect:/account/login'),
    )

    const state = await deleteAddressAction(initialState, new FormData())

    expect(state.status).toBe('error')
    expect(deleteCustomerAddress).not.toHaveBeenCalled()
  })

  test('delete action revalidates the address list after success', async () => {
    const state = await deleteAddressAction(
      initialState,
      makeFormData({
        addressId: 'gid://shopify/CustomerAddress/test-address-1',
      }),
    )

    expect(deleteCustomerAddress).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'customer-access-token' }),
      'gid://shopify/CustomerAddress/test-address-1',
    )
    expect(revalidatePath).toHaveBeenCalledWith('/account')
    expect(revalidatePath).toHaveBeenCalledWith('/account/addresses')
    expect(state).toEqual({
      fieldErrors: {},
      message: 'Address deleted.',
      status: 'success',
    })
  })
  test('default address refresh failure returns success guidance', async () => {
    vi.mocked(getCustomerAccountDashboard).mockRejectedValue(
      new Error('refresh unavailable'),
    )

    const state = await setDefaultAddressAction(
      initialState,
      makeFormData({
        addressId: 'gid://shopify/CustomerAddress/test-address-1',
      }),
    )

    expect(setDefaultCustomerAddress).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'customer-access-token' }),
      'gid://shopify/CustomerAddress/test-address-1',
    )
    expect(state).toEqual({
      fieldErrors: {},
      message:
        'Default address updated. Refresh the page to see the latest address list.',
      status: 'success',
    })
  })
})
