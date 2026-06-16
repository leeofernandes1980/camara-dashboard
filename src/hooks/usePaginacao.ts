'use client'

import { useState } from 'react'

export function usePaginacao(inicial = 1) {
  const [pagina, setPagina] = useState(inicial)
  const [temProxima, setTemProxima] = useState(false)

  function proximaPagina() {
    setPagina((p) => p + 1)
  }

  function paginaAnterior() {
    setPagina((p) => Math.max(1, p - 1))
  }

  function resetar() {
    setPagina(1)
  }

  return { pagina, temProxima, setTemProxima, proximaPagina, paginaAnterior, resetar }
}
