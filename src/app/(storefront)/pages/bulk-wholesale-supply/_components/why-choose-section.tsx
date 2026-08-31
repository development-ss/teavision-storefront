import Image from 'next/image'

import { Accordion } from '@/components/ui/accordion'
import { Section } from '@/components/ui/section'

import { SHIP_AVIF_SRC, WHY_CHOOSE_ITEMS } from '../_lib/data'

const accordionItems = WHY_CHOOSE_ITEMS.map((item, index) => ({
  id: item.id,
  title: (
    <span>
      <span className="text-brand mr-2">{index + 1}.</span>
      {item.title}
    </span>
  ),
  content: item.body,
}))

export function WhyChooseSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="relative overflow-hidden rounded-xl">
            <Image
              src={SHIP_AVIF_SRC}
              alt="Cargo ship representing global tea imports"
              width={800}
              height={600}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full object-cover"
            />
          </div>

          <div>
            <h2 className="type-heading-01 text-ink max-w-[28ch] text-balance">
              Why Choose Teavision for Your Imported Tea Needs?
            </h2>
            <div className="mt-6">
              <Accordion items={accordionItems} />
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
