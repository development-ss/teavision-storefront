'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal, preload } from 'react-dom'

import { DisclosureButton } from '@/components/ui/disclosure-button'
import { cn } from '@/lib/utils'

import { DIRECT_LINKS, SHOP_SECTIONS, type MenuKey, type ShopKey } from './data'
import { DESKTOP_MENU_ITEM_CLASS, NAV_TRIGGER_CLASS } from './styles'
import { ServicesMegaPanel } from './services/panel'
import { ShopMegaPanel } from './shop/panel'
import { useOutsideClose } from './use-outside-close'

/** Grace period in ms before the mega panel closes after cursor leaves the trigger or panel. */
const CLOSE_GRACE_MS = 200

function preloadShopImages() {
  for (const section of SHOP_SECTIONS) {
    preload(section.imageSrc, {
      as: 'image',
      fetchPriority: 'low',
      type: 'image/webp',
    })
  }
}

export function MegaNav() {
  const navRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hoverOpenedMenuRef = useRef<MenuKey | null>(null)
  const clickConfirmedMenuRef = useRef<MenuKey | null>(null)
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [activeShopKey, setActiveShopKey] = useState<ShopKey>('tea')
  const activeShop =
    SHOP_SECTIONS.find((section) => section.key === activeShopKey) ??
    SHOP_SECTIONS[0]!

  preloadShopImages()

  // Clear the close timer on unmount to prevent state updates on an unmounted component.
  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  /** Immediately cancel any pending close and open the given menu. */
  const openMenuFromHover = useCallback(
    (key: MenuKey) => {
      clearCloseTimer()
      if (clickConfirmedMenuRef.current !== key) {
        clickConfirmedMenuRef.current = null
      }
      hoverOpenedMenuRef.current = key
      setOpenMenu(key)
    },
    [clearCloseTimer],
  )

  const toggleMenu = useCallback(
    (key: MenuKey) => {
      clearCloseTimer()
      setOpenMenu((current) => {
        const wasOpenedByHover = hoverOpenedMenuRef.current === key
        const wasConfirmedByClick = clickConfirmedMenuRef.current === key
        hoverOpenedMenuRef.current = null

        if (wasOpenedByHover && !wasConfirmedByClick) {
          clickConfirmedMenuRef.current = key
          return key
        }

        clickConfirmedMenuRef.current = null
        return current === key ? null : key
      })
    },
    [clearCloseTimer],
  )

  /** Schedule the close after the grace period. Cancelled by openMenuFromHover or keepOpen. */
  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      hoverOpenedMenuRef.current = null
      clickConfirmedMenuRef.current = null
      setOpenMenu(null)
    }, CLOSE_GRACE_MS)
  }, [clearCloseTimer])

  const closeMenus = useCallback(() => {
    clearCloseTimer()
    hoverOpenedMenuRef.current = null
    clickConfirmedMenuRef.current = null
    setOpenMenu(null)
  }, [clearCloseTimer])

  useOutsideClose(navRef, closeMenus)

  return (
    // display:contents wrapper scopes outside-close to triggers AND panels —
    // with the ref on <nav> alone, pointerdown on a panel link closed (hid)
    // the panel before the click completed, so links never navigated.
    <div ref={navRef} className="contents">
      <nav aria-label="Main">
        {/*
          ul is h-full so each li can stretch to the full main-bar height, keeping an
          unbroken hover path from trigger to the panel anchored at the main bar's bottom.
        */}
        <ul className="flex h-full items-stretch gap-1" role="list">
          <li
            className={DESKTOP_MENU_ITEM_CLASS}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <DisclosureButton
              aria-controls="shop-mega"
              aria-expanded={openMenu === 'shop'}
              onClick={() => toggleMenu('shop')}
              className={NAV_TRIGGER_CLASS}
            >
              <span
                className="inline-flex items-center gap-1"
                onMouseEnter={() => openMenuFromHover('shop')}
              >
                Shop
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform',
                    openMenu === 'shop' && 'rotate-180',
                  )}
                  aria-hidden="true"
                  strokeWidth={1.8}
                />
              </span>
            </DisclosureButton>
          </li>

          <li
            className={DESKTOP_MENU_ITEM_CLASS}
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <DisclosureButton
              aria-controls="services-menu"
              aria-expanded={openMenu === 'services'}
              onClick={() => toggleMenu('services')}
              className={NAV_TRIGGER_CLASS}
            >
              <span
                className="inline-flex items-center gap-1"
                onMouseEnter={() => openMenuFromHover('services')}
              >
                Services
                <ChevronDown
                  className={cn(
                    'size-4 transition-transform',
                    openMenu === 'services' && 'rotate-180',
                  )}
                  aria-hidden="true"
                  strokeWidth={1.8}
                />
              </span>
            </DisclosureButton>
          </li>

          {DIRECT_LINKS.map((link) => (
            <li key={link.href} className={DESKTOP_MENU_ITEM_CLASS}>
              <Link href={link.href} className={NAV_TRIGGER_CLASS}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mega panels — onMouseEnter cancels the grace-period close; onMouseLeave re-schedules it */}
      <div onMouseEnter={clearCloseTimer} onMouseLeave={scheduleClose}>
        <ShopMegaPanel
          activeShop={activeShop}
          onActiveShopChange={setActiveShopKey}
          onClose={closeMenus}
          open={openMenu === 'shop'}
        />
        <ServicesMegaPanel
          onClose={closeMenus}
          open={openMenu === 'services'}
        />
      </div>

      {/* Page scrim — portaled to body because the header's backdrop-blur-md makes
          it a backdrop root, so a descendant's backdrop-filter can't sample the
          page behind it. z-40 keeps it under the sticky header (z-60). */}
      {openMenu &&
        createPortal(
          <div
            className="bg-ink/35 fixed inset-0 z-40 backdrop-blur-[2px]"
            aria-hidden="true"
            onClick={closeMenus}
          />,
          document.body,
        )}
    </div>
  )
}
