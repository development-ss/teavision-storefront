import Image from 'next/image'

import { Section } from '@/components/ui/section'

import { SOLUTION_CARDS } from '../_lib/data'

export function SolutionsSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <Section.Intro
          title="Complete Tea Manufacturing Solutions"
          copy="From custom blend creation to private label packaging, we offer end-to-end tea manufacturing services for businesses worldwide."
          className="mb-12 max-w-4xl [&>p]:mx-auto [&>p]:max-w-prose"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {SOLUTION_CARDS.map((card) => (
            <article
              key={card.title}
              className="border-hairline bg-card flex flex-col overflow-hidden rounded-xl border"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="type-heading-04 text-ink">{card.title}</h3>
                <p className="type-body-sm text-ink-soft">{card.copy}</p>
                <ul className="mt-1 flex flex-col gap-2">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span
                        className="bg-brand mt-1.5 size-2 shrink-0 rounded-full"
                        aria-hidden="true"
                      />
                      <span className="type-body-sm text-ink-soft">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
