import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CollectionSummary } from '@/lib/shopify/types'

import { CollectionCardImage } from './collection-card-image'

type ImageProps = ComponentProps<'img'>

const imageMock = vi.hoisted(() =>
  vi.fn((props: ImageProps) => {
    void props
    return null
  }),
)

vi.mock('next/image', () => ({
  default: imageMock,
}))

function collectionWithoutImage(handle: string): CollectionSummary {
  return {
    id: handle,
    handle,
    title: handle,
    description: '',
    featuredImage: null,
    updatedAt: '2026-08-05T00:00:00Z',
    seo: { title: null, description: null },
  }
}

describe('CollectionCardImage', () => {
  beforeEach(() => {
    imageMock.mockClear()
  })

  it.each([
    ['black-tea', '/images/navigation/mega-menu-tea-leaves.png'],
    ['matcha-tea', '/images/custom-tea-blends/matcha-powder.png'],
    ['organic-tea', '/images/homepage/organic-range.jpg'],
  ])('uses a local fallback for %s', (handle, expectedSrc) => {
    renderToStaticMarkup(
      <CollectionCardImage collection={collectionWithoutImage(handle)} />,
    )

    expect(imageMock).toHaveBeenCalledWith(
      expect.objectContaining({ src: expectedSrc }),
      undefined,
    )
  })

  it('keeps a neutral placeholder for an unconfigured missing image', () => {
    const html = renderToStaticMarkup(
      <CollectionCardImage
        collection={collectionWithoutImage('unknown-collection')}
      />,
    )

    expect(imageMock).not.toHaveBeenCalled()
    expect(html).toContain('bg-paper-2')
  })

  it('requests a server-side crop instead of an upscaled thumbnail for a Shopify image', () => {
    renderToStaticMarkup(
      <CollectionCardImage
        collection={{
          id: 'green-tea',
          handle: 'green-tea',
          title: 'Green Tea',
          description: '',
          featuredImage: {
            url: 'https://cdn.shopify.com/sencha_green.jpg',
            altText: null,
            width: 2372,
            height: 2298,
          },
          updatedAt: '2026-08-05T00:00:00Z',
          seo: { title: null, description: null },
        }}
      />,
    )

    expect(imageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        src: 'https://cdn.shopify.com/sencha_green.jpg?crop=center&height=1296&width=1200',
        width: 1200,
        height: 1296,
      }),
      undefined,
    )
  })
})
