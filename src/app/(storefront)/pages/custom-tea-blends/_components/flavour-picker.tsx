'use client'

import { ArrowRight, Search, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Section } from '@/components/ui/section'
import {
  CUSTOM_TEA_BLEND_FLAVOUR_GROUPS,
  CUSTOM_TEA_BLEND_LIMITS,
} from '@/lib/contact/custom-tea-blend'
import { cn } from '@/lib/utils'

function normaliseSearch(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function FlavourPicker() {
  const [selectedFlavours, setSelectedFlavours] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const query = normaliseSearch(deferredSearch)
  const hasReachedLimit =
    selectedFlavours.length >= CUSTOM_TEA_BLEND_LIMITS.maxFlavours
  const briefHref = useMemo(() => {
    if (selectedFlavours.length === 0) return '/pages/contact#need-help'

    const params = new URLSearchParams()
    params.set('flavours', selectedFlavours.join(','))

    return `/pages/contact?${params.toString()}#need-help`
  }, [selectedFlavours])

  const flavourGroups = useMemo(() => {
    if (!query) return CUSTOM_TEA_BLEND_FLAVOUR_GROUPS

    return CUSTOM_TEA_BLEND_FLAVOUR_GROUPS.map((group) => ({
      ...group,
      options: group.options.filter((flavour) =>
        normaliseSearch(flavour).includes(query),
      ),
    })).filter((group) => group.options.length > 0)
  }, [query])

  function toggleFlavour(flavour: string) {
    setSelectedFlavours((currentFlavours) => {
      if (currentFlavours.includes(flavour)) {
        return currentFlavours.filter(
          (currentFlavour) => currentFlavour !== flavour,
        )
      }

      if (currentFlavours.length >= CUSTOM_TEA_BLEND_LIMITS.maxFlavours) {
        return currentFlavours
      }

      return [...currentFlavours, flavour]
    })
  }

  return (
    <Section.Root tone="sunken" className="border-hairline border-b">
      <Section.Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
          <div className="min-w-0">
            <p className="type-eyebrow text-brand before:h-px before:w-5.5 before:bg-current before:opacity-60">
              Flavour direction
            </p>
            <h2 className="type-heading-02 text-ink mt-3 text-balance">
              Choose Your Flavours
            </h2>
            <p className="type-lede text-ink-soft mt-4 max-w-prose">
              Select one or more starting points for the product development
              team. Continue to the contact brief when you&rsquo;re ready to
              share the direction.
            </p>
            <div className="mt-6">
              <h3 className="type-label text-ink">How it works</h3>
              <ol className="type-body-sm text-ink-soft mt-3 list-decimal space-y-2 pl-5">
                <li>Tick your flavour notes.</li>
                <li>Continue to the brief.</li>
                <li>Our team picks it up from there.</li>
              </ol>
            </div>
          </div>

          <div className="border-hairline-2 bg-card rounded-lg border p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <label htmlFor="flavour-search" className="type-label text-ink">
                Search Flavours
              </label>
              <p className="type-body-sm text-ink-soft tabular-nums">
                {selectedFlavours.length} /{' '}
                {CUSTOM_TEA_BLEND_LIMITS.maxFlavours} selected
              </p>
            </div>
            <div className="focus-within:ring-ring border-hairline bg-card mt-2 flex min-h-12 items-center gap-3 rounded-sm border px-3 focus-within:ring-2 focus-within:ring-offset-2">
              <Search
                className="text-ink-faint size-4 shrink-0"
                aria-hidden="true"
              />
              <input
                id="flavour-search"
                type="search"
                inputMode="search"
                autoComplete="off"
                aria-describedby="flavour-limit-hint"
                name="flavourSearch"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Example: Peach, Vanilla, Ginger…"
                className="type-body text-ink placeholder:text-ink-faint min-w-0 flex-1 border-0 bg-transparent outline-none"
              />
            </div>
            <p
              id="flavour-limit-hint"
              className="type-body-sm text-ink-soft mt-2"
            >
              Tick up to {CUSTOM_TEA_BLEND_LIMITS.maxFlavours} flavours.
            </p>

            <div className="mt-4" aria-live="polite">
              {hasReachedLimit ? (
                <p className="type-body-sm text-brand mb-3 font-medium">
                  Maximum of {CUSTOM_TEA_BLEND_LIMITS.maxFlavours} flavours
                  reached. Remove one to add another.
                </p>
              ) : null}
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
                        <span>{flavour}</span>
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

            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {flavourGroups.map((group) => (
                <fieldset key={group.name} className="min-w-0">
                  <legend className="type-label text-ink">{group.name}</legend>
                  <div className="mt-3 grid gap-2">
                    {group.options.map((flavour) => {
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
                          <span className="min-w-0">{flavour}</span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>

            {flavourGroups.length === 0 ? (
              <p className="type-body-sm text-ink-soft mt-5">
                No matching flavours. Try another flavour note.
              </p>
            ) : null}
            <div className="border-hairline mt-6 border-t pt-5">
              <p id="flavour-brief-hint" className="type-body-sm text-ink-soft">
                {selectedFlavours.length === 0
                  ? 'Tick flavours above to share your direction with our team, or continue without them.'
                  : `${selectedFlavours.length} ${selectedFlavours.length === 1 ? 'flavour' : 'flavours'} ready to include in your brief.`}
              </p>
              <Button
                href={briefHref}
                variant={selectedFlavours.length > 0 ? 'primary' : 'secondary'}
                aria-describedby="flavour-brief-hint"
                className="mt-3 w-full sm:w-auto"
              >
                {selectedFlavours.length === 0
                  ? 'Continue without flavours'
                  : `Continue to Brief (${selectedFlavours.length})`}
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
