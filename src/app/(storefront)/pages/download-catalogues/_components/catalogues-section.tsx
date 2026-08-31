import { Section } from '@/components/ui/section'

import { CATALOGUES } from '../_lib/data'
import { CatalogueRow } from './catalogue-row'

export function CataloguesSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container data-catalogues-section>
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="type-heading-03 text-ink">Download catalogues</h2>
          <span className="type-mono-meta text-ink-faint whitespace-nowrap">
            {CATALOGUES.length} PDFs
          </span>
        </div>
        <ul
          aria-label="Catalogue downloads"
          className="border-hairline bg-card mt-8 overflow-hidden rounded-lg border"
        >
          {CATALOGUES.map((catalogue) => (
            <li
              key={catalogue.id}
              className="border-hairline border-t first:border-t-0"
            >
              <CatalogueRow catalogue={catalogue} />
            </li>
          ))}
        </ul>
      </Section.Container>
    </Section.Root>
  )
}
