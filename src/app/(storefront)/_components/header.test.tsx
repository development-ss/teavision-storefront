import { beforeEach, expect, it, vi } from 'vitest'

import { SHOP_SECTIONS } from '@/components/layout/header/nav/data'
import { getCollectionProductLinks } from '@/lib/shopify/operations/collection'

import { Header } from './header'

vi.mock('@/components/layout/header', () => ({ Header: () => null }))
vi.mock('@/lib/shopify/operations/collection', () => ({
  getCollectionProductLinks: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(getCollectionProductLinks).mockReset()
})

it('starts both collection loads in parallel and preserves static navigation', async () => {
  let resolveHerbs!: (value: { href: string; label: string }[]) => void
  const pendingHerbs = new Promise<{ href: string; label: string }[]>(
    (resolve) => {
      resolveHerbs = resolve
    },
  )
  const powderLinks = [{ href: '/products/cacao', label: 'Cacao' }]
  vi.mocked(getCollectionProductLinks)
    .mockReturnValueOnce(pendingHerbs)
    .mockResolvedValueOnce(powderLinks)

  const pendingHeader = Header()
  expect(getCollectionProductLinks).toHaveBeenCalledTimes(2)
  expect(getCollectionProductLinks).toHaveBeenNthCalledWith(
    1,
    'herbs-and-spices',
  )
  expect(getCollectionProductLinks).toHaveBeenNthCalledWith(
    2,
    'superfood-extract-powders-proteins-supplements',
  )

  const herbLinks = [
    { href: '/products/aniseed-whole', label: 'Aniseed Whole' },
  ]
  resolveHerbs(herbLinks)
  const element = await pendingHeader
  expect(element.props.shopSections).toEqual([
    SHOP_SECTIONS[0],
    SHOP_SECTIONS[1],
    { ...SHOP_SECTIONS[2], links: herbLinks },
    { ...SHOP_SECTIONS[3], links: powderLinks },
  ])
  expect(SHOP_SECTIONS[2].links).toEqual([])
})

it('keeps collection destinations available when neither collection has products', async () => {
  vi.mocked(getCollectionProductLinks).mockResolvedValue([])
  const element = await Header()
  expect(element.props.shopSections).toEqual(SHOP_SECTIONS)
})
