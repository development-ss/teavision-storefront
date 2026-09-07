import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { SERVICES } from '../_lib/data'

export function OfferingsSection() {
  return (
    <Section.Root
      id="core-services"
      tone="sunken"
      aria-labelledby="offerings-heading"
      className="scroll-mt-32 md:scroll-mt-44"
    >
      <Section.Container>
        <div className="mb-10">
          <Eyebrow>Blending · Packing · Supply</Eyebrow>
          <h2 id="offerings-heading" className="type-heading-01 mt-4">
            Explore our services
          </h2>
        </div>
        <ul
          aria-label="Core services"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {SERVICES.map((service) => (
            <li key={service.href}>
              <Card
                as="a"
                href={service.href}
                aria-label={`Learn More about ${service.title}`}
                overflow="hidden"
                interactive
                className="group flex h-full flex-col"
              >
                <div className="relative aspect-3/2">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="type-heading-03">{service.title}</h3>
                  <p className="type-body text-ink-soft mt-3 mb-5">
                    {service.copy}
                  </p>
                  <span className="type-label text-brand group-hover:text-brand-deep mt-auto inline-flex min-h-11 w-fit items-center gap-2 underline-offset-4 transition-colors group-hover:underline group-focus-visible:underline">
                    Learn More
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
