import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { BlogLoadingSkeleton } from '@/components/blog/loading-skeleton'
import { DEFAULT_BLOG_HANDLE, normalizeBlogHandle } from '@/lib/blog/operations'

import { HeroSlot } from '../_components/hero-slot'
import { generateSearchMetadata } from '../_lib/metadata'
import { SearchResults } from './_components/results'

type Props = {
  params: Promise<{ blog: string }>
  searchParams: Promise<{ q?: string }>
}

export function generateStaticParams() {
  return [{ blog: DEFAULT_BLOG_HANDLE }]
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams
  return generateSearchMetadata(q)
}

// The hero is static (prerendered shell); only the query-driven results stream.
// This page is noindex, so a brief loading state here is acceptable.
export default async function BlogSearchPage({ params, searchParams }: Props) {
  const { blog } = await params
  // Guard the handle before streaming so unknown blogs return a real 404
  // status (notFound() inside the Suspense below can't reset headers).
  if (normalizeBlogHandle(blog) !== DEFAULT_BLOG_HANDLE) notFound()

  return (
    <>
      <HeroSlot />
      <Suspense fallback={<BlogLoadingSkeleton articleCount={6} />}>
        <SearchResults blog={blog} searchParams={searchParams} />
      </Suspense>
    </>
  )
}
