import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Eyebrow } from '@/components/ui/eyebrow'

import { CatalogueLinks } from '../catalogue-links'
import { ServicesLinks } from './links'
import type { ServicesMenuProps } from './types'

export function ServicesMegaPanel({
  onClose,
  open,
  pathname,
}: ServicesMenuProps) {
  return (
    <div
      id="services-menu"
      className="bg-paper border-hairline shadow-4 absolute inset-x-0 top-full z-50 border-b"
      hidden={!open}
    >
      <div className="max-w-wide px-gutter mx-auto py-10">
        <div className="grid gap-10 max-lg:grid-cols-1 lg:grid-cols-[1.1fr_3.7fr]">
          {/* Intro column */}
          <div className="flex flex-col gap-4">
            <Eyebrow tone="brand">Services</Eyebrow>
            <h4 className="font-display text-ink text-[1.7rem] leading-[1.04] tracking-[-0.01em]">
              Build your brand
            </h4>
            <p className="text-ink-soft text-[0.95rem] leading-[1.55]">
              From a single signature blend to fully-packaged private label —
              concept to shelf.
            </p>
            <Link
              href="/pages/wholesale"
              aria-current={
                pathname === '/pages/wholesale' ? 'page' : undefined
              }
              onClick={onClose}
              className="focus-visible:ring-ring type-label border-hairline text-ink hover:border-brand hover:text-brand aria-[current=page]:border-brand aria-[current=page]:text-brand mt-2 inline-flex items-center gap-2 self-start border-b-[1.5px] pb-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              All services
              <ArrowRight
                className="size-3.75"
                aria-hidden="true"
                strokeWidth={1.8}
              />
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <ServicesLinks onClose={onClose} pathname={pathname} />
            <CatalogueLinks onClose={onClose} pathname={pathname} />
          </div>
        </div>
      </div>
    </div>
  )
}
