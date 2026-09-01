'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAccountDashboard,
  normalizeCustomerAccountUserErrors,
  setDefaultCustomerAddress,
  updateCustomerAddress,
  updateCustomerProfile,
} from './operations'
import { requireCustomerAccountSession } from './session'
import type {
  CustomerAccountAddressInput,
  CustomerAccountFormState,
  CustomerAccountMutationResult,
  CustomerAccountProfileInput,
  CustomerAccountSession,
  CustomerAccountUserError,
} from './types'

const UNAUTHORIZED_MESSAGE =
  'Your session has expired. Sign in again to continue.'
const GENERIC_MUTATION_ERROR =
  'We could not save those account changes. Please review the form and try again.'
const INVALID_FORM_MESSAGE =
  'We could not read that account request. Refresh the page and try again.'
const INVALID_NAME_MESSAGE =
  'Use letters, spaces, apostrophes, or hyphens for names.'

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}'’ -]*$/u

function unauthorizedState(): CustomerAccountFormState {
  return { fieldErrors: {}, message: UNAUTHORIZED_MESSAGE, status: 'error' }
}

function successState(message: string): CustomerAccountFormState {
  return { fieldErrors: {}, message, status: 'success' }
}

function errorState(message: string): CustomerAccountFormState {
  return { fieldErrors: {}, message, status: 'error' }
}

function userErrorState(
  userErrors: CustomerAccountUserError[],
): CustomerAccountFormState {
  const normalized = normalizeCustomerAccountUserErrors(userErrors)
  const hasFieldErrors = Object.keys(normalized.fieldErrors).length > 0

  return {
    fieldErrors: normalized.fieldErrors,
    message:
      normalized.formError ?? (hasFieldErrors ? null : GENERIC_MUTATION_ERROR),
    status: 'error',
  }
}

function getOptionalFormString(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function getRequiredFormString(formData: FormData, key: string): string {
  const value = getOptionalFormString(formData, key)
  if (!value) throw new Error(INVALID_FORM_MESSAGE)

  return value
}

function getProfileInput(formData: FormData): CustomerAccountProfileInput {
  return {
    firstName: getOptionalFormString(formData, 'firstName'),
    lastName: getOptionalFormString(formData, 'lastName'),
  }
}

function getAddressInput(formData: FormData): CustomerAccountAddressInput {
  const input: CustomerAccountAddressInput = {
    firstName: getOptionalFormString(formData, 'firstName'),
    lastName: getOptionalFormString(formData, 'lastName'),
    address1: getOptionalFormString(formData, 'address1'),
    address2: getOptionalFormString(formData, 'address2'),
    city: getOptionalFormString(formData, 'city'),
    provinceCode: getOptionalFormString(formData, 'provinceCode'),
    zip: getOptionalFormString(formData, 'zip'),
    countryCodeV2: getOptionalFormString(formData, 'countryCodeV2') ?? 'AU',
    phone: getOptionalFormString(formData, 'phone'),
  }

  if (formData.get('defaultAddress') === 'on') {
    input.defaultAddress = true
  }

  return input
}

function getFieldValidationErrors(
  fields: Record<string, string | null | undefined>,
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, value] of Object.entries(fields)) {
    if (!value) errors[field] = 'This field is required.'
  }

  return errors
}

function getProfileValidationErrors(
  input: CustomerAccountProfileInput,
): Record<string, string> {
  const errors = getFieldValidationErrors({
    firstName: input.firstName,
    lastName: input.lastName,
  })

  for (const [field, value] of Object.entries({
    firstName: input.firstName,
    lastName: input.lastName,
  })) {
    if (value && (value.length > 100 || !NAME_PATTERN.test(value))) {
      errors[field] = INVALID_NAME_MESSAGE
    }
  }

  return errors
}

function getAddressValidationErrors(
  input: CustomerAccountAddressInput,
): Record<string, string> {
  return getFieldValidationErrors({
    firstName: input.firstName,
    lastName: input.lastName,
    address1: input.address1,
    city: input.city,
    zip: input.zip,
    countryCodeV2: input.countryCodeV2,
  })
}

function mutationResultHasErrors<T>(
  result: CustomerAccountMutationResult<T>,
): boolean {
  return result.userErrors.length > 0 || result.data === null
}

function revalidateAccountPaths(path: string) {
  revalidatePath('/account')
  revalidatePath(path)
}

export async function updateProfileAction(
  _previousState: CustomerAccountFormState,
  formData: FormData,
): Promise<CustomerAccountFormState> {
  let session: CustomerAccountSession
  try {
    session = await requireCustomerAccountSession('/account/profile')
  } catch {
    return unauthorizedState()
  }

  try {
    const input = getProfileInput(formData)
    const fieldErrors = getProfileValidationErrors(input)
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, message: null, status: 'error' }
    }

    const result = await updateCustomerProfile(session, input)
    if (mutationResultHasErrors(result))
      return userErrorState(result.userErrors)

    revalidateAccountPaths('/account/profile')
    return successState('Profile updated.')
  } catch (error) {
    if (error instanceof Error && error.message === INVALID_FORM_MESSAGE) {
      return errorState(error.message)
    }

    return errorState(GENERIC_MUTATION_ERROR)
  }
}

export async function createAddressAction(
  _previousState: CustomerAccountFormState,
  formData: FormData,
): Promise<CustomerAccountFormState> {
  let session: CustomerAccountSession
  try {
    session = await requireCustomerAccountSession('/account/addresses/new')
  } catch {
    return unauthorizedState()
  }

  try {
    const input = getAddressInput(formData)
    const fieldErrors = getAddressValidationErrors(input)
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, message: null, status: 'error' }
    }

    const result = await createCustomerAddress(session, input)
    if (mutationResultHasErrors(result))
      return userErrorState(result.userErrors)

    revalidateAccountPaths('/account/addresses')
  } catch (error) {
    if (error instanceof Error && error.message === INVALID_FORM_MESSAGE) {
      return errorState(error.message)
    }

    return errorState(GENERIC_MUTATION_ERROR)
  }

  redirect('/account/addresses')
}

export async function updateAddressAction(
  _previousState: CustomerAccountFormState,
  formData: FormData,
): Promise<CustomerAccountFormState> {
  let session: CustomerAccountSession
  try {
    session = await requireCustomerAccountSession('/account/addresses')
  } catch {
    return unauthorizedState()
  }

  try {
    const addressId = getRequiredFormString(formData, 'addressId')
    const input = getAddressInput(formData)
    const fieldErrors = getAddressValidationErrors(input)
    if (Object.keys(fieldErrors).length > 0) {
      return { fieldErrors, message: null, status: 'error' }
    }

    const result = await updateCustomerAddress(session, addressId, input)
    if (mutationResultHasErrors(result))
      return userErrorState(result.userErrors)

    revalidateAccountPaths('/account/addresses')
  } catch (error) {
    if (error instanceof Error && error.message === INVALID_FORM_MESSAGE) {
      return errorState(error.message)
    }

    return errorState(GENERIC_MUTATION_ERROR)
  }

  redirect('/account/addresses')
}

export async function deleteAddressAction(
  _previousState: CustomerAccountFormState,
  formData: FormData,
): Promise<CustomerAccountFormState> {
  let session: CustomerAccountSession
  try {
    session = await requireCustomerAccountSession('/account/addresses')
  } catch {
    return unauthorizedState()
  }

  try {
    const addressId = getRequiredFormString(formData, 'addressId')
    const result = await deleteCustomerAddress(session, addressId)
    if (mutationResultHasErrors(result))
      return userErrorState(result.userErrors)

    revalidateAccountPaths('/account/addresses')
    return successState('Address deleted.')
  } catch (error) {
    if (error instanceof Error && error.message === INVALID_FORM_MESSAGE) {
      return errorState(error.message)
    }

    return errorState(GENERIC_MUTATION_ERROR)
  }
}

export async function setDefaultAddressAction(
  _previousState: CustomerAccountFormState,
  formData: FormData,
): Promise<CustomerAccountFormState> {
  let session: CustomerAccountSession
  try {
    session = await requireCustomerAccountSession('/account/addresses')
  } catch {
    return unauthorizedState()
  }

  try {
    const addressId = getRequiredFormString(formData, 'addressId')
    const result = await setDefaultCustomerAddress(session, addressId)
    if (mutationResultHasErrors(result))
      return userErrorState(result.userErrors)

    revalidateAccountPaths('/account/addresses')

    try {
      await getCustomerAccountDashboard(session)
    } catch {
      return successState(
        'Default address updated. Refresh the page to see the latest address list.',
      )
    }

    return successState('Default address updated.')
  } catch (error) {
    if (error instanceof Error && error.message === INVALID_FORM_MESSAGE) {
      return errorState(error.message)
    }

    return errorState(GENERIC_MUTATION_ERROR)
  }
}
