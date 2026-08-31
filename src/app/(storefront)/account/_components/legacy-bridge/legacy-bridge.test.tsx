/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LegacyBridge } from './legacy-bridge'
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

vi.mock('@/components/ui/section', () => ({
  Section: {
    Container: ({ children, className }: MockFrameProps) => (
      <div className={className}>{children}</div>
    ),
    Root: ({ children, className }: MockFrameProps) => (
      <div className={className}>{children}</div>
    ),
  },
}))

describe('LegacyBridge', () => {
  beforeEach(() => {
    buttonCalls.props = []
  })

  it('does not use type-heading-01', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    try {
      await act(async () => {
        root.render(
          <LegacyBridge
            body="Classic account registration has moved to the modern Shopify customer account flow."
            heading="Create your account with Shopify"
            primaryHref="/account/login/start?returnTo=%2Faccount"
          />,
        )
      })

      const heading = host.querySelector('h1')

      expect(heading?.className).toContain('type-heading-04')
      expect(heading?.className).not.toContain('type-heading-01')
    } finally {
      await act(async () => {
        root.unmount()
      })
      host.remove()
    }
  })

  it('renders the hosted sign-in explanation without classic password inputs', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    try {
      await act(async () => {
        root.render(
          <LegacyBridge
            body="This classic account link is no longer used by the headless storefront."
            heading="Account access has moved"
            primaryHref="/account/login/start?returnTo=%2Faccount"
          />,
        )
      })

      expect(host.textContent).toContain(
        'Shopify-hosted Customer Account sign-in',
      )
      expect(host.querySelector('input[type="password"]')).toBeNull()
      expect(
        host.querySelector(
          'a[href="/account/login/start?returnTo=%2Faccount"]',
        ),
      ).not.toBeNull()
    } finally {
      await act(async () => {
        root.unmount()
      })
      host.remove()
    }
  })

  it('disables prefetch on the primary OAuth-start link only', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const root = createRoot(host)

    try {
      await act(async () => {
        root.render(
          <LegacyBridge
            body="This classic account link is no longer used by the headless storefront."
            heading="Account access has moved"
            primaryHref="/account/login/start?returnTo=%2Faccount"
          />,
        )
      })

      expect(buttonCalls.props).toContainEqual({
        href: '/account/login/start?returnTo=%2Faccount',
        prefetch: false,
      })
      expect(buttonCalls.props).toContainEqual({
        href: '/pages/contact',
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
