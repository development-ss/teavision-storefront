import { Header as HeaderView } from '@/components/layout/header'
import {
  SHOP_SECTIONS,
  type ShopSection,
} from '@/components/layout/header/nav/data'
import { getCollectionProductLinks } from '@/lib/shopify/operations/collection'

export async function Header() {
  const shopSections = await Promise.all(
    SHOP_SECTIONS.map(async (section): Promise<ShopSection> => {
      if (!section.productCollectionHandle) return section

      return {
        ...section,
        links: await getCollectionProductLinks(section.productCollectionHandle),
      }
    }),
  )

  return <HeaderView shopSections={shopSections} />
}
