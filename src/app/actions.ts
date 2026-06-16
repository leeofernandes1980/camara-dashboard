'use server'

import {
  fetchTodosDeputados,
  fetchDespesasTotalDeputado,
  fetchDeputados,
  fetchDespesasDeputado,
} from '@/lib/api'
import type { Deputado, Despesa } from '@/lib/types'

export async function getTodosDeputados(): Promise<Deputado[]> {
  return fetchTodosDeputados()
}

export async function getBatchDespesas(
  ids: number[],
  ano: number
): Promise<Record<number, number>> {
  const pairs = await Promise.all(
    ids.map(async (id) => {
      const total = await fetchDespesasTotalDeputado(id, ano)
      return [id, total] as const
    })
  )
  return Object.fromEntries(pairs)
}

export async function buscarDeputados(nome: string): Promise<Deputado[]> {
  if (!nome || nome.length < 2) return []
  try {
    const res = await fetchDeputados({ nome, itens: 20 })
    return res.dados
  } catch {
    return []
  }
}

export async function getCeapResumo(
  id: number,
  ano: number
): Promise<{
  total: number
  porMes: Array<{ mes: number; label: string; total: number }>
  porCategoria: Array<{ categoria: string; total: number }>
}> {
  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  let pagina = 1
  const todasDespesas: Despesa[] = []

  while (true) {
    const res = await fetchDespesasDeputado(id, { ano, itens: 100, pagina })
    todasDespesas.push(...res.dados)
    if (!res.links.some((l) => l.rel === 'next')) break
    pagina++
  }

  const total = todasDespesas.reduce((acc, d) => acc + (d.valorLiquido || 0), 0)

  const mesMapa: Record<number, number> = {}
  for (const d of todasDespesas) {
    const m = d.mes
    if (m >= 1 && m <= 12) mesMapa[m] = (mesMapa[m] || 0) + (d.valorLiquido || 0)
  }

  const porMes = Array.from({ length: 12 }, (_, i) => ({
    mes: i + 1,
    label: MESES[i],
    total: mesMapa[i + 1] || 0,
  }))

  const catMapa: Record<string, number> = {}
  for (const d of todasDespesas) {
    catMapa[d.tipoDespesa] = (catMapa[d.tipoDespesa] || 0) + (d.valorLiquido || 0)
  }
  const porCategoria = Object.entries(catMapa)
    .map(([categoria, tot]) => ({ categoria, total: tot }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  return { total, porMes, porCategoria }
}
