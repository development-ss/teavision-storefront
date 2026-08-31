import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { makeCustomerAccountProfile } from '@/tests/fixtures/shopify/customer-account'

import { Dashboard } from './dashboard'

type MockChildProps = {
  children?: ReactNode
  href?: string
}

vi.mock('next/link', () => ({
  default: ({ children, href }: MockChildProps) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, href }: MockChildProps) =>
    href ? <a href={href}>{children}</a> : <span>{children}</span>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: MockChildProps) => <div>{children}</div>,
}))

vi.mock('../status-pill', () => ({
  StatusPill: ({ label }: { label: string }) => <span>{label}</span>,
}))

vi.mock('../support-block', () => ({
  SupportBlock: () => null,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Dashboard', () => {
  it('renders duplicate formatted address lines without duplicate keys', () => {
    const profile = makeCustomerAccountProfile()
    const defaultAddress = {
      ...profile.defaultAddress!,
      formatted: ['Address 1 test', 'Address 1 test'],
    }
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    const markup = renderToStaticMarkup(
      <Dashboard
        dashboard={{
          defaultAddress,
          profile: { ...profile, defaultAddress },
          recentOrders: [],
          sectionErrors: {},
        }}
      />,
    )

    expect(markup.match(/Address 1 test/g)).toHaveLength(2)
    expect(consoleError).not.toHaveBeenCalled()
  })
})
