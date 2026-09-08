import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import type {
  HeroImage,
  CollectionRichHeroAction,
} from '@/lib/shopify/collection-content'
import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'
import { cn } from '@/lib/utils'

type HeroProps = {
  title: string
  collectionTitle: string
  collectionPath: string
  category?: string
  intro: string
  image: HeroImage | null
  actions?: CollectionRichHeroAction[]
  footnote?: string | null
}

export function Hero({
  title,
  collectionTitle,
  collectionPath,
  category,
  intro,
  image,
  actions = [],
  footnote,
}: HeroProps) {
  return (
    <Section.Root
      tone="transparent"
      spacing="none"
      className="pt-6"
      data-testid="collection-hero"
    >
      <Section.Container>
        <nav
          aria-label="Breadcrumb"
          className="text-ink-soft mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
        >
          <Link
            href="/"
            className="focus-visible:ring-ring hover:text-brand rounded focus-visible:ring-2 focus-visible:outline-none"
          >
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href="/collections"
            className="focus-visible:ring-ring hover:text-brand rounded focus-visible:ring-2 focus-visible:outline-none"
          >
            Collections
          </Link>
          <span aria-hidden="true">/</span>
          {category ? (
            <>
              <Link
                href={collectionPath}
                className="focus-visible:ring-ring hover:text-brand rounded focus-visible:ring-2 focus-visible:outline-none"
              >
                {collectionTitle}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span aria-current="page" className="text-brand wrap-break-word">
            {category || collectionTitle}
          </span>
        </nav>
        <div
          className={cn(
            'bg-paper grid overflow-hidden md:min-h-120 lg:min-h-132',
            image && 'lg:grid-cols-2',
          )}
        >
          <div className="flex min-w-0 flex-col justify-center px-6 py-10 sm:px-8 md:py-14 lg:px-12 lg:py-16">
            <h1 className="font-display text-brand-deep max-w-[24ch] text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.12] font-medium text-balance wrap-break-word">
              {title}
            </h1>
            {category ? (
              <p className="text-brand mt-3 text-lg font-medium">{category}</p>
            ) : null}
            {intro ? (
              <p className="text-ink-soft mt-6 max-w-[60ch] text-base leading-relaxed wrap-break-word md:text-lg">
                {intro}
              </p>
            ) : null}
          </div>
          {image ? (
            <div className="relative aspect-3/2 w-full self-center">
              <Image
                src={getSizedShopifyImageUrl(image.url, 1600)}
                alt={image.altText ?? ''}
                fill
                sizes="(min-width: 1480px) 668px, (min-width: 1024px) 45vw, 90vw"
                className={cn(
                  'object-cover',
                  image.position === 'right'
                    ? 'object-right'
                    : image.position === 'left'
                      ? 'object-left'
                      : 'object-center',
                  image.width &&
                    image.height &&
                    image.height > image.width &&
                    'object-contain object-center',
                )}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          ) : null}
        </div>
        {actions.length ? (
          <div className="mt-5 flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <Button
                key={action.href}
                href={action.href}
                variant={index === 0 ? 'primary' : 'secondary'}
                size="wrap"
                className="max-w-full min-w-0"
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
        {footnote ? (
          <p className="text-ink-soft mt-3 text-sm">{footnote}</p>
        ) : null}
      </Section.Container>
    </Section.Root>
  )
}
