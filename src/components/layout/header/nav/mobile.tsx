'use client'

import Link from 'next/link'
import { ChevronDown, ChevronRight, Phone } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DisclosureButton } from '@/components/ui/disclosure-button'
import { cn } from '@/lib/utils'

import { DIRECT_LINKS, SHOP_SECTIONS, type MenuKey, type ShopKey } from './data'
import { MobileServicesPanel } from './services/mobile-panel'
import { MobileShopPanel } from './shop/mobile-panel'

type MobileMegaNavProps = {
  open: boolean
  onClose: () => void
}

export function MobileMegaNav({ open, onClose }: MobileMegaNavProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [activeShopKey, setActiveShopKey] = useState<ShopKey>('tea')
  const activeShop =
    SHOP_SECTIONS.find((section) => section.key === activeShopKey) ??
    SHOP_SECTIONS[0]!

  const closeAll = () => {
    setOpenMenu(null)
    onClose()
  }

  // Close on Escape (mirrors SearchOverlay)
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Lock body scroll while the full-screen overlay is open
  useEffect(() => {
    if (!open) return

    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [open])

  if (!open) return null

  return (
    // Overlay starts below the sticky mobile header (top-30 = 120px: 64px main
    // bar + 56px search row) so the burger/X button remains visible and
    // tappable above it.
    <div
      id="mobile-mega-nav"
      className="bg-paper fixed inset-x-0 top-30 bottom-0 z-55 overflow-y-auto lg:hidden"
    >
      {/* Body — the burger/X in the main bar above is the single close control */}
      <div className="flex flex-col">
        {/* Shop accordion */}
        <div className="border-hairline border-b">
          <DisclosureButton
            aria-controls="mobile-shop-mega"
            aria-expanded={openMenu === 'shop'}
            onClick={() =>
              setOpenMenu((current) => (current === 'shop' ? null : 'shop'))
            }
            className="px-gutter font-display text-ink flex min-h-0 w-full items-center justify-between rounded-none py-5 text-2xl"
          >
            Shop
            <ChevronDown
              className={cn(
                'text-ink-faint size-5 transition-transform',
                openMenu === 'shop' && 'rotate-180',
              )}
              aria-hidden="true"
              strokeWidth={1.5}
            />
          </DisclosureButton>
          <MobileShopPanel
            activeShop={activeShop}
            onActiveShopChange={setActiveShopKey}
            onClose={closeAll}
            open={openMenu === 'shop'}
          />
        </div>

        {/* Services accordion */}
        <div className="border-hairline border-b">
          <DisclosureButton
            aria-controls="mobile-services-mega"
            aria-expanded={openMenu === 'services'}
            onClick={() =>
              setOpenMenu((current) =>
                current === 'services' ? null : 'services',
              )
            }
            className="px-gutter font-display text-ink flex min-h-0 w-full items-center justify-between rounded-none py-5 text-2xl"
          >
            Services
            <ChevronDown
              className={cn(
                'text-ink-faint size-5 transition-transform',
                openMenu === 'services' && 'rotate-180',
              )}
              aria-hidden="true"
              strokeWidth={1.5}
            />
          </DisclosureButton>
          <MobileServicesPanel
            onClose={closeAll}
            open={openMenu === 'services'}
          />
        </div>

        {/* Direct links */}
        {DIRECT_LINKS.map((link) => (
          <div key={link.href} className="border-hairline border-b">
            <Link
              href={link.href}
              onClick={closeAll}
              className="px-gutter font-display text-ink hover:text-brand flex w-full items-center justify-between py-5 text-2xl transition-colors"
            >
              {link.label}
              <ChevronRight
                className="text-ink-faint size-5"
                aria-hidden="true"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        ))}

        {/* Footer CTA row */}
        <div className="px-gutter flex flex-col gap-3 py-8">
          <Button
            href="tel:1300729617"
            variant="secondary"
            size="lg"
            onClick={closeAll}
          >
            <Phone className="size-4" aria-hidden="true" />
            1300 729 617
          </Button>
        </div>
      </div>
    </div>
  )
}
