'use client'

import { useActionState, useState } from 'react'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { FormLabel } from '@/components/ui/form-label'
import { IconButton } from '@/components/ui/icon-button'
import { Textarea } from '@/components/ui/textarea'
import { TextInput } from '@/components/ui/text-input'
import type {
  ProductReviewActionState,
  ProductReviewField,
} from '@/lib/reviews/actions'

type ReviewAction = (
  previousState: ProductReviewActionState,
  formData: FormData,
) => Promise<ProductReviewActionState>

type ReviewFormProps = {
  productTitle: string
  action: ReviewAction
  onCancel: () => void
}

const INITIAL_STATE: ProductReviewActionState = { status: 'idle' }

export function ReviewForm({
  productTitle,
  action,
  onCancel,
}: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE)
  const [rating, setRating] = useState(0)

  if (state.status === 'success') {
    return (
      <div
        className="border-brand/30 bg-brand-tint rounded-md border p-5"
        role="status"
        aria-live="polite"
      >
        <p className="type-label text-brand">Review received</p>
        <p className="type-body text-ink mt-2">
          {state.message ?? 'Thanks for sharing your experience.'}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={onCancel}
        >
          Close
        </Button>
      </div>
    )
  }

  const fieldError = (field: ProductReviewField) => state.fieldErrors?.[field]

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      aria-label={`Write a review for ${productTitle}`}
      className="border-hairline bg-card rounded-md border p-5 md:p-6"
    >
      <div>
        <p className="type-label text-brand">Share your experience</p>
        <p className="type-body-sm text-ink-soft mt-2">
          Reviews should reflect your experience with this product. You do not
          need an order to submit one. Your email stays private.
        </p>
      </div>

      <fieldset className="mt-5">
        <legend className="type-mono-meta text-ink-faint">
          Rating
          <span aria-hidden="true" className="text-danger ml-1">
            *
          </span>
        </legend>
        <div
          id="review-rating"
          className="mt-2 flex min-h-11 items-center gap-1"
          role="group"
          aria-label="Rating"
          aria-describedby={
            fieldError('rating') ? 'review-rating-error' : undefined
          }
        >
          {Array.from({ length: 5 }, (_, index) => {
            const value = index + 1
            const selected = value <= rating

            return (
              <span key={value} className="contents">
                <IconButton
                  type="button"
                  variant="rating"
                  size="sm"
                  aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                  aria-pressed={selected}
                  onClick={() => setRating(value)}
                >
                  <Star
                    className="size-6"
                    aria-hidden="true"
                    fill={selected ? 'currentColor' : 'none'}
                  />
                </IconButton>
                <input
                  type="radio"
                  name="rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only"
                />
              </span>
            )
          })}
        </div>
        {fieldError('rating') ? (
          <p id="review-rating-error" className="type-body-sm text-danger mt-1">
            {fieldError('rating')}
          </p>
        ) : null}
      </fieldset>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor="review-author" required>
            Name
          </FormLabel>
          <TextInput
            id="review-author"
            name="author"
            autoComplete="name"
            maxLength={80}
            required
            aria-invalid={Boolean(fieldError('author'))}
            aria-describedby={
              fieldError('author') ? 'review-author-error' : undefined
            }
            className="mt-2"
          />
          {fieldError('author') ? (
            <p
              id="review-author-error"
              className="type-body-sm text-danger mt-1"
            >
              {fieldError('author')}
            </p>
          ) : null}
        </div>

        <div>
          <FormLabel htmlFor="review-email" required>
            Email (private)
          </FormLabel>
          <TextInput
            id="review-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={
              fieldError('email') ? 'review-email-error' : undefined
            }
            className="mt-2"
          />
          {fieldError('email') ? (
            <p
              id="review-email-error"
              className="type-body-sm text-danger mt-1"
            >
              {fieldError('email')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <FormLabel htmlFor="review-content" required>
          Review
        </FormLabel>
        <Textarea
          id="review-content"
          name="content"
          rows={5}
          minLength={10}
          maxLength={2000}
          required
          placeholder="What did you enjoy about it?"
          aria-invalid={Boolean(fieldError('content'))}
          aria-describedby={
            fieldError('content') ? 'review-content-error' : undefined
          }
          className="mt-2 min-h-32"
        />
        {fieldError('content') ? (
          <p
            id="review-content-error"
            className="type-body-sm text-danger mt-1"
          >
            {fieldError('content')}
          </p>
        ) : null}
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input
          id="review-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.message ? (
        <p
          className="type-body-sm border-danger/30 bg-danger-tint text-danger mt-5 rounded border p-3"
          role="alert"
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}

      <div className="border-hairline mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="quiet" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="brand"
          size="sm"
          isLoading={isPending}
          disabled={isPending}
        >
          {isPending ? 'Submitting…' : 'Submit review'}
        </Button>
      </div>
    </form>
  )
}
