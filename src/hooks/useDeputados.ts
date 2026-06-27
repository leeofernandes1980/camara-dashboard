'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchDeputados } from '@/lib/api'
import type { Deputado } from '@/lib/types'

interface FiltrosDeputados {
  siglaUF?: string
  siglaPartido?: string
  nome?: string
  pagina?: number
}

export function useDeputados(filtros: FiltrosDeputados = {}) {
  const [deputados, setDeputados] = useState<Deputado[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [temProxima, setTemProxima] = useState(false)

  // Chave estável (comparação por valor) usada como dependência no lugar do objeto filtros.
  const filtrosKey = JSON.stringify(filtros)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const data = await fetchDeputados({ ...filtros, itens: 100 })
      setDeputados(data.dados)
      setTemProxima(data.links.some((l) => l.rel === 'next'))
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [filtrosKey])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { deputados, carregando, erro, temProxima, recarregar: carregar }
}
