import { Leaf } from 'lucide-react'

import { Card } from '@/components/ui/card'

export function EmptyState() {
  return (
    <Card className="px-6 py-12 text-center">
      <Leaf aria-hidden="true" className="text-ink-faint mx-auto mb-4 size-8" />
      <h2 className="font-display text-ink text-[1.5rem] leading-[1.1]">
        No articles found
      </h2>
      <p className="type-body-sm text-ink-soft mx-auto mt-3 max-w-lg">
        Try a different search term or browse all Tea Journal articles.
      </p>
    </Card>
  )
}
