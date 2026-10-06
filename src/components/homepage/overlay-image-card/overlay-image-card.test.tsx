import type { ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { PRODUCT_RANGE_FIXTURE } from '../content'
import { getCardImageAlt, OverlayImageCard } from './overlay-image-card'

type ImageProps = ComponentProps<'img'> & {
  fill?: boolean
}

vi.mock('next/image', () => ({
  default: vi.fn((props: ImageProps) => {
    void props
    return null
  }),
}))

describe('OverlayImageCard', () => {
  it('fades the hover scrim instead of swapping gradient backgrounds', () => {
    const html = renderToStaticMarkup(
      <OverlayImageCard card={PRODUCT_RANGE_FIXTURE[0]} />,
    )

    expect(html).toContain('transition-opacity')
    expect(html).toContain('group-hover:opacity-100')
    expect(html).not.toContain('transition-[background]')
  })

  it('drops image alt text that only repeats the card title', () => {
    const card = PRODUCT_RANGE_FIXTURE[0]

    expect(
      getCardImageAlt({
        ...card,
        title: 'Bulk Tea Bag Packs',
        image: { ...card.image, alt: ' Bulk tea  bag packs ' },
      }),
    ).toBe('')
    expect(
      getCardImageAlt({
        ...card,
        title: 'Bulk Tea Bag Packs',
        image: { ...card.image, alt: 'Pyramid tea bags in a kraft box' },
      }),
    ).toBe('Pyramid tea bags in a kraft box')
  })
})
