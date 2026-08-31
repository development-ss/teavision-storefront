import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import { withNoindexRobots } from '@/lib/seo/noindex'
import { cn } from '@/lib/utils'

export const metadata: Metadata = withNoindexRobots({
  title: '404 — Page Not Found | Teavision',
  description: "The page you're looking for has moved or never existed.",
})

export default function NotFound() {
  return (
    <Section.Root tone="sunken" spacing="default">
      <Section.Container>
        <div className="flex flex-col items-center gap-8 py-8 text-center">
          {/* Eyebrow + heading + body */}
          <div className="max-w-sm">
            <Eyebrow tone="muted" className="mb-4 justify-center" rule={false}>
              Nothing to steep here
            </Eyebrow>
            <h1 className="type-heading-01 text-ink">
              This page has gone cold
            </h1>
            <p className="type-body text-ink-soft mt-3">
              The page you&rsquo;re looking for has moved, been removed, or
              never existed. Let&rsquo;s find you something worth brewing.
            </p>
          </div>

          {/* Primary action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/" variant="brand">
              Go home
            </Button>
            <Button href="/collections/all" variant="secondary">
              Browse products
            </Button>
            <Button href="/search" variant="ghost">
              Search
            </Button>
          </div>

          {/* Quick collection pill links */}
          <div className="border-hairline w-full max-w-sm border-t pt-6">
            <p className="type-label text-ink-faint mb-3">
              Popular collections
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'Teas', handle: 'teas' },
                { label: 'Herbs & Spices', handle: 'herbs-spices' },
                { label: 'Bulk Bags', handle: 'bulk-bags' },
                { label: 'Matcha', handle: 'matcha' },
                { label: 'Chai', handle: 'chai' },
              ].map(({ label, handle }) => (
                <Link
                  key={handle}
                  href={`/collections/${handle}`}
                  className={cn(
                    'border-hairline bg-card type-label text-ink rounded-full border px-3.5 py-2',
                    'hover:bg-brand hover:text-paper transition-colors',
                    'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
