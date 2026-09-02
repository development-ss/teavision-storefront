import { Check } from 'lucide-react'

type TrustSignalListProps = {
  layout: 'inline' | 'stacked'
}

const TRUST_SIGNALS = [
  '1,000+ businesses served',
  'ACO Organic certified',
  'HACCP certified',
  'Ethically & Sustainably Sourced',
]

export function TrustSignalList({ layout }: TrustSignalListProps) {
  if (layout === 'inline') {
    return (
      <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {TRUST_SIGNALS.map((signal) => (
          <span
            key={signal}
            className="type-caption text-ink-faint inline-flex items-center gap-1.5"
          >
            <Check
              className="text-brand size-3.5 shrink-0"
              aria-hidden="true"
            />
            {signal}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="border-hairline mt-4 space-y-2.5 border-t pt-4">
      {TRUST_SIGNALS.map((signal) => (
        <div key={signal} className="flex items-start gap-2">
          <Check
            className="text-brand mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="type-caption text-ink-soft">{signal}</span>
        </div>
      ))}
    </div>
  )
}
