import type { ReactNode } from 'react'
import { connection } from 'next/server'

import { getHulkVolumeDiscountTiers } from '@/lib/shopify/operations/hulk-volume-discounts'
import type { Product } from '@/lib/shopify/types'

import { PurchaseForm } from './purchase-form'

type DynamicPurchaseFormProps = {
  product: Product
  descriptionSlot?: ReactNode
  className?: string
}

export async function DynamicPurchaseForm({
  product,
  descriptionSlot,
  className,
}: DynamicPurchaseFormProps) {
  await connection()

  const volumeDiscountTiers = await getHulkVolumeDiscountTiers({
    productId: product.id,
    variantIds: product.variants.map((variant) => variant.id),
    collectionIds: product.collectionIds ?? [],
    tags: product.tags,
  })

  return (
    <PurchaseForm
      variants={product.variants}
      options={product.options}
      volumeDiscountTiers={volumeDiscountTiers}
      descriptionSlot={descriptionSlot}
      className={className}
    />
  )
}
