// Pill-style nav trigger (desktop nav links + DisclosureButton trigger)
export const NAV_TRIGGER_CLASS =
  'type-label focus-visible:ring-ring inline-flex min-h-11 items-center gap-1 rounded-full px-5 py-2.5 text-ink transition-colors hover:bg-brand-tint hover:text-brand focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none aria-[current=page]:text-brand aria-[current=page]:underline aria-[current=page]:underline-offset-4 aria-expanded:bg-brand-tint aria-expanded:text-brand'

// Link rows inside mega panels
export const PANEL_LINK_CLASS =
  'focus-visible:ring-ring type-label inline-flex min-h-9 items-center rounded-md px-2.5 py-1.75 text-ink-soft transition-colors hover:bg-brand-tint hover:text-brand focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none aria-[current=page]:text-brand aria-[current=page]:underline aria-[current=page]:underline-offset-4'

// Desktop nav list item — h-full/self-stretch so hover area fills the full main-bar height,
// keeping the hover path unbroken down to the panel anchored at the main bar's bottom.
export const DESKTOP_MENU_ITEM_CLASS = 'flex h-full items-center self-stretch'
