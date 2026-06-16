'use client'

import { useState, useEffect } from 'react'
import { fetchPartidos } from '@/lib/api'
import type { PartidoItem } from '@/lib/types'

export function usePartidos() {
  const [partidos, setPartidos] = useState<PartidoItem[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    fetchPartidos({ itens: 100 })
      .then((r) => setPartidos(r.dados))
      .catch((err) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  return { partidos, carregando, erro }
}
