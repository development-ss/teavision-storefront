import { Card } from '@/components/ui/card'

import type { QualityCard } from '../_lib/data'

export function QualityFeatureCard({ card }: { card: QualityCard }) {
  return (
    <Card as="article" padding="md" radius="lg" className="h-full">
      <h3 className="type-heading-05 text-ink">{card.title}</h3>
      <p className="type-body-sm text-ink-soft mt-3">{card.description}</p>
    </Card>
  )
}
