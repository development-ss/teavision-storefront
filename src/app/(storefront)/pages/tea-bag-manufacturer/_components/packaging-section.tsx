import Image from 'next/image'

import { Section } from '@/components/ui/section'

import {
  PACKAGING_IMAGES,
  PACKAGING_SOLUTIONS,
  TEA_BAG_STYLES,
  TEA_BAG_STYLES_IMAGE_SRC,
  type PackagingItem,
} from '../_lib/data'
import { PackagingCarousel } from './packaging-carousel'

function renderItems(items: PackagingItem[]) {
  return (
    <ul className="mt-8 flex flex-col gap-5">
      {items.map((item) => (
        <li key={item.title} className="flex items-start gap-3">
          <span
            className="bg-brand mt-1.5 size-2.5 shrink-0 rounded-full"
            aria-hidden="true"
          />
          <div>
            <h4 className="type-label text-ink font-semibold">{item.title}</h4>
            <p className="type-body-sm text-ink-soft mt-1">
              {item.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function PackagingSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <Section.Intro
          title="Tea Bag & Packaging Options"
          copy="Choose from various tea bag styles and packaging solutions to match your brand"
          className="mb-12"
        />

        {/* Tea bag styles */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative aspect-3/2 overflow-hidden rounded-xl">
            <Image
              src={TEA_BAG_STYLES_IMAGE_SRC}
              alt="Square, pyramid, and tagged tea bag styles"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="type-heading-04 text-ink">Tea Bag Styles</h3>
            {renderItems(TEA_BAG_STYLES)}
          </div>
        </div>

        {/* Packaging solutions */}
        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="order-last lg:order-first">
            <h3 className="type-heading-04 text-ink">Packaging Solutions</h3>
            {renderItems(PACKAGING_SOLUTIONS)}
          </div>
          <PackagingCarousel images={PACKAGING_IMAGES} />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
