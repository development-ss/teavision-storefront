import type { ServiceLink } from '../data'

export type ServicesMenuProps = {
  onClose: () => void
  open: boolean
  pathname: string
}

export type DesktopServicesMenuProps = ServicesMenuProps & {
  activeService: ServiceLink
  onActiveServiceChange: (href: string) => void
}
