import { Suspense } from 'react'
import type { Metadata } from 'next'

import { withNoindexRobots } from '@/lib/seo/noindex'
import {
  CUSTOM_TEA_BLEND_LIMITS,
  isCustomTeaBlendFlavour,
} from '@/lib/contact/custom-tea-blend'

import { JsonLd } from './_components/json-ld'
import { PageContent } from './_components/page-content'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function getInitialBlendMessage(
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const flavours = firstSearchParam(searchParams.flavours)
    .split(',')
    .map((flavour) => flavour.trim())
    .filter(isCustomTeaBlendFlavour)
    .slice(0, CUSTOM_TEA_BLEND_LIMITS.maxFlavours)

  if (flavours.length === 0) return ''

  return `Custom blend flavour direction: ${flavours.join(', ')}\n\n`
}

export const metadata: Metadata = withNoindexRobots({
  title: { absolute: 'Contact' },
  description:
    'Contact Teavision for wholesale tea, custom blending, private label, samples, and supply enquiries across Australia.',
  openGraph: {
    title: 'Contact',
    description:
      'Contact Teavision for wholesale tea, custom blending, private label, samples, and supply enquiries.',
    url: '/pages/contact',
  },
  alternates: { canonical: '/pages/contact' },
})

async function ContactPageContent({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams

  return (
    <>
      <JsonLd />
      <PageContent
        initialMessage={getInitialBlendMessage(resolvedSearchParams)}
      />
    </>
  )
}

export default function Page({ searchParams }: Props) {
  return (
    <Suspense fallback={<PageContent />}>
      <ContactPageContent searchParams={searchParams} />
    </Suspense>
  )
}
