'use client'

import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

import { ProductForm } from '@/components/product/product-form'
import type { ProductOption, ProductVariant } from '@/lib/shopify/types'

type PurchaseFormProps = {
  variants: ProductVariant[]
  options: ProductOption[]
  descriptionSlot?: ReactNode
  className?: string
}

export function PurchaseForm({
  variants,
  options,
  descriptionSlot,
  className,
}: PurchaseFormProps) {
  const initialVariantId = useSearchParams().get('variant') ?? undefined

  return (
    <ProductForm
      variants={variants}
      options={options}
      initialVariantId={initialVariantId}
      descriptionSlot={descriptionSlot}
      className={className}
    />
  )
}
