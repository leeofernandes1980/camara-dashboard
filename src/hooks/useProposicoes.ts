'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchProposicoes } from '@/lib/api'
import type { Proposicao } from '@/lib/types'

interface FiltrosProposicoes {
  siglaTipo?: string
  numero?: number
  ano?: number
  autor?: string
  keywords?: string
  pagina?: number
}

export function useProposicoes(filtros: FiltrosProposicoes = {}) {
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [temProxima, setTemProxima] = useState(false)

  // Chave estável (comparação por valor) usada como dependência no lugar do objeto filtros.
  const filtrosKey = JSON.stringify(filtros)

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const data = await fetchProposicoes({
        ...filtros,
        itens: 20,
        ordem: 'DESC',
        ordenarPor: 'ano',
      })
      setProposicoes(data.dados)
      setTemProxima(data.links.some((l) => l.rel === 'next'))
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [filtrosKey])

  useEffect(() => { carregar() }, [carregar])

  return { proposicoes, carregando, erro, temProxima, recarregar: carregar }
}
