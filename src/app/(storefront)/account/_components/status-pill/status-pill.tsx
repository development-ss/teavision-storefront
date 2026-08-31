import { Badge } from '@/components/ui/badge'

type StatusPillProps = {
  label: string
  tone?: 'gold' | 'neutral' | 'organic'
}

export function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  if (tone === 'gold') return <Badge variant="gold" label={label} />
  if (tone === 'organic') return <Badge variant="organic" label={label} />

  return (
    <span className="type-mono-meta bg-paper-2 text-ink-soft border-hairline inline-flex rounded-full border px-3 py-1.5">
      {label}
    </span>
  )
}
