import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { WholesaleStats } from './wholesale-stats'

export function WholesaleHero() {
  return (
    <Section.Root tone="brand">
      <Section.Container>
        <nav
          className="type-mono-meta text-paper/65 mb-8"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-2" role="list">
            <li>
              <Link
                href="/"
                className="hover:text-paper focus-visible:ring-ring rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gold" aria-current="page">
              Wholesale
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(18rem,0.28fr)] lg:items-end">
          <div>
            <Eyebrow tone="gold">Wholesale supply</Eyebrow>
            <h1 className="type-display text-paper mt-5 max-w-[16ch] text-balance">
              Bulk tea, herbs, and spices for serious buyers.
            </h1>
            <p className="type-lede text-paper/85 mt-6 max-w-[54ch]">
              Access Teavision&rsquo;s ingredient range, certified supply
              pathways, and commercial guidance for cafes, restaurants,
              retailers, and wellness brands across Australia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                href="/collections/all"
                variant="inverseSecondary"
                size="lg"
              >
                Browse ingredients
              </Button>
            </div>
          </div>

          <WholesaleStats />
        </div>
      </Section.Container>
    </Section.Root>
  )
}
