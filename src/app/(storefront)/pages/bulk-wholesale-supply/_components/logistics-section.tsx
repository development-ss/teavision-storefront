import Image from 'next/image'
import { Check } from 'lucide-react'

import { Section } from '@/components/ui/section'

import { LOGISTICS_CHECK_ITEMS, SHIP_IMAGE_SRC } from '../_lib/data'

export function LogisticsSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src={SHIP_IMAGE_SRC}
              alt="Container ship for freight and logistics"
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full object-cover"
            />
          </div>

          <div>
            <h2 className="type-heading-01 text-ink max-w-[24ch] text-balance">
              Freight &amp; Logistics — Done For You
            </h2>
            <p className="type-body text-ink-soft mt-4 max-w-[52ch]">
              We coordinate origin pick-ups, ocean freight, customs, and final
              delivery. You&apos;ll get regular status updates and a clear ETA
              so your planning stays on track.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {LOGISTICS_CHECK_ITEMS.map((item) => (
                <li key={item.bold} className="flex items-start gap-3">
                  <span className="bg-brand text-paper mt-0.5 grid size-5 shrink-0 place-items-center rounded-full">
                    <Check className="size-3" aria-hidden="true" />
                  </span>
                  <span className="type-body text-ink">
                    <strong>{item.bold}</strong> {item.rest}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
