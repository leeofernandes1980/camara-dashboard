export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { fetchTodosDeputados, fetchProposicoes, fetchVotacoes } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import GastosRankingLoader from '@/components/rankings/GastosRankingLoader'
import RankingTable, { type RankingItem } from '@/components/rankings/RankingTable'
import DistribuicaoPartidosChart from '@/components/analise/DistribuicaoPartidosChart'
import { data30DiasAtrasISO, dataHojeISO } from '@/lib/utils'
import type { EstatisticaPartido } from '@/lib/types'
import { Trophy, TrendingUp, FileText, Vote, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

async function RankingsContent() {
  const [resDeputados, resProposicoes, resVotacoes] = await Promise.allSettled([
    fetchTodosDeputados(),
    fetchProposicoes({ itens: 100, ordem: 'DESC', ordenarPor: 'ano' }),
    fetchVotacoes({ dataInicio: data30DiasAtrasISO(), dataFim: dataHojeISO(), itens: 100 }),
  ])

  const deputados = resDeputados.status === 'fulfilled' ? resDeputados.value : []
  const proposicoes = resProposicoes.status === 'fulfilled' ? resProposicoes.value.dados : []
  const votacoes = resVotacoes.status === 'fulfilled' ? resVotacoes.value.dados : []

  // ── Ranking de Partidos por Bancada ─────────────────────
  const bancadaMapa: Record<string, { total: number; ufs: Set<string>; nome: string }> = {}
  for (const d of deputados) {
    if (!bancadaMapa[d.siglaPartido]) bancadaMapa[d.siglaPartido] = { total: 0, ufs: new Set(), nome: d.siglaPartido }
    bancadaMapa[d.siglaPartido].total++
    bancadaMapa[d.siglaPartido].ufs.add(d.siglaUf)
  }
  const estatisticasPartido: EstatisticaPartido[] = Object.entries(bancadaMapa).map(([sigla, v]) => ({
    sigla,
    nome: v.nome,
    totalDeputados: v.total,
    ufs: Array.from(v.ufs),
  })).sort((a, b) => b.totalDeputados - a.totalDeputados)

  // ── Ranking de UFs por representação ────────────────────
  const ufMapa: Record<string, { total: number; partidos: Set<string> }> = {}
  for (const d of deputados) {
    if (!ufMapa[d.siglaUf]) ufMapa[d.siglaUf] = { total: 0, partidos: new Set() }
    ufMapa[d.siglaUf].total++
    ufMapa[d.siglaUf].partidos.add(d.siglaPartido)
  }
  const rankingUF: RankingItem[] = Object.entries(ufMapa)
    .sort(([, a], [, b]) => b.total - a.total)
    .slice(0, 27)
    .map(([uf, v], i) => {
      const dep = deputados.find((d) => d.siglaUf === uf)
      return {
        posicao: i + 1,
        id: dep?.id ?? i,
        nome: uf,
        siglaPartido: `${v.partidos.size} partidos`,
        siglaUf: uf,
        urlFoto: '',
        valor: v.total,
        tipo: 'numero' as const,
      }
    })

  // ── Aprovação em Votações (30 dias) ─────────────────────
  const aprovadas = votacoes.filter((v) => v.aprovacao === 1).length
  const rejeitadas = votacoes.filter((v) => v.aprovacao === 0).length

  // ── Votações mais disputadas ─────────────────────────────
  const disputadas = votacoes
    .filter(v => (v.votosSim ?? 0) > 0 || (v.votosNao ?? 0) > 0)
    .map(v => ({ ...v, margem: Math.abs((v.votosSim ?? 0) - (v.votosNao ?? 0)) }))
    .sort((a, b) => a.margem - b.margem)
    .slice(0, 10)

  // ── Proposições por tipo ─────────────────────────────────
  const tipoMapa: Record<string, number> = {}
  for (const p of proposicoes) {
    tipoMapa[p.siglaTipo] = (tipoMapa[p.siglaTipo] || 0) + 1
  }
  const tipoRanking = Object.entries(tipoMapa).sort(([, a], [, b]) => b - a).slice(0, 8)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Rankings & Análises</h1>
        <p className="text-gray-500 mt-1">
          Comparativos, classificações e estatísticas da legislatura atual
        </p>
      </div>

      {/* Cards rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{estatisticasPartido[0]?.sigla ?? '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Maior bancada</p>
          <p className="text-sm text-blue-600 font-medium">{estatisticasPartido[0]?.totalDeputados} dep.</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <FileText className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-800">{proposicoes.length}</p>
          <p className="text-xs text-gray-500 mt-1">Proposições recentes</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <Vote className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{aprovadas}</p>
          <p className="text-xs text-gray-500 mt-1">Aprovadas (30 dias)</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-600">{rejeitadas}</p>
          <p className="text-xs text-gray-500 mt-1">Rejeitadas (30 dias)</p>
        </div>
      </div>

      {/* Gastos CEAP — loader dinâmico */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Ranking de Gastos CEAP</h2>
        </div>
        <GastosRankingLoader />
      </div>

      {/* Ranking bancadas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Ranking de Bancadas</h2>
        </div>
        <DistribuicaoPartidosChart dados={estatisticasPartido} limite={20} />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase w-10">#</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Partido</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Deputados</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase">% Câmara</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Estados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estatisticasPartido.map((p, i) => (
                <tr key={p.sigla} className="even:bg-gray-50 hover:bg-blue-50/30">
                  <td className="px-3 py-2.5 text-center text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-4 py-2.5 font-semibold text-gray-800">{p.sigla}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-blue-700">{p.totalDeputados}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">
                    {((p.totalDeputados / deputados.length) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500">{p.ufs.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ranking por UF */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-800">Ranking por Estado (UF)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase w-10">#</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Deputados</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase">% Câmara</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Partidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(ufMapa)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([uf, v], i) => (
                  <tr key={uf} className="even:bg-gray-50 hover:bg-blue-50/30">
                    <td className="px-3 py-2.5 text-center text-gray-500 font-medium">{i + 1}</td>
                    <td className="px-4 py-2.5 font-semibold text-gray-800">{uf}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-green-700">{v.total}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">
                      {((v.total / deputados.length) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{v.partidos.size}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Votações mais disputadas */}
      {disputadas.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Votações Mais Disputadas (últimos 30 dias)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">Votação</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Sim</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Não</th>
                  <th className="text-center px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputadas.map((v) => (
                  <tr key={v.id} className="even:bg-gray-50 hover:bg-orange-50/30">
                    <td className="px-4 py-2.5">
                      <Link href={`/votacoes/${v.id}`} className="text-blue-700 hover:underline text-xs font-medium">
                        {(v.descricao ?? v.proposicaoObjeto ?? 'Sem descrição').slice(0, 70)}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold text-green-700">{v.votosSim ?? 0}</td>
                    <td className="px-3 py-2.5 text-center font-semibold text-red-700">{v.votosNao ?? 0}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                        {v.margem}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proposições por tipo */}
      {tipoRanking.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Proposições por Tipo (recentes)</h2>
          </div>
          <div className="space-y-2.5">
            {tipoRanking.map(([tipo, count]) => (
              <div key={tipo} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800 w-24">{tipo}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${(count / (tipoRanking[0]?.[1] ?? 1)) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RankingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RankingsContent />
    </Suspense>
  )
}
