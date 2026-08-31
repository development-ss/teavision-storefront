import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'

import {
  WHOLESALE_INCLUSIONS,
  WHOLESALE_PATHS,
} from '../_lib/wholesale-content'

export function SupplyPaths() {
  return (
    <Section.Root tone="transparent" spacing="none">
      <Section.Intro
        align="left"
        eyebrow=">Why apply"
        title="Start with the right commercial route."
        copy="Built for businesses buying by the kilo, with certified supply conversations and commercial account support from first enquiry."
      />

      <ul className="mt-6 grid gap-0" role="list">
        {WHOLESALE_INCLUSIONS.map((item) => (
          <li
            key={item}
            className="border-hairline flex gap-3 border-t py-4 last:border-b"
          >
            <CheckCircle2
              className="text-brand mt-0.5 size-5 shrink-0"
              aria-hidden="true"
              strokeWidth={1.8}
            />
            <span className="type-body-sm text-ink-soft">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge variant="organic" label="ACO certified" />
        <Badge variant="organic" label="USDA organic" />
        <Badge variant="gold" label="HACCP pathway" />
      </div>

      <ul
        className="mt-8 grid gap-4 md:grid-cols-3"
        role="list"
        aria-label="Wholesale service pathways"
      >
        {WHOLESALE_PATHS.map((path) => (
          <Card as="li" key={path.title} interactive className="h-full">
            <Link
              href={path.href}
              className="focus-visible:ring-ring block h-full p-5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <h3 className="type-heading-04 text-ink">{path.title}</h3>
              <p className="type-body-sm text-ink-soft mt-3">{path.body}</p>
            </Link>
          </Card>
        ))}
      </ul>
    </Section.Root>
  )
}
