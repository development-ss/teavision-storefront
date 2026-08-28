import { Mail, MapPin, Phone } from 'lucide-react'

import type { IconName } from '../_lib/page-data'

const iconClassName = 'size-5'

export function Icon({ name }: { name: IconName }) {
  switch (name) {
    case 'phone':
      return (
        <Phone className={iconClassName} aria-hidden="true" strokeWidth={1.8} />
      )
    case 'mail':
      return (
        <Mail className={iconClassName} aria-hidden="true" strokeWidth={1.8} />
      )
    case 'pin':
      return (
        <MapPin
          className={iconClassName}
          aria-hidden="true"
          strokeWidth={1.8}
        />
      )
  }
}
