'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { CircleUserRound, Menu, Phone, ShoppingCart, X } from 'lucide-react'
import { Suspense, useCallback, useEffect, useState } from 'react'

import { IconButton } from '@/components/ui'

import { CartCount } from './cart/count'
import { MegaNav } from './nav/desktop'
import { SearchTrigger } from './search/trigger'

// Interaction-gated islands: kept out of the shared header bundle so their JS
// (mobile nav tree, search overlay + autocomplete) loads on open instead of on
// every route's first paint. Both already render null until opened, so a gated
// mount with ssr:false is behavior-identical to the previous always-mounted form.
const MobileMegaNav = dynamic(
  () => import('./nav/mobile').then((m) => m.MobileMegaNav),
  { ssr: false },
)
const SearchOverlay = dynamic(
  () => import('./search/overlay').then((m) => m.SearchOverlay),
  { ssr: false },
)

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // "/" opens search from anywhere on the page, unless focus is in a field.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      if (
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable ||
          e.target.closest('input, textarea, select, [contenteditable]'))
      ) {
        return
      }
      e.preventDefault()
      setSearchOpen(true)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-60">
        {/* Utility bar — only shown at lg+ where content fits on a single line */}
        <div className="bg-ink text-paper hidden h-9.5 lg:block">
          <div className="max-w-wide px-gutter mx-auto flex h-full items-center justify-between overflow-hidden font-mono text-[11.5px] tracking-[0.08em] whitespace-nowrap">
            <a
              href="tel:1300729617"
              className="text-paper/85 hover:text-paper focus-visible:ring-ring flex items-center gap-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
              aria-label="Call Teavision at 1300 729 617"
            >
              <Phone className="size-3" aria-hidden="true" />
              1300 729 617
            </a>
            <div className="flex items-center gap-3">
              <a
                href="mailto:info@teavision.com.au"
                className="text-paper/85 hover:text-paper focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
              >
                info@teavision.com.au
              </a>
              <span className="text-paper/50" aria-hidden="true">
                ·
              </span>
              <span>AUSTRALIAN OWNED &amp; OPERATED · EST. 2014</span>
            </div>
          </div>
        </div>

        {/* Main bar — logo, prominent search, account/cart. The desktop mega-nav
            lives in its own row below so search can hold the center. */}
        <div className="bg-paper/80 border-hairline border-b backdrop-blur-md lg:border-hairline-2">
          <div className="max-w-wide px-gutter mx-auto flex h-16 items-center gap-3 lg:h-19 lg:gap-8">
            {/* Left cluster — negative margin aligns the burger glyph (not its
                44px hit area) with the gutter; logo takes over at lg. */}
            <div className="-ml-3.5 flex shrink-0 items-center gap-1 lg:ml-0">
              {/* Burger — mobile only */}
              <IconButton
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-mega-nav"
                variant="ghost"
                size="md"
                onClick={() => setMobileOpen((v) => !v)}
                className="hover:bg-brand-tint hover:text-brand lg:hidden"
              >
                {mobileOpen ? (
                  <X className="size-4" aria-hidden="true" strokeWidth={1.8} />
                ) : (
                  <Menu
                    className="size-4"
                    aria-hidden="true"
                    strokeWidth={1.8}
                  />
                )}
              </IconButton>

              {/* Logo */}
              <Link
                href="/"
                className="focus-visible:ring-ring shrink-0 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Teavision home"
              >
                <Image
                  src="/teavision.svg"
                  alt="Teavision"
                  width={188}
                  height={44}
                  className="h-7 w-auto sm:h-8"
                />
              </Link>
            </div>

            {/* Search — the header's centerpiece at lg+; mobile gets its own row */}
            <div className="hidden min-w-0 flex-1 justify-center lg:flex">
              <div className="w-full max-w-xl">
                <SearchTrigger onClick={openSearch} />
              </div>
            </div>

            {/* Right cluster — negative margin aligns the last icon glyph (not its
                44px hit area) with the gutter, mirroring the burger's left edge. */}
            <div className="-mr-3.5 ml-auto flex shrink-0 items-center gap-1 lg:mr-0">
              {/* Account icon */}
              <Link
                href="/account"
                className="text-ink-soft hover:bg-brand-tint hover:text-brand focus-visible:ring-ring inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Account"
              >
                <CircleUserRound
                  className="size-4"
                  aria-hidden="true"
                  strokeWidth={1.8}
                />
              </Link>

              {/* Cart icon */}
              <Link
                href="/cart"
                className="text-ink-soft hover:bg-brand-tint hover:text-brand focus-visible:ring-ring relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                aria-label="Cart"
              >
                <ShoppingCart
                  className="size-4"
                  aria-hidden="true"
                  strokeWidth={1.8}
                />
                <Suspense fallback={null}>
                  <CartCount />
                </Suspense>
              </Link>
            </div>
          </div>

          {/* Mobile search row — always visible, part of the sticky header */}
          <div className="max-w-wide px-gutter mx-auto pb-3 lg:hidden">
            <SearchTrigger onClick={openSearch} />
          </div>
        </div>

        {/* Nav row — relative: mega panels anchor to its bottom via absolute top-full. */}
        <div className="bg-paper/80 border-hairline relative hidden border-b backdrop-blur-md lg:block">
          <div className="max-w-wide px-gutter mx-auto flex h-12 items-stretch">
            <MegaNav />
          </div>
        </div>

        {/* Mobile nav — lazy: only mounts (and loads its chunk) once opened */}
        {mobileOpen && (
          <MobileMegaNav open onClose={() => setMobileOpen(false)} />
        )}
      </header>

      {/* Search overlay — lazy: portal outside header; loads its chunk on open */}
      {searchOpen && <SearchOverlay open onClose={closeSearch} />}
    </>
  )
}
