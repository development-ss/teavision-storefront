/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginPanel } from './login-panel'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const buttonCalls = vi.hoisted(() => ({
  props: [] as Array<{
    href?: string
    prefetch?: boolean | null
  }>,
}))

type MockButtonProps = {
  children?: ReactNode
  className?: string
  href?: string
  prefetch?: boolean | null
}

type MockFrameProps = {
  children?: ReactNode
  className?: string
}

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, href, prefetch }: MockButtonProps) => {
    buttonCalls.props.push({ href, prefetch })

    return (
      <a className={className} href={href} data-prefetch={String(prefetch)}>
        {children}
      </a>
    )
  },
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: MockFrameProps) => (
    <div className={className}>{children}</div>
  ),
}))

describe('LoginPanel', () => {
  beforeEach(() => {
    buttonCalls.props = []
  })

  it('disables prefetch on the primary OAuth-start link only', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    try {
      await act(async () => {
        root.render(
          <LoginPanel loginHref="/account/login/start?returnTo=%2Faccount" />,
        )
      })

      expect(buttonCalls.props).toContainEqual({
        href: '/account/login/start?returnTo=%2Faccount',
        prefetch: false,
      })
      expect(buttonCalls.props).toContainEqual({
        href: '/collections/all',
        prefetch: undefined,
      })
    } finally {
      await act(async () => {
        root.unmount()
      })
      host.remove()
    }
  })
})
