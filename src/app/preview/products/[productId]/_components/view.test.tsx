import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { getProductPreview } from '@/lib/shopify/operations/product-preview'
import { getProductPreviewSession } from '@/lib/shopify/preview-session'
import { makeProduct } from '@/tests/fixtures/shopify/product'

import { ProductPreviewView } from './view'

vi.mock('server-only', () => ({}))

const notFoundMock = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
  notFound: notFoundMock,
}))

vi.mock('@/lib/shopify/operations/product-preview', () => ({
  getProductPreview: vi.fn(),
}))

vi.mock('@/lib/shopify/preview-session', () => ({
  getProductPreviewSession: vi.fn(),
}))

vi.mock('@/components/product/product-details', () => ({
  ProductDetails: ({
    mode,
    product,
  }: {
    mode: string
    product: { title: string }
  }) => <div data-mode={mode}>{product.title}</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const sessionMock = vi.mocked(getProductPreviewSession)
const previewMock = vi.mocked(getProductPreview)

describe('ProductPreviewView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    notFoundMock.mockImplementation(() => {
      throw new Error('notFound')
    })
    sessionMock.mockResolvedValue({
      productId: '123',
      expiresAt: Date.now() + 1000,
    })
    previewMock.mockResolvedValue({
      product: makeProduct({ title: 'Draft Matcha' }),
      status: 'DRAFT',
    })
  })

  test('requires a matching preview session before fetching Admin data', async () => {
    sessionMock.mockResolvedValueOnce(null)

    await expect(
      ProductPreviewView({ params: Promise.resolve({ productId: '123' }) }),
    ).rejects.toThrow('notFound')
    expect(previewMock).not.toHaveBeenCalled()
  })

  test('renders the preview notice and shared details in preview mode', async () => {
    const element = await ProductPreviewView({
      params: Promise.resolve({ productId: '123' }),
    })
    const html = renderToStaticMarkup(element)

    expect(html).toContain('Previewing the draft product version.')
    expect(html).toContain('Changes are not available for purchase.')
    expect(html).toContain('Exit preview')
    expect(html).toContain('data-mode="preview"')
    expect(html).toContain('Draft Matcha')
  })

  test('rejects a session for a different product', async () => {
    sessionMock.mockResolvedValueOnce({
      productId: '999',
      expiresAt: Date.now() + 1000,
    })

    await expect(
      ProductPreviewView({ params: Promise.resolve({ productId: '123' }) }),
    ).rejects.toThrow('notFound')
    expect(previewMock).not.toHaveBeenCalled()
  })
})
