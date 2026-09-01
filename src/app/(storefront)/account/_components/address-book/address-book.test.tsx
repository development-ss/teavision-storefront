import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { CustomerAccountFormState } from '@/lib/shopify/customer-account/types'
import { makeCustomerAccountAddress } from '@/tests/fixtures/shopify/customer-account'

import { AddressBook } from './address-book'

type MockChildProps = {
  children?: ReactNode
  label?: string
}

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ label }: MockChildProps) => <span>{label}</span>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: MockChildProps) => <span>{children}</span>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: MockChildProps) => <article>{children}</article>,
}))

vi.mock('../delete-address-dialog', () => ({
  DeleteAddressDialog: () => null,
}))

const initialState: CustomerAccountFormState = {
  fieldErrors: {},
  message: null,
  status: 'idle',
}

const unusedAction = vi.fn(async () => initialState)

describe('AddressBook', () => {
  it('renders duplicate formatted address lines without duplicate keys', () => {
    const address = makeCustomerAccountAddress({
      formatted: ['Address 1 test', 'Address 1 test'],
    })
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const markup = renderToStaticMarkup(
      <AddressBook
        addresses={[address]}
        defaultAddressId={address.id}
        deleteAddressAction={unusedAction}
        setDefaultAction={unusedAction}
      />,
    )

    expect(markup.match(/Address 1 test/g)).toHaveLength(2)
    expect(consoleError).not.toHaveBeenCalled()
  })
})
