import type { ShopKey, ShopSection } from '../data'

export type ShopMenuProps = {
  activeShop: ShopSection
  onActiveShopChange: (key: ShopKey) => void
  onClose: () => void
  open: boolean
  pathname: string
}
