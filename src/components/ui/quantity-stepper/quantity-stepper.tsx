'use client'

import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { IconButton } from '../icon-button'

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  onLimitReached?: (maximum: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** Marks the stepper buttons busy (e.g. while an optimistic cart update is in flight). */
  busy?: boolean
  label?: string
  id?: string
  name?: string
  describedBy?: string
  className?: string
  /** Shape variant. "pill" (default) keeps rounded-full corners. "rectangle" uses 4px radius for the PDP buy row. */
  shape?: 'pill' | 'rectangle'
}

function getSafeStep(step: number): number {
  return Math.max(1, Math.trunc(step))
}

function clampQuantity(
  value: number,
  min: number,
  max: number | undefined,
  step: number,
): number {
  if (max !== undefined && max < min) return min

  const safeValue = Number.isFinite(value) ? Math.trunc(value) : min
  const lowerBounded = Math.max(min, safeValue)
  const upperBounded =
    max === undefined ? lowerBounded : Math.min(max, lowerBounded)

  return min + Math.floor((upperBounded - min) / step) * step
}

export function QuantityStepper({
  value,
  onChange,
  onLimitReached,
  min = 1,
  max,
  step = 1,
  disabled = false,
  busy = false,
  label = 'Quantity',
  id,
  name,
  describedBy,
  className,
  shape = 'pill',
}: QuantityStepperProps) {
  const quantityStep = getSafeStep(step)
  const quantity = clampQuantity(value, min, max, quantityStep)
  const canDecrease = quantity > min && !disabled
  const canIncrease =
    max === undefined ? !disabled : quantity + quantityStep <= max && !disabled

  // Draft holds the raw text while the input is being edited so direct entry
  // works when min/step > 1 — clamping only happens on blur or Enter.
  const [draft, setDraft] = useState<string | null>(null)

  function updateQuantity(nextValue: number) {
    onChange(clampQuantity(nextValue, min, max, quantityStep))
    if (max !== undefined && nextValue > max) onLimitReached?.(max)
  }

  function commitDraft() {
    if (draft === null) return
    const parsed = Number.parseInt(draft, 10)
    updateQuantity(Number.isNaN(parsed) ? quantity : parsed)
    setDraft(null)
  }

  const isRectangle = shape === 'rectangle'
  const labelText = label.toLowerCase()

  return (
    <>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div
        className={cn(
          'border-hairline inline-flex border',
          isRectangle
            ? 'items-stretch rounded-sm'
            : 'items-center rounded-full',
          className,
        )}
      >
        <IconButton
          aria-label={`Decrease ${labelText}`}
          title={`Decrease ${labelText}`}
          aria-busy={busy || undefined}
          disabled={!canDecrease}
          onClick={() => updateQuantity(quantity - quantityStep)}
          variant="ghost"
          className={cn(
            'rounded-none',
            isRectangle
              ? 'h-auto w-11.5 rounded-l-sm'
              : 'size-11 rounded-l-full',
          )}
        >
          <Minus className="size-3.5" aria-hidden="true" />
        </IconButton>
        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={quantityStep}
          value={draft ?? quantity}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitDraft()
          }}
          disabled={disabled}
          className="w-7 min-w-7 grow [appearance:textfield] bg-transparent text-center font-mono text-[13px] tabular-nums focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={label}
          aria-describedby={describedBy}
        />
        <IconButton
          aria-label={`Increase ${labelText}`}
          title={`Increase ${labelText}`}
          aria-busy={busy || undefined}
          disabled={!canIncrease}
          onClick={() => updateQuantity(quantity + quantityStep)}
          variant="ghost"
          className={cn(
            'rounded-none',
            isRectangle
              ? 'h-auto w-11.5 rounded-r-sm'
              : 'size-11 rounded-r-full',
          )}
        >
          <Plus className="size-3.5" aria-hidden="true" />
        </IconButton>
      </div>
    </>
  )
}
