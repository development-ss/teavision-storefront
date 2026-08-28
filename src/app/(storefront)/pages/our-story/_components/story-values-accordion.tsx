'use client'

import { useId, useState } from 'react'

import { DisclosureButton } from '@/components/ui'

import type { StoryValue } from '../_lib/data'
import { StoryImage } from './story-image'

type StoryValuesAccordionProps = {
  values: StoryValue[]
}

export function StoryValuesAccordion({ values }: StoryValuesAccordionProps) {
  const accordionId = useId()
  const [openValueId, setOpenValueId] = useState('')

  if (values.length === 0) {
    return null
  }

  return (
    <div className="divide-hairline divide-y">
      {values.map((value) => {
        const isOpen = openValueId === value.id
        const panelId = `${accordionId}-${value.id}-panel`
        const buttonId = `${accordionId}-${value.id}-button`

        return (
          <div key={value.id} className="bg-card">
            <h3>
              <DisclosureButton
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() =>
                  setOpenValueId((currentId) =>
                    currentId === value.id ? '' : value.id,
                  )
                }
                className="group text-ink min-h-14 w-full justify-between rounded-none px-4 py-3 text-left"
              >
                <span>{value.title}</span>
                <span
                  aria-hidden="true"
                  className="border-brand size-2 shrink-0 rotate-45 border-r border-b transition-transform group-aria-expanded:rotate-225"
                />
              </DisclosureButton>
            </h3>

            {/* Stacked panel layout per original site: copy first, wide image below */}
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="flex flex-col gap-5 px-4 pb-5 md:pb-6"
            >
              <p className="type-body text-ink-soft max-w-prose">
                {value.description}
              </p>
              <div className="aspect-8/3 overflow-hidden rounded-md">
                <StoryImage
                  image={value.image}
                  loading="eager"
                  sizes="(min-width: 1480px) 1400px, 100vw"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
