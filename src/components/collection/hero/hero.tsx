import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
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
            'bg-paper grid overflow-hidden',
            image && 'md:grid-cols-2',
          )}
        >
          <div className="flex min-w-0 flex-col justify-center px-6 py-8 sm:px-8 md:py-10 lg:px-12">
            <Eyebrow>Wholesale collection</Eyebrow>
            <h1 className="font-display text-brand-deep mt-4 max-w-[24ch] text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.12] font-medium text-balance wrap-break-word">
              {title}
            </h1>
            {category ? (
              <p className="text-brand mt-3 text-lg font-medium">{category}</p>
            ) : null}
            {intro ? (
              <p className="text-ink-soft mt-5 max-w-[60ch] text-base leading-relaxed">
                {intro}
              </p>
            ) : null}
          </div>
          {image ? (
            <div className="relative min-h-56 md:min-h-80">
              <Image
                src={getSizedShopifyImageUrl(image.url, 1600)}
                alt={image.altText ?? ''}
                fill
                sizes="(min-width: 1480px) 668px, (min-width: 768px) 45vw, 90vw"
                className="object-cover"
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
