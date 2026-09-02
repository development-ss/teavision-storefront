import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { ToggleButton } from '@/components/ui/toggle-button'

import { SHOP_SECTIONS } from '../data'
import { PANEL_LINK_CLASS } from '../styles'
import type { ShopMenuProps } from './types'

export function ShopMegaPanel({
  activeShop,
  onActiveShopChange,
  onClose,
  open,
}: ShopMenuProps) {
  return (
    <div
      id="shop-mega"
      className="bg-paper border-hairline shadow-4 absolute inset-x-0 top-full z-50 border-b"
      hidden={!open}
    >
      <div className="max-w-wide px-gutter mx-auto py-10">
        <div className="grid gap-10 max-lg:grid-cols-1 lg:grid-cols-[1.1fr_2.4fr_1.3fr]">
          {/* Intro column */}
          <div className="flex flex-col gap-4">
            <Eyebrow tone="brand">Shop</Eyebrow>
            <h4 className="font-display text-ink text-[1.7rem] leading-[1.04] tracking-[-0.01em]">
              Shop {activeShop.name}
            </h4>
            {activeShop.asideDescription && (
              <p className="text-ink-soft text-[0.95rem] leading-[1.55]">
                {activeShop.asideDescription}
              </p>
            )}
            <Link
              href={activeShop.ctaHref}
              onClick={onClose}
              className="focus-visible:ring-ring type-label border-hairline text-ink hover:border-brand hover:text-brand mt-2 inline-flex items-center gap-2 self-start border-b-[1.5px] pb-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              View all {activeShop.name}
              <ArrowRight
                className="size-3.75"
                aria-hidden="true"
                strokeWidth={1.8}
              />
            </Link>
          </div>

          {/* Category selector + links */}
          <div className="flex flex-col gap-5">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2" role="list">
              {SHOP_SECTIONS.map((section) => {
                const isActive = section.key === activeShop.key
                return (
                  <ToggleButton
                    key={section.key}
                    variant="chip"
                    pressed={isActive}
                    onClick={() => onActiveShopChange(section.key)}
                    onMouseEnter={() => onActiveShopChange(section.key)}
                  >
                    {section.name}
                  </ToggleButton>
                )
              })}
            </div>

            {/* Links grid */}
            <div id={`shop-panel-${activeShop.key}`}>
              <p className="text-ink-faint mb-3 font-mono text-[10.5px] tracking-[0.14em] uppercase">
                Browse {activeShop.name}
              </p>
              <ul
                className="-mx-2.5 grid auto-rows-min grid-cols-2 gap-x-4 gap-y-0.5"
                role="list"
              >
                {activeShop.links.map((link) => (
                  <li key={`${activeShop.key}-${link.href}-${link.label}`}>
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
            </div>
          </div>

          {/* Feature card (right) */}
          {activeShop.imageAlt && activeShop.imageSrc && (
            <div className="relative self-start overflow-hidden rounded-lg">
              <Image
                key={activeShop.imageSrc}
                src={activeShop.imageSrc}
                alt={activeShop.imageAlt}
                width={1024}
                height={1024}
                className="h-auto w-full"
                sizes="(min-width: 1480px) 370px, 25vw"
                unoptimized
              />
              <div
                className="from-ink/65 pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-linear-to-t to-transparent"
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-5 flex flex-col items-center gap-2.5">
                <p className="font-display text-paper text-center text-xl tracking-[0.08em] uppercase">
                  {activeShop.name}
                </p>
                <span className="bg-paper h-px w-10" aria-hidden="true" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
