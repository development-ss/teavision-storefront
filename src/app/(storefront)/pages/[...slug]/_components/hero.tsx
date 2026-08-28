import { Eyebrow, Section } from '@/components/ui'
import { cn } from '@/lib/utils'
import { getPagePath } from '@/lib/shopify/operations/storefront-page'
import type { ShopifyPage } from '@/lib/shopify/operations/storefront-page'

import type { PageProfile } from '../_lib/page-profile'
import { Actions } from './actions'
import { Breadcrumb } from './breadcrumb'

export function Hero({
  compact = false,
  description,
  page,
  profile,
  showActions = true,
  showKicker = true,
  titleClassName,
}: {
  compact?: boolean
  description?: string
  page: ShopifyPage
  profile: PageProfile
  showActions?: boolean
  showKicker?: boolean
  titleClassName?: string
}) {
  return (
    <Section.Root tone="brand" spacing={compact ? 'compact' : 'default'}>
      <Section.Container>
        <Breadcrumb title={page.title} />

        <div className="grid gap-8 lg:grid-cols-3 lg:items-end">
          <div className="min-w-0 lg:col-span-2">
            {showKicker ? (
              <Eyebrow tone="gold">{profile.kicker}</Eyebrow>
            ) : null}
            <h1
              className={cn(
                'type-display text-paper max-w-[16ch] text-balance',
                showKicker && 'mt-5',
                titleClassName,
              )}
            >
              {page.title}
            </h1>
            {description ? (
              <p className="type-lede text-paper/85 mt-6 max-w-[54ch] wrap-break-word">
                {description}
              </p>
            ) : null}
            {showActions ? (
              <Actions
                currentPath={getPagePath(page.handle)}
                profile={profile}
              />
            ) : null}
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
