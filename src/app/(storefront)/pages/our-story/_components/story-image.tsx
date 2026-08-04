import Image from 'next/image'

import { cn } from '@/lib/utils'

import type { ImageAsset } from '../_lib/data'

type StoryImageProps = {
  className?: string
  image: ImageAsset
  loading?: 'eager' | 'lazy'
  sizes: string
}

export function StoryImage({
  className,
  image,
  loading,
  sizes,
}: StoryImageProps) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading={loading}
      sizes={sizes}
      className={cn('size-full object-cover', className)}
    />
  )
}
