'use client'

import { useState } from 'react'
import { getTodosDeputados, getBatchDespesas } from '@/app/actions'
import type { DeputadoRanking } from '@/lib/types'
import RankingTable, { type RankingItem } from './RankingTable'
import { anoAtual } from '@/lib/utils'
import { TrendingUp, Loader2 } from 'lucide-react'

const BATCH = 20

export default function GastosRankingLoader() {
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [total, setTotal] = useState(0)
  const [ranking, setRanking] = useState<DeputadoRanking[]>([])
  const [ano, setAno] = useState(anoAtual())
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    setProgresso(0)
    setRanking([])
    setErro(null)

    try {
      const deputados = await getTodosDeputados()
      setTotal(deputados.length)

      const resultados: DeputadoRanking[] = []

      for (let i = 0; i < deputados.length; i += BATCH) {
        const lote = deputados.slice(i, i + BATCH)
        const ids = lote.map((d) => d.id)
        const totais = await getBatchDespesas(ids, ano)
        const com = lote.map((d) => ({ ...d, totalGasto: totais[d.id] ?? 0 }))
        resultados.push(...com)
        setProgresso(Math.min(i + BATCH, deputados.length))
      }

      resultados.sort((a, b) => b.totalGasto - a.totalGasto)
      setRanking(resultados)
    } catch (err) {
      setErro('Erro ao carregar dados. Tente novamente.')
      console.error(err)
    } finally {
      setCarregando(false)
    }
  }

  const anos = Array.from({ length: anoAtual() - 2018 }, (_, i) => anoAtual() - i)

  if (ranking.length > 0) {
    const items: RankingItem[] = ranking.slice(0, 50).map((d, i) => ({
      posicao: i + 1,
      id: d.id,
      nome: d.nome,
      siglaPartido: d.siglaPartido,
      siglaUf: d.siglaUf,
      urlFoto: d.urlFoto,
      valor: d.totalGasto,
      tipo: 'moeda',
    }))
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Top 50 maiores gastos CEAP em <strong>{ano}</strong> — {ranking.length} deputados analisados
          </p>
          <button
            onClick={() => setRanking([])}
            className="text-xs text-blue-600 hover:underline"
          >
            Recarregar
          </button>
        </div>
        <RankingTable items={items} />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      {carregando ? (
        <>
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Carregando dados de {progresso}/{total} deputados...
            </p>
            <p className="text-xs text-gray-400 mt-1">Isso pode levar cerca de 1 minuto</p>
          </div>
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: total ? `${(progresso / total) * 100}%` : '0%' }}
            />
          </div>
        </>
      ) : (
        <>
          <TrendingUp className="w-10 h-10 text-gray-300" />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Ranking de Maiores Gastos CEAP</p>
            <p className="text-xs text-gray-400 mt-1">
              Analisa as despesas dos 513 deputados e ordena por valor total
            </p>
          </div>
          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {erro}
            </p>
          )}
          <div className="flex items-center gap-3">
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {anos.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <button
              onClick={carregar}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Gerar Ranking
            </button>
          </div>
        </>
      )}
    </div>
  )
}
