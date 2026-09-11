import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ProductPreviewFallback, ProductPreviewView } from './_components/view'

export const metadata: Metadata = {
  title: 'Product preview',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
}

type Props = {
  params: Promise<{ productId: string }>
}

export default function ProductPreviewPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductPreviewFallback />}>
      <ProductPreviewView params={params} />
    </Suspense>
  )
}
