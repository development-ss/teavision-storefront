import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Eyebrow, Section } from '@/components/ui'
import type { HomepageContent } from '@/lib/sanity/home-page'

export type PrivateLabelProps = HomepageContent['privateLabel']

export function PrivateLabel({ cards, intro }: PrivateLabelProps) {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        {/* Keep supporting copy directly beneath the section title */}
        <div className="mb-10 flex flex-col gap-5">
          <div>
            {intro.eyebrow && (
              <Eyebrow className="mb-4">{intro.eyebrow}</Eyebrow>
            )}
            <h2 className="type-heading-01">{intro.title}</h2>
          </div>
          {intro.copy && (
            <p className="text-ink-soft max-w-[60ch]">{intro.copy}</p>
          )}
        </div>
        <ul className="grid gap-4.5 md:grid-cols-3">
          {cards.map((card, index) => (
            <li
              key={card.title}
              className="bg-card border-hairline-2 hover:shadow-3 flex flex-col rounded-lg border p-7.5 transition-[translate,box-shadow] duration-350 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
            >
              {/* 150px media block */}
              <div className="relative mb-5.5 h-37.5 w-full overflow-hidden rounded-md">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 90vw"
                  className="object-cover"
                />
              </div>
              {/* Numbering */}
              <p className="text-gold-deep font-mono text-xs tracking-[0.14em] uppercase">
                {String(index + 1).padStart(2, '0')}
              </p>
              {/* Title */}
              <h3 className="font-display mt-4 text-[1.45rem] leading-[1.1]">
                {card.title}
              </h3>
              {/* Card body */}
              {card.body ? (
                <p className="text-ink-soft mt-3 text-[0.96rem]">{card.body}</p>
              ) : null}
              {/* Link-arrow CTA */}
              <Link
                href={card.href}
                className="type-label border-hairline hover:border-brand hover:text-brand group mt-5.5 inline-flex items-center gap-2 self-start border-b-[1.5px] pb-0.75 text-[0.92rem]"
              >
                {card.action}
                <ArrowRight
                  className="size-3.75 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
