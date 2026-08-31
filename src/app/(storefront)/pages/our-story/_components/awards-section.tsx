import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/ui/section'

import { AWARD_IMAGES } from '../_lib/data'

export function AwardsSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container className="flex flex-col gap-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="type-heading-02 text-ink">Awards & Certifications</h2>
          <p className="type-body text-ink-soft mx-auto mt-5 max-w-3xl">
            Teavision is proud to be one of the most awarded and certified
            wholesale tea companies in Australia. Our global recognitions
            include:
          </p>
          <p className="sr-only">
            17+ industry awards, including 7 Gold Medals for various tea blends
            and industry recognition, plus Australian Organic certification.
          </p>
        </div>

        <div className="flex justify-center">
          <Badge variant="gold" label="17+ industry awards" />
        </div>

        <ul
          className="grid grid-cols-2 items-center gap-x-8 gap-y-7 sm:grid-cols-3 lg:grid-cols-7"
          role="list"
          aria-hidden="true"
        >
          {AWARD_IMAGES.map((image) => (
            <li
              key={image.src}
              className="flex min-h-24 items-center justify-center px-2 py-3 sm:min-h-28"
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1024px) 10rem, (min-width: 640px) 30vw, 50vw"
                className="h-auto max-h-20 w-full object-contain mix-blend-multiply"
              />
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
