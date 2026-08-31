import { Card } from '@/components/ui/card'

import type { CapabilityCard } from '../_lib/data'
import { BlendImage } from './blend-image'

export function BlendDetailCard({ card }: { card: CapabilityCard }) {
  return (
    <Card as="article" overflow="hidden" className="h-full">
      <div className="aspect-4/3">
        <BlendImage
          image={card.image}
          sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="p-5">
        <h3 className="type-heading-05 text-ink">{card.title}</h3>
        <p className="type-body-sm text-ink-soft mt-3">{card.description}</p>
      </div>
    </Card>
  )
}
