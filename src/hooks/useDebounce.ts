'use client'

import { useState, useEffect } from 'react'

export function useDebounce<T>(valor: T, delay: number): T {
  const [debouncado, setDebouncado] = useState(valor)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncado(valor), delay)
    return () => clearTimeout(timer)
  }, [valor, delay])

  return debouncado
}
