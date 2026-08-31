import Image from 'next/image'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { HomepageContent } from '@/lib/sanity/home-page'

export type SupplyChainProtectionProps =
  HomepageContent['supplyChainProtection']

export function SupplyChainProtection({
  intro,
  marks,
}: SupplyChainProtectionProps) {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="mx-auto max-w-200 text-center">
          {intro.eyebrow && (
            <Eyebrow className="mb-4 justify-center">{intro.eyebrow}</Eyebrow>
          )}
          <h2 className="type-heading-02 text-ink">{intro.title}</h2>
          {intro.copy && (
            <p className="text-ink-soft mx-auto mt-7 max-w-184">{intro.copy}</p>
          )}
        </div>

        <ul
          className="mt-16 grid grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-7"
          aria-label="Supply chain certification marks"
        >
          {marks.map((mark) => (
            <li
              key={mark.src}
              className="flex min-h-24 items-center justify-center px-2 py-3 sm:min-h-28"
            >
              <Image
                src={mark.src}
                alt={mark.alt}
                width={mark.width}
                height={mark.height}
                sizes="(min-width: 1024px) 11vw, (min-width: 640px) 30vw, 45vw"
                className="h-auto max-h-20 w-full object-contain mix-blend-multiply"
              />
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
