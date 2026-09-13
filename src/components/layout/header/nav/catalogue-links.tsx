import { ArrowRight, Download } from 'lucide-react'
import Link from 'next/link'

import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'

import { CATALOGUE_LINKS, isNavLinkActive } from './data'
import { PANEL_LINK_CLASS } from './styles'

export function CatalogueLinks({
  onClose,
  pathname,
}: {
  onClose: () => void
  pathname: string
}) {
  return (
    <div>
      <Eyebrow tone="muted" rule={false} className="mb-3">
        Catalogues
      </Eyebrow>
      <Link
        href="/pages/certifications"
        aria-current={
          isNavLinkActive(pathname, '/pages/certifications')
            ? 'page'
            : undefined
        }
        className={cn(PANEL_LINK_CLASS, '-mx-2.5 flex min-h-10 gap-3')}
        onClick={onClose}
      >
        <span>Organic | Food Safety | Certs and Awards</span>
        <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" />
      </Link>
      <div className="border-hairline mt-4 border-t pt-4">
        <Eyebrow tone="muted" rule={false} className="mb-2">
          Downloadables
        </Eyebrow>
        <ul
          aria-label="Downloadable catalogues"
          className="-mx-2.5 grid gap-0.5"
          role="list"
        >
          {CATALOGUE_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                download
                className={cn(PANEL_LINK_CLASS, 'flex min-h-10 w-full gap-3')}
                onClick={onClose}
              >
                <span>
                  {link.label}
                  <span className="sr-only"> (PDF download)</span>
                </span>
                <Download
                  className="text-brand ml-auto size-4 shrink-0"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
