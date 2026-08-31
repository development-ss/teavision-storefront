'use client'

import { Search, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { NPD_FLAVOURS, NPD_ORDER_LIMITS } from '@/lib/contact/npd-order'
import { cn } from '@/lib/utils'

type FlavourSelectProps = {
  name: string
  className?: string
}

function normaliseSearch(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function FlavourSelect({ name, className }: FlavourSelectProps) {
  const [selectedFlavours, setSelectedFlavours] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const query = normaliseSearch(deferredSearch)
  const hasReachedLimit =
    selectedFlavours.length >= NPD_ORDER_LIMITS.maxFlavoursPerBlend

  const flavours = useMemo(() => {
    if (!query) return NPD_FLAVOURS

    return NPD_FLAVOURS.filter((flavour) =>
      normaliseSearch(flavour).includes(query),
    )
  }, [query])

  function toggleFlavour(flavour: string) {
    setSelectedFlavours((currentFlavours) => {
      if (currentFlavours.includes(flavour)) {
        return currentFlavours.filter(
          (currentFlavour) => currentFlavour !== flavour,
        )
      }

      if (currentFlavours.length >= NPD_ORDER_LIMITS.maxFlavoursPerBlend) {
        return currentFlavours
      }

      return [...currentFlavours, flavour]
    })
  }

  return (
    <div
      className={cn(
        'border-hairline-2 bg-card rounded-lg border p-4 sm:p-5',
        className,
      )}
    >
      <label htmlFor={`${name}-search`} className="type-label text-ink">
        Select up to {NPD_ORDER_LIMITS.maxFlavoursPerBlend} flavours
      </label>
      <div className="focus-within:ring-ring border-hairline bg-card mt-2 flex min-h-12 items-center gap-3 rounded-sm border px-3 focus-within:ring-2 focus-within:ring-offset-2">
        <Search className="text-ink-faint size-4 shrink-0" aria-hidden="true" />
        <input
          id={`${name}-search`}
          type="search"
          inputMode="search"
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Example: Peach, Vanilla, Ginger…"
          className="type-body text-ink placeholder:text-ink-faint min-w-0 flex-1 border-0 bg-transparent outline-none"
        />
      </div>

      <div className="mt-4" aria-live="polite">
        {selectedFlavours.map((flavour) => (
          <input key={flavour} type="hidden" name={name} value={flavour} />
        ))}

        {selectedFlavours.length > 0 ? (
          <ul className="flex flex-wrap gap-2" role="list">
            {selectedFlavours.map((flavour) => (
              <li key={flavour}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleFlavour(flavour)}
                  aria-label={`Remove ${flavour}`}
                >
                  <span className="capitalize">
                    {flavour.toLocaleLowerCase()}
                  </span>
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body-sm text-ink-soft">
            No flavours selected yet.
          </p>
        )}
      </div>

      <div className="mt-4 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
        {flavours.map((flavour) => {
          const isSelected = selectedFlavours.includes(flavour)
          const isDisabled = hasReachedLimit && !isSelected

          return (
            <label
              key={flavour}
              className={cn(
                'type-body-sm border-hairline bg-card flex min-h-11 items-center gap-3 rounded-sm border px-3 transition-colors',
                'hover:bg-paper-2',
                isSelected && 'border-brand bg-brand-tint',
                isDisabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <Checkbox
                value={flavour}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => toggleFlavour(flavour)}
              />
              <span className="min-w-0 capitalize">
                {flavour.toLocaleLowerCase()}
              </span>
            </label>
          )
        })}
      </div>

      {flavours.length === 0 ? (
        <p className="type-body-sm text-ink-soft mt-4">
          No matching flavours. Try another flavour note.
        </p>
      ) : null}
      <p className="type-body-sm text-ink-soft mt-4">
        Choose up to {NPD_ORDER_LIMITS.maxFlavoursPerBlend} flavours.
      </p>
    </div>
  )
}
