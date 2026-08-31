import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'

import type { CollectionRichHero as CollectionRichHeroData } from '../_lib/page-helpers'

type CollectionRichHeroProps = {
  richHero: CollectionRichHeroData
}

export function CollectionRichHero({ richHero }: CollectionRichHeroProps) {
  return (
    <Section.Root
      tone="surface"
      spacing="none"
      className="border-hairline border-b py-10 md:py-12"
      data-testid="collection-rich-hero"
    >
      <Section.Container>
        <div className="mx-auto max-w-280 text-center">
          <h1 className="font-display text-brand-deep text-[clamp(2.2rem,5vw,3.9rem)] leading-[1.08] font-black text-balance">
            {richHero.title}
          </h1>

          <div
            className="text-ink mt-4 text-[1.04rem] leading-[1.6] [&_strong]:font-bold"
            dangerouslySetInnerHTML={{ __html: richHero.introHtml }}
          />

          <div className="mt-8 overflow-hidden rounded-lg">
            <Image
              src={getSizedShopifyImageUrl(richHero.image.url, 1440)}
              alt={richHero.image.altText ?? richHero.title}
              width={richHero.image.width ?? 1600}
              height={richHero.image.height ?? 577}
              sizes="(min-width: 1180px) 1120px, calc(100vw - 32px)"
              className="h-auto max-h-90 w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {richHero.actions.map((action, index) => (
              <Button
                key={action.href}
                href={action.href}
                variant={index === 0 ? 'primary' : 'brand'}
                className="w-full sm:w-auto"
              >
                {action.label}
              </Button>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button href={richHero.highlightAction.href} variant="secondary">
              {richHero.highlightAction.label}
            </Button>
          </div>

          {richHero.footnote ? (
            <p className="type-mono-meta text-ink-faint mt-3">
              {richHero.footnote}
            </p>
          ) : null}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
