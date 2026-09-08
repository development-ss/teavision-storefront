import { StoryDisclosure } from '@/components/collection/story-disclosure'
import { sanitizeShopifyCollectionStoryHtml } from '@/lib/shopify/html-content'
import type { Collection } from '@/lib/shopify/types'

import {
  normalizeHtml,
  shouldRenderRichDescription,
} from '../_lib/page-helpers'
type CollectionStoryProps = {
  collection: Collection
}

export function CollectionStory({ collection }: CollectionStoryProps) {
  const body = normalizeHtml(collection.descriptionHtml)
  if (!shouldRenderRichDescription(body)) {
    return null
  }

  const storyHtml = sanitizeShopifyCollectionStoryHtml(body)
  return (
    <div
      className="mt-10"
      role="region"
      aria-label={`About ${collection.title}`}
    >
      <StoryDisclosure
        title={`Read more about ${collection.title}`}
        html={storyHtml}
      />
    </div>
  )
}
