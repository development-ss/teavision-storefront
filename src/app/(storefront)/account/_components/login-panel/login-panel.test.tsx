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
    reloadDocument?: boolean
  }>,
}))

type MockButtonProps = {
  children?: ReactNode
  className?: string
  href?: string
  reloadDocument?: boolean
}

type MockFrameProps = {
  children?: ReactNode
  className?: string
}

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, href, reloadDocument }: MockButtonProps) => {
    buttonCalls.props.push({ href, reloadDocument })

    return (
      <a
        className={className}
        href={href}
        data-reload-document={String(reloadDocument)}
      >
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

  it('uses document navigation on the primary OAuth-start link only', async () => {
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
        reloadDocument: true,
      })
      expect(buttonCalls.props).toContainEqual({
        href: '/collections/all',
        reloadDocument: undefined,
      })
    } finally {
      await act(async () => {
        root.unmount()
      })
      host.remove()
    }
  })
})
