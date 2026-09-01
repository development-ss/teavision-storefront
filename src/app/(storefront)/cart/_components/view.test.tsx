/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import {
  makeCart,
  makeCartLine,
  makeDiscountAllocation,
} from '@/tests/fixtures/shopify/cart'
import { makeMoney } from '@/tests/fixtures/shopify/money'

import { CartView } from './view'

vi.mock('@/lib/cart/actions', () => ({
  cartLineFormAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

function getTextContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

describe('CartView', () => {
  it('shows original and discounted unit and line totals for bulk discounted lines', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('1382.10'),
            totalAmount: makeMoney('1382.10'),
          },
          lines: [
            makeCartLine({
              quantity: 40,
              cost: {
                amountPerQuantity: makeMoney('40.65'),
                compareAtAmountPerQuantity: null,
                subtotalAmount: makeMoney('1626.00'),
                totalAmount: makeMoney('1382.10'),
              },
              discountAllocations: [
                makeDiscountAllocation({
                  title: 'Bulk discount',
                  discountedAmount: makeMoney('243.90'),
                }),
              ],
              merchandise: {
                ...makeCartLine().merchandise,
                title: '250g/box',
                product: {
                  ...makeCartLine().merchandise.product,
                  title: 'Bulk Eligible Tea',
                },
              },
            }),
          ],
        })}
      />,
    )

    expect(html).toContain('Price/kg')
    expect(html).toContain('Quantity/kg')
    expect(html).toContain('aria-label="Was $40.65"')
    expect(html).toContain('aria-label="Now $34.55"')
    expect(html).toContain('aria-label="Was $1,626.00"')
    expect(html).toContain('aria-label="Now $1,382.10"')
    expect(html).toContain('value="40"')
    expect(html).toContain('Remove')
    expect(getTextContent(html)).toContain(
      'Congratulations! You saved $243.90 by buying in bulk!',
    )
    expect(html).toContain('>Total savings</span>')
    expect(getTextContent(html).match(/\$243\.90/g)).toHaveLength(2)

    expect(html).not.toContain('Bulk discount')
  })

  it('prompts for the next native price break without replacing Shopify cart prices', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('624.92'),
            totalAmount: makeMoney('624.92'),
          },
          lines: [
            makeCartLine({
              quantity: 34,
              cost: {
                amountPerQuantity: makeMoney('18.38'),
                compareAtAmountPerQuantity: null,
                subtotalAmount: makeMoney('624.92'),
                totalAmount: makeMoney('624.92'),
              },
              discountAllocations: [],
              merchandise: {
                ...makeCartLine().merchandise,
                title: '250g',
                quantityPriceBreaks: [
                  {
                    minimumQuantity: 30,
                    price: makeMoney('16.17'),
                  },
                  {
                    minimumQuantity: 40,
                    price: makeMoney('15.62'),
                  },
                ],
                product: {
                  ...makeCartLine().merchandise.product,
                  title: 'Organic Raw Sticky Chai',
                },
              },
            }),
          ],
        })}
      />,
    )

    expect(html).toContain('Buy 6 more and get 15% on each product')
    const productHeadingClass =
      html.match(
        /<h3 class="([^"]+)"><a[^>]*>Organic Raw Sticky Chai<\/a><\/h3>/,
      )?.[1] ?? ''

    expect(productHeadingClass.split(' ')).toEqual(
      expect.arrayContaining([
        'font-display',
        'text-[1.05rem]',
        'w-full',
        'leading-snug',
        'wrap-break-word',
      ]),
    )
    expect(html).toContain('font-sans')
    expect(html).not.toContain('font-display tabular-nums')
    expect(html).not.toContain('line-clamp-2')
    expect(getTextContent(html)).toContain('$18.38')
    expect(getTextContent(html)).toContain('$624.92')
    expect(html).not.toContain('$16.17')
    expect(html).not.toContain('$549.93')
    expect(html).not.toContain('Congratulations! You saved')
    expect(html).not.toContain('Total savings')
    expect(html).not.toContain('Bulk pricing estimated')
  })

  it('prompts for the next tier from the configured Hulk offer', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('54.50'),
            totalAmount: makeMoney('54.50'),
          },
          lines: [
            makeCartLine({
              quantity: 5,
              cost: {
                amountPerQuantity: makeMoney('10.90'),
                compareAtAmountPerQuantity: null,
                subtotalAmount: makeMoney('57.35'),
                totalAmount: makeMoney('54.50'),
              },
              merchandise: {
                ...makeCartLine().merchandise,
                quantityPriceBreaks: [],
                product: {
                  ...makeCartLine().merchandise.product,
                  handle: 'black-assam-op1',
                  title: 'Organic Black Assam Tea (OP1)',
                },
              },
            }),
          ],
        })}
        volumeDiscountTiersByHandle={{
          'black-assam-op1': [
            { minimumQuantity: 5, discountPercent: 5 },
            { minimumQuantity: 10, discountPercent: 10 },
            { minimumQuantity: 20, discountPercent: 12 },
            { minimumQuantity: 40, discountPercent: 15 },
          ],
        }}
      />,
    )

    expect(html).toContain('Buy 5 more and get 10% on each product')
  })

  it('does not present a discount when Shopify returns no price break', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('203.25'),
            totalAmount: makeMoney('203.25'),
          },
          lines: [
            makeCartLine({
              quantity: 5,
              cost: {
                amountPerQuantity: makeMoney('40.65'),
                compareAtAmountPerQuantity: null,
                subtotalAmount: makeMoney('203.25'),
                totalAmount: makeMoney('203.25'),
              },
              discountAllocations: [],
              merchandise: {
                ...makeCartLine().merchandise,
                price: makeMoney('40.65'),
                quantityPriceBreaks: [],
                product: {
                  ...makeCartLine().merchandise.product,
                  title: '2003Y Mini Ripe Pu-erh Tea Brick (250g/box)',
                },
              },
            }),
          ],
        })}
      />,
    )

    expect(html).toContain('value="5"')
    expect(getTextContent(html)).toContain('$40.65')
    expect(getTextContent(html)).toContain('$203.25')
    expect(html).not.toContain('$38.62')
    expect(html).not.toContain('$193.09')
    expect(html).not.toContain('$10.16')
    expect(html).not.toContain('Congratulations! You saved')
    expect(html).not.toContain('Total savings')
  })

  it('keeps non-bulk discount labels visible when a line has discounted totals', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('100.00'),
            totalAmount: makeMoney('90.00'),
          },
          lines: [
            makeCartLine({
              quantity: 4,
              cost: {
                amountPerQuantity: makeMoney('25.00'),
                compareAtAmountPerQuantity: null,
                subtotalAmount: makeMoney('100.00'),
                totalAmount: makeMoney('90.00'),
              },
              discountAllocations: [
                makeDiscountAllocation({
                  title: 'Welcome discount',
                  discountedAmount: makeMoney('10.00'),
                }),
              ],
            }),
          ],
        })}
      />,
    )

    expect(html).toContain('Welcome discount')
    expect(html).toContain('aria-label="Was $100.00"')
    expect(html).toContain('aria-label="Now $90.00"')
  })

  it('renders compare-at prices with legible styling (not 10px invisible text)', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('1626.00'),
            totalAmount: makeMoney('1382.10'),
          },
          lines: [
            makeCartLine({
              quantity: 40,
              cost: {
                amountPerQuantity: makeMoney('34.55'),
                compareAtAmountPerQuantity: makeMoney('40.65'),
                subtotalAmount: makeMoney('1626.00'),
                totalAmount: makeMoney('1382.10'),
              },
              discountAllocations: [],
            }),
          ],
        })}
      />,
    )

    // Compare-at price must be present
    expect(html).toContain('aria-label="Was $40.65"')
    // Must NOT be styled with the invisible 10px faint treatment
    expect(html).not.toContain('text-[10px]')
    // Must use legible display size (text-sm = 14px minimum)
    expect(html).toContain('text-sm')
  })

  it('renders cart line rows with desktop grid classes matching the table header', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('100.00'),
            totalAmount: makeMoney('100.00'),
          },
          lines: [makeCartLine({ quantity: 2 })],
        })}
      />,
    )

    // The <li> rows must use the same 5-column grid as the header at xl.
    // We check that the grid template appears twice: once in the header and once per row.
    const gridPattern = 'xl:grid-cols-[6rem_minmax(0,1fr)_7rem_10rem_7rem]'
    const occurrences = html.split(gridPattern).length - 1
    expect(occurrences).toBeGreaterThanOrEqual(2)
  })

  it('explains guest checkout while keeping checkout available', () => {
    const html = renderToStaticMarkup(
      <CartView cart={makeCart()} accountContextState="guest" />,
    )

    expect(getTextContent(html)).toContain(
      'Checking out as a guest. Sign in to use saved addresses and view orders.',
    )
    expect(html).toContain('href="/account/login?returnTo=/cart"')
    expect(html).toContain('Sign in to use saved addresses')
    expect(html).toContain('aria-label="Proceed to checkout"')
  })
  it('keeps notes and terms with a single checkout control', () => {
    const html = renderToStaticMarkup(
      <CartView
        cart={makeCart({
          cost: {
            subtotalAmount: makeMoney('100.00'),
            totalAmount: makeMoney('100.00'),
          },
          lines: [makeCartLine({ quantity: 2 })],
        })}
      />,
    )

    const checkoutControlPattern =
      /<(?:a|button)(?=[^>]*aria-label="Proceed to checkout")[^>]*>/g

    expect(html).toContain('aria-label="Order notes"')
    expect(html).toContain('Terms of Service')
    expect(html).toContain('href="/pages/terms-of-service"')
    expect(html.match(checkoutControlPattern)).toHaveLength(1)
    expect(html).toContain('Check Out')
    expect(html).not.toContain('>Checkout</a>')
    expect(html).not.toContain('Free freight')
  })
})
