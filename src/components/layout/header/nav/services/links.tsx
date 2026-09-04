import Link from 'next/link'

import { isNavLinkActive, SERVICES_LINKS } from '../data'
import { PANEL_LINK_CLASS } from '../styles'

export function ServicesLinks({
  onClose,
  pathname,
  onPreview,
}: {
  onClose: () => void
  pathname: string
  onPreview?: (href: string) => void
}) {
  return (
    <div>
      <p className="text-ink-faint mb-3 font-mono text-[10.5px] tracking-[0.14em] uppercase">
        Services
      </p>
      <ul className="-mx-2.5 grid gap-0.5" role="list">
        {SERVICES_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={
                isNavLinkActive(pathname, link.href) ? 'page' : undefined
              }
              className={PANEL_LINK_CLASS}
              onClick={onClose}
              onMouseEnter={() => onPreview?.(link.href)}
              onFocus={() => onPreview?.(link.href)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
