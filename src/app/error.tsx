'use client'

import { useEffect } from 'react'
import ErrorMessage from '@/components/ui/ErrorMessage'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <ErrorMessage
      mensagem={error.message || 'Algo deu errado ao carregar esta página.'}
      onRetry={reset}
    />
  )
}
