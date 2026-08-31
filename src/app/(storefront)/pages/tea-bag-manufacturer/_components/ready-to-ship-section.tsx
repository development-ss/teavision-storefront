import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

import {
  READY_TO_SHIP_IMAGE_SRC,
  READY_TO_SHIP_VARIETIES,
  TEA_LIST_PDF_URL,
} from '../_lib/data'

export function ReadyToShipSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <Section.Intro
          title="Ready-to-Ship Tea Bags"
          copy="Need tea bags quickly? Choose from our ready-made collection with generic tags"
          className="mb-12"
        />
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative aspect-3/2 overflow-hidden rounded-xl">
            <Image
              src={READY_TO_SHIP_IMAGE_SRC}
              alt="Ready-to-ship tea bag varieties"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="type-heading-04 text-ink">Popular Tea Varieties</h3>
            <p className="type-body-sm text-ink-soft mt-3">
              Our top-selling teas are available for immediate shipping with
              generic tags. Perfect for businesses that need quick turnaround
              times.
            </p>
            <ul className="mt-6 flex flex-col gap-5">
              {READY_TO_SHIP_VARIETIES.map((variety) => (
                <li key={variety.title} className="flex items-start gap-3">
                  <span
                    className="bg-brand mt-1.5 size-2.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  <div>
                    <h4 className="type-label text-ink font-semibold">
                      {variety.title}
                    </h4>
                    <p className="type-body-sm text-ink-soft mt-1">
                      {variety.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button href={TEA_LIST_PDF_URL} variant="brand" size="lg">
                Download Tea List
              </Button>
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
