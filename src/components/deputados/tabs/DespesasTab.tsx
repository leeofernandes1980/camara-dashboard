'use client'

import { useState, useEffect } from 'react'
import { fetchDespesasDeputado } from '@/lib/api'
import { formatarMoeda, anoAtual } from '@/lib/utils'
import GastosChart from '@/components/cota/GastosChart'
import GastosTable from '@/components/cota/GastosTable'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import type { Despesa } from '@/lib/types'

function agruparPorCategoria(despesas: Despesa[]) {
  const mapa: Record<string, number> = {}
  for (const d of despesas) {
    mapa[d.tipoDespesa] = (mapa[d.tipoDespesa] || 0) + d.valorLiquido
  }
  return Object.entries(mapa)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
}

interface DespesasTabProps {
  deputadoId: number
  ano: number
  onAnoChange: (ano: number) => void
  pagina: number
  onPaginaChange: (pagina: number) => void
}

export default function DespesasTab({ deputadoId, ano, onAnoChange, pagina, onPaginaChange }: DespesasTabProps) {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [temProxima, setTemProxima] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    fetchDespesasDeputado(deputadoId, { ano, itens: 50, pagina })
      .then((r) => {
        setDespesas(r.dados)
        setTemProxima(r.links.some((l) => l.rel === 'next'))
      })
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [deputadoId, ano, pagina, tentativa])

  if (carregando) return <LoadingSpinner />
  if (erro) return <ErrorMessage mensagem={erro} onRetry={() => setTentativa((t) => t + 1)} />

  const totalGasto = despesas.reduce((acc, d) => acc + d.valorLiquido, 0)
  const gastosCategoria = agruparPorCategoria(despesas)
  const anos = Array.from({ length: anoAtual() - 2018 }, (_, i) => anoAtual() - i)

  const topFornecedores = Object.entries(
    despesas.reduce((acc, d) => {
      const key = d.nomeFornecedor || 'Sem nome'
      acc[key] = (acc[key] || 0) + d.valorLiquido
      return acc
    }, {} as Record<string, number>)
  ).sort(([, a], [, b]) => b - a).slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">Total de despesas em {ano}</p>
          <p className="text-2xl font-bold text-blue-700">{formatarMoeda(totalGasto)}</p>
        </div>
        <select
          value={ano}
          onChange={(e) => { onAnoChange(Number(e.target.value)); onPaginaChange(1) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {anos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      {gastosCategoria.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-gray-600">Por categoria</h3>
          <GastosChart dados={gastosCategoria} />
        </>
      )}
      {topFornecedores.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Top 5 fornecedores</h3>
          <div className="space-y-1.5 mb-3">
            {topFornecedores.map(([nome, valor]) => (
              <div key={nome} className="flex items-center gap-2">
                <span className="text-xs text-gray-700 flex-1 truncate" title={nome}>{nome}</span>
                <span className="text-xs font-medium text-blue-700 whitespace-nowrap">{formatarMoeda(valor)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <GastosTable despesas={despesas} />
      <Pagination
        paginaAtual={pagina}
        temProxima={temProxima}
        onAnterior={() => onPaginaChange(Math.max(1, pagina - 1))}
        onProxima={() => onPaginaChange(pagina + 1)}
      />
    </div>
  )
}
