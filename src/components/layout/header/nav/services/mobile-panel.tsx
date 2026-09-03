import { CatalogueLinks } from '../catalogue-links'
import { ServicesLinks } from './links'
import type { ServicesMenuProps } from './types'

export function MobileServicesPanel({
  onClose,
  open,
  pathname,
}: ServicesMenuProps) {
  return (
    <div
      id="mobile-services-mega"
      className="bg-paper-2 border-hairline border-t"
      hidden={!open}
    >
      <div className="max-w-wide px-gutter mx-auto grid gap-5 py-4 md:grid-cols-2">
        <ServicesLinks onClose={onClose} pathname={pathname} />
        <CatalogueLinks onClose={onClose} pathname={pathname} />
      </div>
    </div>
  )
}
