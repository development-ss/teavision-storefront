import { StoryDisclosure } from '@/components/collection/story-disclosure'
import { sanitizeShopifyCollectionStoryHtml } from '@/lib/shopify/html-content'
import type { Collection } from '@/lib/shopify/types'

import {
  normalizeHtml,
  parseCollectionRichHero,
  shouldRenderRichDescription,
} from '../_lib/page-helpers'
type CollectionStoryProps = {
  collection: Collection
}

export function CollectionStory({ collection }: CollectionStoryProps) {
  if (
    parseCollectionRichHero(collection.descriptionHtml) ||
    !shouldRenderRichDescription(
      collection.descriptionHtml,
      collection.description,
    )
  ) {
    return null
  }

  const storyHtml = sanitizeShopifyCollectionStoryHtml(
    normalizeHtml(collection.descriptionHtml),
  )
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
