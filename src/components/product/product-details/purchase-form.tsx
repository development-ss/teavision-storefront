'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { ProductForm } from '@/components/product/product-form'
import type {
  ProductOption,
  ProductVariant,
  VolumeDiscountTier,
} from '@/lib/shopify/types'

type PurchaseFormProps = {
  variants: ProductVariant[]
  options: ProductOption[]
  volumeDiscountTiers?: readonly VolumeDiscountTier[]
  descriptionSlot?: ReactNode
  className?: string
}

export function PurchaseForm({
  variants,
  options,
  volumeDiscountTiers,
  descriptionSlot,
  className,
}: PurchaseFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialVariantId = searchParams.get('variant') ?? undefined

  function handleVariantChange(variantId: string) {
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.set(
      'variant',
      variantId.replace('gid://shopify/ProductVariant/', ''),
    )
    router.replace(`${pathname}?${nextSearchParams.toString()}`, {
      scroll: false,
    })
  }

  return (
    <ProductForm
      variants={variants}
      options={options}
      volumeDiscountTiers={volumeDiscountTiers}
      initialVariantId={initialVariantId}
      onVariantChange={handleVariantChange}
      descriptionSlot={descriptionSlot}
      className={className}
    />
  )
}
