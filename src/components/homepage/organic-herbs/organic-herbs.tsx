import Image from 'next/image'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import type { HomepageContent } from '@/lib/sanity/home-page'

export type OrganicHerbsProps = HomepageContent['organicHerbs']

export function OrganicHerbs({
  checklist,
  cta,
  image,
  intro,
}: OrganicHerbsProps) {
  return (
    <Section.Root tone="sunken" spacing="none">
      <Section.Container
        variant="base"
        className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20 xl:gap-20"
      >
        <div className="max-w-xl">
          {intro.eyebrow && <Eyebrow className="mb-4">{intro.eyebrow}</Eyebrow>}
          <h2 className="type-heading-02">{intro.title}</h2>
          {intro.copy && (
            <p className="type-lede text-ink-soft mt-4">{intro.copy}</p>
          )}
          <ul className="mt-6 flex flex-col gap-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  className="text-brand mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <p className="type-body">{item}</p>
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <Button href={cta.href} variant="brand" size="lg">
              {cta.children}
            </Button>
          </div>
        </div>
        <div className="border-hairline bg-card relative aspect-square w-full max-w-xl justify-self-center overflow-hidden rounded-lg border lg:max-w-none lg:justify-self-end">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 536px, (min-width: 640px) 576px, calc(100vw - 2.5rem)"
            className="object-cover object-right"
          />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
