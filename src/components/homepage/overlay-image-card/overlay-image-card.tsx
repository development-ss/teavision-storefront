import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { HomepageImageCard } from '@/lib/sanity/home-page'
import { cn } from '@/lib/utils'

export type OverlayImageCardProps = {
  card: HomepageImageCard
  className?: string
}

function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

// The card title already names the link, so alt text that repeats it is
// announced twice. Treat that image as decorative.
export function getCardImageAlt(card: HomepageImageCard): string {
  return normalizeLabel(card.image.alt) === normalizeLabel(card.title)
    ? ''
    : card.image.alt
}

export function OverlayImageCard({ card, className }: OverlayImageCardProps) {
  return (
    <Link
      href={card.href}
      className={cn(
        'group focus-visible:ring-ring relative block aspect-video overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:aspect-square',
        className,
      )}
    >
      <Image
        src={card.image.src}
        alt={getCardImageAlt(card)}
        fill
        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 48vw, 100vw"
        className="object-cover"
      />
      {/* Bottom gradient scrim deepens on hover via opacity so it fades smoothly. */}
      <div
        aria-hidden="true"
        className="from-ink/85 via-ink/15 to-ink/15 absolute inset-0 bg-linear-to-t via-65%"
      />
      <div
        aria-hidden="true"
        className="from-ink/92 via-ink/35 to-ink/35 absolute inset-0 bg-linear-to-t via-70% opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none"
      />
      {card.badge && (
        <Image
          src={card.badge.src}
          alt={card.badge.alt}
          width={80}
          height={80}
          className="absolute top-3 left-3 size-12 rounded-full object-contain sm:size-16"
        />
      )}
      {/* Card content */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="font-display text-paper text-[1.3rem] leading-[1.05]">
          {card.title}
        </h3>
        {/* Hover CTA — mono 11px uppercase with translateY reveal */}
        <span
          aria-hidden="true"
          className="text-paper mt-3.5 inline-flex translate-y-1.5 items-center gap-1.75 font-mono text-[11px] tracking-[0.08em] uppercase opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none max-lg:translate-y-0 max-lg:opacity-100"
        >
          {card.action} <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
