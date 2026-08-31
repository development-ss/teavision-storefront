'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, Suspense } from 'react'

import { Eyebrow } from '@/components/ui/eyebrow'
import { IconButton } from '@/components/ui/icon-button'

import { Search as SearchWithAutocomplete } from './view'
import { SearchForm } from './form'

const POPULAR_SUGGESTIONS = [
  'Earl Grey',
  'Matcha',
  'Sticky Chai',
  'Organic Peppermint',
  'Lemon Myrtle',
  'Sleep blends',
  'Bulk tea bags',
  'Turmeric',
]

type SearchOverlayProps = {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus the search input when the overlay opens
  useEffect(() => {
    if (!open) return

    const inputEl = panelRef.current?.querySelector<HTMLInputElement>(
      '[data-search-input]',
    )
    if (inputEl) {
      const id = window.setTimeout(() => inputEl.focus(), 30)
      return () => window.clearTimeout(id)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  // Lock body scroll while the modal overlay is open
  useEffect(() => {
    if (!open) return

    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop scrim — behind panel but above page content */}
      <div
        className="bg-ink/35 fixed inset-0 z-65 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="bg-paper border-hairline shadow-4 fixed inset-x-0 top-0 z-70 border-b"
        role="dialog"
        aria-modal="true"
        aria-label="Site search"
      >
        <div className="max-w-wide px-gutter mx-auto pt-5 pb-7">
          {/* Close button row */}
          <div className="mb-3 flex justify-end">
            <IconButton
              aria-label="Close search"
              variant="ghost"
              size="md"
              onClick={onClose}
              className="hover:bg-brand-tint hover:text-brand"
            >
              <X className="size-5" aria-hidden="true" strokeWidth={1.8} />
            </IconButton>
          </div>

          {/* Search input row — comfortable body scale, shared .field focus ring */}
          <div className="mb-6">
            <Suspense fallback={<SearchForm />}>
              <SearchWithAutocomplete onNavigate={onClose} />
            </Suspense>
          </div>

          {/* Popular suggestions */}
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow tone="muted" rule={false}>
              Popular
            </Eyebrow>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUGGESTIONS.map((suggestion) => (
                <a
                  key={suggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                  onClick={onClose}
                  className="focus-visible:ring-ring border-hairline bg-card type-label text-ink hover:bg-brand hover:text-paper rounded-full border px-3.5 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {suggestion}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
