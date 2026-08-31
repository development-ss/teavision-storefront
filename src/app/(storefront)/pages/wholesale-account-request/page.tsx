import type { Metadata } from 'next'
import Link from 'next/link'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import {
  WHOLESALE_ACCOUNT_DESCRIPTION,
  WHOLESALE_ACCOUNT_META_TITLE,
  WHOLESALE_ACCOUNT_PAGE_PATH,
  WHOLESALE_ACCOUNT_PAGE_TITLE,
} from '@/lib/contact/wholesale-account'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { WholesaleAccountForm } from './_components/form'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: WHOLESALE_ACCOUNT_META_TITLE },
  description: WHOLESALE_ACCOUNT_DESCRIPTION,
  openGraph: {
    title: WHOLESALE_ACCOUNT_META_TITLE,
    description: WHOLESALE_ACCOUNT_DESCRIPTION,
    url: WHOLESALE_ACCOUNT_PAGE_PATH,
    type: 'website',
  },
  alternates: { canonical: WHOLESALE_ACCOUNT_PAGE_PATH },
})

export default function Page() {
  return (
    <>
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
              <li>
                <Link
                  href="/pages/wholesale"
                  className="hover:text-paper focus-visible:ring-ring rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Wholesale
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gold" aria-current="page">
                Account request
              </li>
            </ol>
          </nav>

          <Eyebrow tone="gold">100kg+ bulk orders</Eyebrow>
          <h1 className="type-display text-paper mt-5 max-w-[18ch] text-balance">
            {WHOLESALE_ACCOUNT_PAGE_TITLE}
          </h1>
          <p className="type-lede text-paper/85 mt-6 max-w-[52ch]">
            This form is for customers purchasing in bulk 100kg+ orders. Tell us
            what you need and when you plan to start, and the Teavision team
            will review your account request.
          </p>
        </Section.Container>
      </Section.Root>

      <Section.Root tone="sunken">
        <Section.Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.68fr)_minmax(18rem,0.32fr)] lg:items-start">
            <WholesaleAccountForm />

            <aside className="border-hairline bg-card rounded-lg border p-5 sm:p-7 lg:sticky lg:top-32">
              <p className="type-mono-meta text-brand">Before you submit</p>
              <h2 className="type-heading-04 text-ink mt-4">
                Useful details speed up account review.
              </h2>
              <ul
                className="type-body-sm text-ink-soft mt-5 grid gap-3"
                role="list"
              >
                <li>List each product or range you expect to order.</li>
                <li>Estimate annual kilogram volume as closely as you can.</li>
                <li>Include launch timing or first order timing.</li>
                <li>Use a business email if available.</li>
              </ul>
            </aside>
          </div>
        </Section.Container>
      </Section.Root>
    </>
  )
}
