import { StoryDisclosure } from '@/components/collection'
import { Section } from '@/components/ui'
import { sanitizeShopifyCollectionStoryHtml } from '@/lib/shopify/html-content'
import { getCollection } from '@/lib/shopify/operations/collection'

import {
  normalizeHtml,
  parseCollectionRichHero,
  shouldRenderRichDescription,
} from '../_lib/page-helpers'
import type { RouteParams } from '../_lib/page-types'

type CollectionStoryProps = {
  params: Promise<RouteParams>
}

export async function CollectionStory({ params }: CollectionStoryProps) {
  const { handle } = await params
  const collection = await getCollection(handle)

  if (
    !collection ||
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
    <Section.Root
      aria-label={`About ${collection.title}`}
      tone="transparent"
      spacing="compact"
    >
      <Section.Container>
        <StoryDisclosure
          title={`Read more about ${collection.title}`}
          html={storyHtml}
        />
      </Section.Container>
    </Section.Root>
  )
}
