import Image from 'next/image'

import { Section } from '@/components/ui/section'

import { TOP_PRODUCTS } from '../_lib/data'

export function TopProductsSection() {
  return (
    <Section.Root tone="sunken">
      <Section.Container>
        <Section.Intro
          align="left"
          title="Top 20 Private Label Products"
          variant="compact"
          className="mb-10 max-w-none"
        />
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {TOP_PRODUCTS.map((product) => (
            <div
              key={product.name}
              className="border-hairline bg-paper overflow-hidden rounded-xl border"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.src}
                  alt={product.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="type-body-sm text-ink leading-snug font-semibold">
                  {product.name}
                </p>
                {product.tag ? (
                  <p className="type-mono-meta text-ink-soft mt-1">
                    {product.tag}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Section.Container>
    </Section.Root>
  )
}
