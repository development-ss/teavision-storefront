import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Section } from '@/components/ui/section'

import { YOUR_BRAND_IMAGE_SRC, YOUR_BRAND_LIST_ITEMS } from '../_lib/data'

export function YourBrandSection() {
  return (
    <Section.Root tone="surface">
      <Section.Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Text 2/3 */}
          <div>
            <Eyebrow>Private Label • White Label • OEM</Eyebrow>
            <h2 className="type-heading-01 text-ink mt-4 text-balance">
              Your Brand, <span className="text-brand">Our Product</span>
            </h2>
            <p className="type-lede text-ink-soft mt-4 max-w-[52ch]">
              We formulate, blend, fill and pack{' '}
              <strong>our premium ingredients</strong> under{' '}
              <strong>your brand</strong>. You get retail-ready products
              fast&mdash;without owning a factory.
            </p>
            <ul className="mt-6 space-y-2">
              {YOUR_BRAND_LIST_ITEMS.map((item) => (
                <li
                  key={item}
                  className="type-body text-ink-soft flex items-start gap-2"
                >
                  <span className="text-brand mt-1 shrink-0" aria-hidden="true">
                    &#10003;
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                href="mailto:info@teavision.com.au?subject=Private%20Label%20Enquiry"
                variant="brand"
                size="lg"
              >
                Start Private Label
              </Button>
              <Button href="#need-help" variant="secondary" size="lg">
                Get a Quote
              </Button>
            </div>
          </div>

          {/* Image 1/3 */}
          <div className="relative aspect-video overflow-hidden rounded-xl">
            <Image
              src={YOUR_BRAND_IMAGE_SRC}
              alt="Your Brand Our Product mockup"
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section.Container>
    </Section.Root>
  )
}
