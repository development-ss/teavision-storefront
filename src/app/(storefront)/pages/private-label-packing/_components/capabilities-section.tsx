import Image from 'next/image'

import { Section } from '@/components/ui/section'

import { CAPABILITY_CARDS } from '../_lib/data'

export function CapabilitiesSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="type-heading-01 text-ink">
            Best Selling Custom Label Ideas
          </h2>
          <a
            href="mailto:info@teavision.com.au?subject=Brief%20my%20product"
            className="type-label text-brand hover:text-brand-deep transition-colors"
          >
            Send Your Brief &rarr;
          </a>
        </div>
        <p className="type-lede text-ink-soft mb-10 max-w-[60ch]">
          Pick from ready-to-win formulas or brief a custom blend. Our team
          engineers flavour, function and format for your market.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITY_CARDS.map((card) => (
            <div
              key={card.title}
              className="border-hairline bg-card overflow-hidden rounded-xl border"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="type-label text-ink font-semibold">
                  {card.title}
                </p>
                <p className="type-body-sm text-ink-soft mt-1">{card.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
