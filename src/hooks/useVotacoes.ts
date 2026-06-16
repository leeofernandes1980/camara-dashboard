'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchVotacoes } from '@/lib/api'
import type { Votacao } from '@/lib/types'

interface FiltrosVotacoes {
  dataInicio?: string
  dataFim?: string
  idOrgao?: number
  aprovacao?: number
  pagina?: number
}

export function useVotacoes(filtros: FiltrosVotacoes = {}) {
  const [votacoes, setVotacoes] = useState<Votacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [temProxima, setTemProxima] = useState(false)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const data = await fetchVotacoes({ ...filtros, itens: 20 })
      setVotacoes(data.dados)
      setTemProxima(data.links.some((l) => l.rel === 'next'))
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [JSON.stringify(filtros)])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { votacoes, carregando, erro, temProxima, recarregar: carregar }
}
