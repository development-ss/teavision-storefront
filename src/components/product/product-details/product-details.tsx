import { Suspense } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Globe2, Tags } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Eyebrow } from '@/components/ui/eyebrow'
import { RichText } from '@/components/ui/rich-text'
import { StarRating } from '@/components/ui/star-rating'
import { sanitizeShopifyCompactHtml } from '@/lib/shopify/html-content'
import type { Product } from '@/lib/shopify/types'

import { ProductForm } from '../product-form'
import { ProductGallery } from '../product-gallery'
export type ProductDetailsMode = 'live' | 'preview'

export type ProductDetailsProps = {
  product: Product
  mode?: ProductDetailsMode
  reviewSummary?: {
    rating?: number
    reviewCount?: number
  }
  livePurchaseForm?: (args: {
    descriptionSlot: ReactNode
    className: string
  }) => ReactNode
}

export function formatTag(tag: string): string | null {
  if (tag.includes('Package_')) return null
  if (tag.includes('_')) return tag.replace('filter_', '').replace('_', ': ')
  return tag
}

function getCategoryLabel(tag: string): string | null {
  const formattedTag = formatTag(tag)
  if (!formattedTag) return null

  const categoryMatch = /^categories:\s*(.+)$/i.exec(formattedTag)
  return categoryMatch?.[1]?.trim() || null
}

function toTagPathSegment(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function getMetaSegments(tags: string[], optionName?: string): string[] {
  const categoryLabels = tags
    .map(getCategoryLabel)
    .filter((tag): tag is string => tag !== null)
  const fallbackLabels = tags
    .map(formatTag)
    .filter((tag): tag is string => tag !== null)
    .filter((tag) => !/^categories:\s*/i.test(tag))
    .filter((tag) => !/award|organic|certified/i.test(tag))
  const groupLabels =
    categoryLabels.length > 0 ? categoryLabels : fallbackLabels

  return [groupLabels[0], optionName, groupLabels[1]]
    .filter((segment): segment is string => Boolean(segment))
    .slice(0, 3)
}

function getDisplayRating(rating: number | undefined): number {
  return typeof rating === 'number' &&
    Number.isFinite(rating) &&
    rating > 0 &&
    rating <= 5
    ? rating
    : 0
}

function getDisplayReviewCount(reviewCount: number | undefined): number {
  return typeof reviewCount === 'number' &&
    Number.isInteger(reviewCount) &&
    reviewCount > 0
    ? reviewCount
    : 0
}

export function ProductDetails({
  product,
  mode = 'live',
  reviewSummary,
  livePurchaseForm,
}: ProductDetailsProps) {
  const descriptionHtml = sanitizeShopifyCompactHtml(product.descriptionHtml)
  const displayRating = getDisplayRating(reviewSummary?.rating)
  const displayReviewCount = getDisplayReviewCount(reviewSummary?.reviewCount)
  const visibleTags = product.tags.flatMap((tag) => {
    const label = formatTag(tag)
    return label ? [{ tag, label }] : []
  })
  const metaSegments = getMetaSegments(product.tags, product.options[0]?.name)
  const ratingContent = (
    <>
      <StarRating rating={displayRating} size="lg" />
      <span className="type-mono-meta text-ink-faint">
        {displayReviewCount === 0
          ? '0 Reviews'
          : `${displayRating.toFixed(1)} · ${displayReviewCount.toLocaleString()} ${
              displayReviewCount === 1 ? 'review' : 'reviews'
            }`}
      </span>
    </>
  )
  const descriptionSlotNode = descriptionHtml ? (
    <RichText
      html={descriptionHtml}
      variant="compact"
      className="text-ink-soft max-w-prose text-[1.02rem]"
    />
  ) : null

  return (
    <div className="grid min-w-0 items-start gap-[clamp(28px,4vw,64px)] pt-2 lg:grid-cols-[1.05fr_1fr]">
      <div className="min-w-0">
        <ProductGallery images={product.images} title={product.title} />
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-3.5">
          {metaSegments.length > 0 ? (
            <Eyebrow className="items-center">
              <Globe2 aria-hidden="true" className="size-3.5" />
              {metaSegments.join(' · ')}
            </Eyebrow>
          ) : null}
          <h1 className="font-display text-ink text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.04] font-medium">
            {product.title}
          </h1>
          {mode === 'live' ? (
            <a
              href="#reviews"
              className="focus-visible:ring-ring flex w-fit flex-wrap items-center gap-2.5 rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {ratingContent}
            </a>
          ) : (
            <div className="flex w-fit flex-wrap items-center gap-2.5">
              {ratingContent}
            </div>
          )}
        </div>

        <Suspense
          fallback={
            <ProductForm
              variants={product.variants}
              options={product.options}
              descriptionSlot={descriptionSlotNode}
              purchasingDisabled={mode === 'preview'}
              className="mt-6.5"
            />
          }
        >
          {mode === 'preview' ? (
            <ProductForm
              variants={product.variants}
              options={product.options}
              descriptionSlot={descriptionSlotNode}
              purchasingDisabled
              className="mt-6.5"
            />
          ) : livePurchaseForm ? (
            livePurchaseForm({
              descriptionSlot: descriptionSlotNode,
              className: 'mt-6.5',
            })
          ) : (
            <ProductForm
              variants={product.variants}
              options={product.options}
              descriptionSlot={descriptionSlotNode}
              className="mt-6.5"
            />
          )}
        </Suspense>

        {visibleTags.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-ink inline-flex items-center gap-1.5 text-sm font-semibold">
              <Tags className="size-4" aria-hidden />
              Tags :
            </span>
            {visibleTags.map(({ tag, label }) => (
              <Link
                key={tag}
                href={`/collections/all/${toTagPathSegment(tag)}`}
              >
                <Badge
                  variant="certification"
                  label={label}
                  className="hover:border-ink-soft/40 hover:text-ink transition-colors"
                />
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
