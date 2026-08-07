'use client'

import { Search } from 'lucide-react'

import { Button } from '@/components/ui'

type SearchTriggerProps = {
  onClick: () => void
}

/**
 * Pill-shaped faux input that opens the search overlay. The real input lives in
 * the overlay; this stays a button so the header ships no autocomplete JS until
 * search is actually opened. Width is controlled by the owning wrapper.
 */
export function SearchTrigger({ onClick }: SearchTriggerProps) {
  return (
    <Button
      variant="field"
      size="field"
      onClick={onClick}
      aria-haspopup="dialog"
      className="w-full"
    >
      <Search className="size-4 shrink-0" aria-hidden="true" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate text-left">
        Search teas, herbs &amp; spices&hellip;
      </span>
      <kbd
        className="border-hairline bg-paper text-ink-faint hidden shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] lg:inline-block"
        aria-hidden="true"
      >
        /
      </kbd>
    </Button>
  )
}
