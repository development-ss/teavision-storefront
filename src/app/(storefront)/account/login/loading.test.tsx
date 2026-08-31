import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import LoginLoading from './loading'

type MockChildProps = {
  children?: ReactNode
  href?: string
}

vi.mock('server-only', () => ({}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, href }: MockChildProps) => <a href={href}>{children}</a>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: MockChildProps) => <div>{children}</div>,
}))

describe('LoginLoading', () => {
  it('renders the login panel instead of the account skeleton', () => {
    const markup = renderToStaticMarkup(<LoginLoading />)

    expect(markup).toContain('Sign in to continue to your account.')
    expect(markup).toContain('/account/login/start?returnTo=%2Faccount')
    expect(markup).not.toContain('Loading account')
  })
})
