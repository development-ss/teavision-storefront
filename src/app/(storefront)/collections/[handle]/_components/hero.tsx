import Image from 'next/image'
import Link from 'next/link'

import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'
import { getSizedShopifyImageUrl } from '@/lib/shopify/image-url'
import { cn } from '@/lib/utils'

import { type HeroImage } from '../_lib/page-helpers'

type HeroProps = {
  collectionTitle: string
  heroDescription: string
  heroImage: HeroImage | null
  bannerImage: HeroImage | null
}

export function Hero({
  collectionTitle,
  heroDescription,
  heroImage,
  bannerImage,
}: HeroProps) {
  // Banner mode (owner option C): banner art first, then crawlable hierarchy.
  if (bannerImage) {
    return (
      <>
        {bannerImage.width && bannerImage.height ? (
          <Section.Root tone="transparent" spacing="none">
            <Section.Container className="pt-6">
              <div className="overflow-hidden">
                <Image
                  src={getSizedShopifyImageUrl(bannerImage.url, 1440)}
                  alt={bannerImage.altText ?? collectionTitle}
                  width={bannerImage.width}
                  height={bannerImage.height}
                  sizes="(min-width: 1480px) 1480px, 100vw"
                  className="w-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </Section.Container>
          </Section.Root>
        ) : null}

        <Section.Root tone="transparent" spacing="none">
          <Section.Container>
            <nav
              aria-label="Breadcrumb"
              className="type-mono-meta text-ink-faint flex flex-wrap items-center gap-2 pt-5.5"
            >
              <Link
                href="/"
                className="focus-visible:ring-ring hover:text-brand rounded focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
              >
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/collections/all"
                className="focus-visible:ring-ring hover:text-brand rounded focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
              >
                Collections
              </Link>
              <span aria-hidden="true">/</span>
              <h1
                aria-current="page"
                className="type-mono-meta text-gold-deep m-0 inline"
              >
                {collectionTitle}
              </h1>
            </nav>
          </Section.Container>
        </Section.Root>
      </>
    )
  }

  // Default mode: contained green brand band with an unobscured collection image.
  return (
    <Section.Root tone="transparent" spacing="none" className="pt-6">
      <Section.Container>
        <div className="bg-brand-deep text-paper relative overflow-hidden py-[clamp(40px,5vw,70px)]">
          {heroImage?.width && heroImage.height ? (
            <>
              <div className="absolute inset-0 z-0">
                <Image
                  src={getSizedShopifyImageUrl(heroImage.url, 1440)}
                  alt=""
                  fill
                  sizes="(min-width: 1480px) 1336px, 90vw"
                  className="object-cover"
                  aria-hidden="true"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div
                aria-hidden="true"
                className="collection-hero-scrim absolute inset-0 z-1"
              />
            </>
          ) : null}

          <div className="px-gutter relative z-10">
            <nav
              aria-label="Breadcrumb"
              className="type-mono-meta text-paper/60 mb-6 flex flex-wrap items-center gap-2"
            >
              <Link
                href="/"
                className="focus-visible:ring-ring hover:text-paper/90 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href="/collections/all"
                className="focus-visible:ring-ring hover:text-paper/90 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Collections
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-gold">
                {collectionTitle}
              </span>
            </nav>

            <div className="max-w-[52ch]">
              <Eyebrow tone="gold">Wholesale collection</Eyebrow>

              <h1
                className={cn(
                  'font-display text-paper mt-4 text-balance',
                  'text-[clamp(2.4rem,5vw,4rem)] leading-[1.04]',
                )}
              >
                {collectionTitle}
              </h1>

              {heroDescription && (
                <p className="text-paper/85 mt-4 max-w-[52ch] text-[1.02rem]">
                  {heroDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
