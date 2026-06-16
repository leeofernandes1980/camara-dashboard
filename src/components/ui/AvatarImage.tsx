'use client'

import Image from 'next/image'
import { useState } from 'react'

interface AvatarImageProps {
  src: string
  alt: string
  size: number
  className?: string
}

export default function AvatarImage({ src, alt, size, className }: AvatarImageProps) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=1e3a5f&color=fff&size=${size}`
  const [imgSrc, setImgSrc] = useState(src || fallback)

  return (
    <Image
      src={imgSrc}
      alt={alt ?? ''}
      fill
      className={className ?? 'object-cover'}
      onError={() => setImgSrc(fallback)}
      unoptimized
    />
  )
}
