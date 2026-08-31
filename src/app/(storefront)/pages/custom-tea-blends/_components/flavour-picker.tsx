'use client'

import { ArrowRight, Search, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Section } from '@/components/ui/section'
import {
  CUSTOM_TEA_BLEND_FLAVOUR_GROUPS,
  CUSTOM_TEA_BLEND_FORM_ID,
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
              team. The choices below will be attached to your custom blend
              brief.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="#need-help" variant="secondary">
                Continue to Brief
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="border-hairline-2 bg-card rounded-lg border p-4 sm:p-5">
            <label htmlFor="flavour-search" className="type-label text-ink">
              Search Flavours
            </label>
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
                name="flavourSearch"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Example: Peach, Vanilla, Ginger…"
                className="type-body text-ink placeholder:text-ink-faint min-w-0 flex-1 border-0 bg-transparent outline-none"
              />
            </div>

            <div className="mt-4" aria-live="polite">
              {selectedFlavours.map((flavour) => (
                <input
                  key={flavour}
                  form={CUSTOM_TEA_BLEND_FORM_ID}
                  type="hidden"
                  name="flavours"
                  value={flavour}
                />
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
                <div key={group.name} className="min-w-0">
                  <p className="type-label text-ink">{group.name}</p>
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
                </div>
              ))}
            </div>

            {flavourGroups.length === 0 ? (
              <p className="type-body-sm text-ink-soft mt-5">
                No matching flavours. Try another flavour note.
              </p>
            ) : null}
            <p className="type-body-sm text-ink-soft mt-5">
              Choose up to {CUSTOM_TEA_BLEND_LIMITS.maxFlavours} flavours.
            </p>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
