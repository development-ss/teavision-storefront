import Image from 'next/image'

import { Section } from '@/components/ui/section'

import { PACKAGING_CARDS } from '../_lib/data'

export function PackagingSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <Section.Intro
          align="left"
          title="Packaging options & formats"
          copy="Choose shelf-ready packaging or go fully custom with print finishes, closures and materials."
          variant="compact"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGING_CARDS.map((card) => (
            <div
              key={card.title}
              className="border-hairline bg-paper overflow-hidden rounded-xl border"
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
