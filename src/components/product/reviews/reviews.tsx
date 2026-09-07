'use client'

import { useState, useTransition } from 'react'

import type { ProductReviewsPage } from '@/lib/reviews/trustoo'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { StarRating } from '@/components/ui/star-rating'

type ReviewsProps = {
  handle: string
  initialPage: ProductReviewsPage | null
  loadPageAction: (
    handle: string,
    page: number,
  ) => Promise<ProductReviewsPage | null>
}

const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function Reviews({ handle, initialPage, loadPageAction }: ReviewsProps) {
  const [data, setData] = useState(initialPage)
  const [failed, setFailed] = useState(initialPage === null)
  const [pending, startTransition] = useTransition()

  function loadMore() {
    startTransition(async () => {
      try {
        const next = await loadPageAction(handle, data ? data.page + 1 : 1)
        if (!next) {
          setFailed(true)
          return
        }
        setData((current) => ({
          ...next,
          reviews: [
            ...(current?.reviews ?? []),
            ...next.reviews.filter(
              (review) =>
                !current?.reviews.some((existing) => existing.id === review.id),
            ),
          ],
        }))
        setFailed(false)
      } catch {
        setFailed(true)
      }
    })
  }

  return (
    <Section.Root
      id="reviews"
      aria-labelledby="reviews-heading"
      tone="transparent"
      spacing="none"
      className="border-hairline mt-12 scroll-mt-40 border-t pt-10 md:mt-16"
    >
      <h2
        id="reviews-heading"
        className="font-display text-ink text-3xl font-medium"
      >
        Reviews
      </h2>
      {data && data.reviews.length > 0 ? (
        <ul className="divide-hairline mt-6 divide-y">
          {data.reviews.map((review) => (
            <li
              key={review.id}
              className="grid gap-4 py-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-8"
            >
              <div className="flex flex-col items-start gap-2">
                <StarRating rating={review.rating} />
                <p className="text-ink font-medium wrap-break-word">
                  {review.author}
                </p>
                {review.date ? (
                  <time
                    dateTime={review.date}
                    className="text-ink-soft text-sm"
                  >
                    {dateFormatter.format(new Date(review.date))}
                  </time>
                ) : null}
              </div>
              <div className="text-ink-soft max-w-prose space-y-3 leading-relaxed wrap-break-word">
                {review.title ? (
                  <h3 className="text-ink font-semibold">{review.title}</h3>
                ) : null}
                <p className="whitespace-pre-line">
                  {review.content ||
                    'This customer left a rating without a written review.'}
                </p>
                {review.reply ? (
                  <div className="bg-paper-2 rounded-md p-4">
                    <p className="text-ink mb-1 font-medium">
                      Reply from Teavision
                    </p>
                    <p className="whitespace-pre-line">{review.reply}</p>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : data ? (
        <p className="text-ink-soft mt-4">No customer reviews yet.</p>
      ) : null}
      <div
        role="status"
        aria-live="polite"
        className="text-ink-soft mt-4 text-sm"
      >
        {failed
          ? 'Reviews could not be loaded. Please try again.'
          : data && data.totalCount > 0
            ? `Showing ${data.reviews.length} of ${data.totalCount} reviews`
            : null}
      </div>
      {failed || (data && data.page < data.totalPages) ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={pending}
          onClick={loadMore}
        >
          {pending
            ? 'Loading reviews…'
            : failed
              ? 'Try again'
              : 'Load more reviews'}
        </Button>
      ) : null}
    </Section.Root>
  )
}
