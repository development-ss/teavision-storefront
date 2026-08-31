import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { ToggleButton } from '@/components/ui/toggle-button'

import { SHOP_SECTIONS } from '../data'
import { PANEL_LINK_CLASS } from '../styles'
import type { ShopMenuProps } from './types'

export function MobileShopPanel({
  activeShop,
  onActiveShopChange,
  onClose,
  open,
}: ShopMenuProps) {
  return (
    <div
      id="mobile-shop-mega"
      className="bg-paper-2 border-hairline border-t"
      hidden={!open}
    >
      <div className="max-w-wide px-gutter mx-auto grid gap-4 py-4 md:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Category selector — flex-wrap so chips wrap at 375px instead of horizontal-scrolling */}
        <div>
          <div className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap">
            {SHOP_SECTIONS.map((section) => {
              const isActive = section.key === activeShop.key

              return (
                <ToggleButton
                  key={section.key}
                  variant="tabText"
                  pressed={isActive}
                  onClick={() => onActiveShopChange(section.key)}
                >
                  {section.name}
                </ToggleButton>
              )
            })}
          </div>
        </div>

        <div id={`mobile-shop-panel-${activeShop.key}`} className="space-y-4">
          <div>
            <p className="type-label text-ink">{activeShop.name}</p>
            {activeShop.description && (
              <p className="type-caption text-ink-soft mt-1 max-w-prose">
                {activeShop.description}
              </p>
            )}
          </div>

          {/* Links — negative margin compensates for px-2.5 padding so text aligns with heading */}
          <ul className="-mx-2.5 grid gap-0.5 sm:grid-cols-2" role="list">
            {activeShop.links.map((link) => (
              <li key={`mobile-${activeShop.key}-${link.href}-${link.label}`}>
                <Link
                  href={link.href}
                  className={PANEL_LINK_CLASS}
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* View-all uses ArrowRight (distinct from ChevronRight drill-in indicators) */}
          <Link
            href={activeShop.ctaHref}
            className="focus-visible:ring-ring type-label text-brand hover:text-brand-deep inline-flex min-h-11 items-center gap-1.5 rounded-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onClick={onClose}
          >
            View all {activeShop.name}
            <ArrowRight
              className="size-3.5"
              aria-hidden="true"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
