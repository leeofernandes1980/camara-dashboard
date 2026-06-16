'use client'

import { useState } from 'react'

interface PartidoLogoProps {
  src: string
  sigla: string
  className?: string
}

export default function PartidoLogo({ src, sigla, className }: PartidoLogoProps) {
  const [erro, setErro] = useState(false)

  if (!src || erro) {
    return (
      <div className={`bg-blue-100 rounded-lg flex items-center justify-center ${className ?? 'w-10 h-10'}`}>
        <span className="text-blue-700 font-bold text-xs">{sigla.slice(0, 2)}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={sigla}
      className={className ?? 'w-10 h-10 object-contain'}
      onError={() => setErro(true)}
    />
  )
}
