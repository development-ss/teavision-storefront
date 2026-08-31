import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { LoginPanelSlot } from './panel-slot'

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

async function renderSlot(searchParams: {
  reason?: string
  returnTo?: string
}): Promise<string> {
  return renderToStaticMarkup(
    await LoginPanelSlot({ searchParams: Promise.resolve(searchParams) }),
  )
}

describe('LoginPanelSlot', () => {
  it('renders the default copy and /account return path without params', async () => {
    const markup = await renderSlot({})

    expect(markup).toContain('Sign in to continue to your account.')
    expect(markup).toContain('/account/login/start?returnTo=%2Faccount')
  })

  it('renders the expired-session copy for reason=expired', async () => {
    const markup = await renderSlot({ reason: 'expired' })

    expect(markup).toContain(
      'Your session has expired. Sign in again to continue.',
    )
  })

  it('falls back to the default copy for unknown reasons', async () => {
    const markup = await renderSlot({ reason: 'not-a-real-reason' })

    expect(markup).toContain('Sign in to continue to your account.')
  })

  it('keeps an allowed returnTo path', async () => {
    const markup = await renderSlot({ returnTo: '/account/orders' })

    expect(markup).toContain(
      '/account/login/start?returnTo=%2Faccount%2Forders',
    )
  })

  it.each(['https://evil.example', '//evil.example', '/not-allowed'])(
    'normalizes hostile or disallowed returnTo %s to /account',
    async (returnTo) => {
      const markup = await renderSlot({ returnTo })

      expect(markup).toContain('/account/login/start?returnTo=%2Faccount')
      expect(markup).not.toContain('evil.example')
      expect(markup).not.toContain('not-allowed')
    },
  )
})
