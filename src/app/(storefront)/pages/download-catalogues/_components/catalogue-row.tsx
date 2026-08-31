import {
  BadgeCheck,
  Download,
  FlaskConical,
  GlassWater,
  Leaf,
  Package,
  Sprout,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Catalogue, CatalogueIcon } from '../_lib/data'

const ICONS: Record<CatalogueIcon, LucideIcon> = {
  leaf: Leaf,
  teaBag: Package,
  beverage: GlassWater,
  herbs: Sprout,
  blends: FlaskConical,
  certificate: BadgeCheck,
}

export function CatalogueRow({ catalogue }: { catalogue: Catalogue }) {
  const Icon = ICONS[catalogue.icon]

  return (
    <article className="grid gap-5 p-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:items-center sm:gap-6 lg:grid-cols-[4.5rem_minmax(0,1fr)_7rem_auto] lg:px-6">
      <div
        aria-hidden="true"
        className={cn(
          'flex h-20 w-18 shrink-0 flex-col justify-between rounded-md p-3',
          catalogue.isCertificate
            ? 'bg-gold text-brand-deep'
            : 'bg-brand-deep text-paper',
        )}
      >
        <Icon
          className={cn(
            'size-5',
            catalogue.isCertificate ? 'text-brand-deep' : 'text-gold',
          )}
        />
        <span className="font-display text-sm leading-tight">
          {catalogue.plateLabel}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="type-heading-05 text-ink wrap-break-word">
          {catalogue.title}
        </h3>
        <p className="type-body text-ink-soft mt-1.5">
          {catalogue.description}
        </p>
      </div>

      <span className="type-mono-meta text-ink-faint whitespace-nowrap sm:col-start-2 lg:col-start-auto">
        PDF &middot; {catalogue.fileSize}
      </span>

      <div className="sm:col-start-2 lg:col-start-auto lg:justify-self-end">
        <Button
          href={catalogue.href}
          variant="primary"
          size="sm"
          download
          aria-label={`Download ${catalogue.title}`}
          target="_blank"
          rel="noopener"
        >
          <Download className="size-4" aria-hidden="true" />
          Download
        </Button>
      </div>
    </article>
  )
}
