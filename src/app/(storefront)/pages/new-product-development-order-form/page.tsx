import type { Metadata } from 'next'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import {
  NPD_ORDER_DESCRIPTION,
  NPD_ORDER_META_TITLE,
  NPD_ORDER_PAGE_PATH,
  NPD_ORDER_PAGE_TITLE,
} from '@/lib/contact/npd-order'
import { withNoindexRobots } from '@/lib/seo/noindex'

import { NpdOrderForm } from './_components/npd-order-form'

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: NPD_ORDER_META_TITLE },
  description: NPD_ORDER_DESCRIPTION,
  openGraph: {
    title: 'New Product Development Order Form | Teavision',
    description: NPD_ORDER_DESCRIPTION,
    url: NPD_ORDER_PAGE_PATH,
    type: 'website',
  },
  alternates: { canonical: NPD_ORDER_PAGE_PATH },
})

export default function Page() {
  return (
    <>
      <Section.Root tone="brand">
        <Section.Container>
          <Eyebrow tone="gold">New product development</Eyebrow>
          <h1 className="type-display text-paper mt-5 max-w-[24ch] text-balance">
            {NPD_ORDER_PAGE_TITLE}
          </h1>
          <p className="type-lede text-paper/85 mt-6 max-w-[54ch]">
            Tell us about your blend idea and packaging preferences. We&rsquo;ll
            confirm details and next steps.
          </p>
        </Section.Container>
      </Section.Root>

      <Section.Root tone="sunken">
        <Section.Container variant="base">
          <NpdOrderForm />
        </Section.Container>
      </Section.Root>
    </>
  )
}
