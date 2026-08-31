import { Section } from '@/components/ui/section'
import { RichText } from '@/components/ui/rich-text'
import { sanitizeShopifyPageBodyHtml } from '@/lib/shopify/html-content'
import type { ShopifyPage } from '@/lib/shopify/operations/storefront-page'

export function Body({ page }: { page: ShopifyPage }) {
  const bodyHtml = sanitizeShopifyPageBodyHtml(page.body)

  return (
    <Section.Root tone="surface">
      <Section.Container variant="compact">
        <RichText html={bodyHtml} variant="page" />
      </Section.Container>
    </Section.Root>
  )
}
