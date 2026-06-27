'use client'

import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error(error)
    }
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="bg-gray-50">
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <p className="text-lg font-medium text-gray-700">Algo deu errado.</p>
          <p className="text-sm text-gray-500 max-w-md text-center">{error.message}</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
