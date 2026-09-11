import { notFound } from 'next/navigation'

import { ProductDetails } from '@/components/product/product-details'
import { Button } from '@/components/ui/button'
import { getProductPreview } from '@/lib/shopify/operations/product-preview'
import { getProductPreviewSession } from '@/lib/shopify/preview-session'

type PreviewViewProps = {
  params: Promise<{ productId: string }>
}

export async function ProductPreviewView({ params }: PreviewViewProps) {
  const { productId } = await params
  const session = await getProductPreviewSession()
  if (!session || session.productId !== productId) notFound()

  const preview = await getProductPreview(productId)
  if (!preview) notFound()

  return (
    <main className="max-w-wide px-gutter mx-auto w-full py-6 md:py-10">
      <aside
        aria-label="Product preview status"
        className="border-brand/30 bg-brand-tint text-ink mb-6 flex flex-col gap-3 rounded-sm border p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm" role="status">
          Previewing the {preview.status.toLowerCase()} product version. Changes
          are not available for purchase.
        </p>
        <Button
          href="/api/shopify-preview/disable"
          reloadDocument
          variant="secondary"
          size="sm"
        >
          Exit preview
        </Button>
      </aside>

      <ProductDetails
        product={preview.product}
        mode="preview"
        reviewSummary={preview.product}
      />
    </main>
  )
}

export function ProductPreviewFallback() {
  return (
    <main className="max-w-wide px-gutter mx-auto w-full py-10">
      <p className="text-ink-soft" role="status">
        Loading product preview…
      </p>
    </main>
  )
}
