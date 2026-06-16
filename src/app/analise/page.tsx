export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { fetchTodosDeputados, fetchTodosDeputadosFiltrados } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DistribuicaoPartidosChart from '@/components/analise/DistribuicaoPartidosChart'
import DistribuicaoEstadosChart from '@/components/analise/DistribuicaoEstadosChart'
import type { EstatisticaPartido, EstatisticaEstado } from '@/lib/types'
import { Users, MapPin, Building2, BarChart3 } from 'lucide-react'

const REGIOES: Record<string, string> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
}

async function AnaliseContent() {
  const [deputados, mulheres] = await Promise.all([
    fetchTodosDeputados(),
    fetchTodosDeputadosFiltrados({ siglaSexo: 'F' }),
  ])

  // ── Por partido ──────────────────────────────────────────
  const mapaPartido: Record<string, { total: number; ufs: Set<string> }> = {}
  for (const d of deputados) {
    if (!mapaPartido[d.siglaPartido]) mapaPartido[d.siglaPartido] = { total: 0, ufs: new Set() }
    mapaPartido[d.siglaPartido].total++
    mapaPartido[d.siglaPartido].ufs.add(d.siglaUf)
  }
  const estatisticasPartido: EstatisticaPartido[] = Object.entries(mapaPartido)
    .map(([sigla, v]) => ({ sigla, nome: sigla, totalDeputados: v.total, ufs: Array.from(v.ufs) }))
    .sort((a, b) => b.totalDeputados - a.totalDeputados)

  // ── Por estado ───────────────────────────────────────────
  const mapaEstado: Record<string, { total: number; partidos: Set<string> }> = {}
  for (const d of deputados) {
    if (!mapaEstado[d.siglaUf]) mapaEstado[d.siglaUf] = { total: 0, partidos: new Set() }
    mapaEstado[d.siglaUf].total++
    mapaEstado[d.siglaUf].partidos.add(d.siglaPartido)
  }
  const estatisticasEstado: EstatisticaEstado[] = Object.entries(mapaEstado)
    .map(([uf, v]) => ({ uf, totalDeputados: v.total, partidos: Array.from(v.partidos) }))
    .sort((a, b) => b.totalDeputados - a.totalDeputados)

  // ── Por região ───────────────────────────────────────────
  const mapaRegiao: Record<string, number> = {}
  for (const d of deputados) {
    const regiao = REGIOES[d.siglaUf] ?? 'Outros'
    mapaRegiao[regiao] = (mapaRegiao[regiao] || 0) + 1
  }

  // ── Partidos com mais estados ────────────────────────────
  const partidosMaisEstados = [...estatisticasPartido]
    .sort((a, b) => b.ufs.length - a.ufs.length)
    .slice(0, 10)

  // ── Por gênero ───────────────────────────────────────────
  const totalMulheres = mulheres.length
  const totalHomens = deputados.length - totalMulheres
  const pctMulheres = ((totalMulheres / deputados.length) * 100).toFixed(1)
  const pctHomens = ((totalHomens / deputados.length) * 100).toFixed(1)

  const mujerPorPartido = new Map<string, number>()
  for (const d of mulheres) {
    mujerPorPartido.set(d.siglaPartido, (mujerPorPartido.get(d.siglaPartido) ?? 0) + 1)
  }
  const generoPorPartido = estatisticasPartido
    .map(p => ({ sigla: p.sigla, total: p.totalDeputados, f: mujerPorPartido.get(p.sigla) ?? 0 }))
    .map(p => ({ ...p, pct: (p.f / p.total) * 100 }))
    .filter(p => p.f > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 10)

  const mujerPorRegiao = new Map<string, number>()
  for (const d of mulheres) {
    const reg = REGIOES[d.siglaUf] ?? 'Outros'
    mujerPorRegiao.set(reg, (mujerPorRegiao.get(reg) ?? 0) + 1)
  }
  const generoPorRegiao = Object.entries(mapaRegiao)
    .map(([regiao, total]) => ({
      regiao,
      total,
      f: mujerPorRegiao.get(regiao) ?? 0,
      pct: ((mujerPorRegiao.get(regiao) ?? 0) / total) * 100,
    }))
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Análise da Câmara</h1>
        <p className="text-gray-500 mt-1">
          Análise da composição da Câmara com {deputados.length} deputados federais
        </p>
      </div>

      {/* Resumo por Região */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Deputados por Região</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(mapaRegiao).sort(([, a], [, b]) => b - a).map(([regiao, total]) => (
            <div key={regiao} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-2xl font-bold text-blue-700">{total}</p>
              <p className="text-xs text-gray-500 mt-1">{regiao}</p>
              <p className="text-xs text-gray-400">{((total / deputados.length) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Distribuição por Partido */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-800">Composição por Partido</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">{estatisticasPartido.length} partidos representados</p>
        <DistribuicaoPartidosChart dados={estatisticasPartido} limite={20} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tabela completa */}
          <div className="overflow-y-auto max-h-72 rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Partido</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Dep.</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">%</th>
                  <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">UFs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {estatisticasPartido.map((p) => (
                  <tr key={p.sigla} className="even:bg-gray-50">
                    <td className="px-3 py-2 font-semibold text-gray-800">{p.sigla}</td>
                    <td className="px-3 py-2 text-right font-medium text-blue-700">{p.totalDeputados}</td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {((p.totalDeputados / deputados.length) * 100).toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">{p.ufs.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Partidos mais nacionais */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Partidos com Presença Nacional</h3>
            <p className="text-xs text-gray-400 mb-3">(mais estados representados)</p>
            <div className="space-y-2">
              {partidosMaisEstados.map((p, i) => (
                <div key={p.sigla} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-800 w-12">{p.sigla}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(p.ufs.length / 27) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{p.ufs.length} UFs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição por Estado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-5 h-5 text-green-600" />
          <h2 className="text-base font-semibold text-gray-800">Representação por Estado</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Número de deputados federais eleitos por UF</p>
        <DistribuicaoEstadosChart dados={estatisticasEstado} />

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase">UF</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Região</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Deputados</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">%</th>
                <th className="text-right px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Partidos</th>
                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Gráfico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {estatisticasEstado.map((e) => (
                <tr key={e.uf} className="even:bg-gray-50">
                  <td className="px-3 py-2 font-bold text-gray-800">{e.uf}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{REGIOES[e.uf] ?? '—'}</td>
                  <td className="px-3 py-2 text-right font-semibold text-green-700">{e.totalDeputados}</td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {((e.totalDeputados / deputados.length) * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500">{e.partidos.length}</td>
                  <td className="px-3 py-2 min-w-24">
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${(e.totalDeputados / (estatisticasEstado[0]?.totalDeputados ?? 1)) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Composição por Gênero */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-800">Composição por Gênero</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-4xl font-bold text-purple-700">{totalMulheres}</p>
            <p className="text-sm text-gray-600 mt-1">Mulheres</p>
            <p className="text-lg font-semibold text-purple-600">{pctMulheres}%</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-4xl font-bold text-blue-700">{totalHomens}</p>
            <p className="text-sm text-gray-600 mt-1">Homens</p>
            <p className="text-lg font-semibold text-blue-600">{pctHomens}%</p>
          </div>
        </div>
        <div className="flex rounded-full overflow-hidden h-3 mb-6">
          <div style={{ width: `${pctMulheres}%` }} className="bg-purple-500" />
          <div className="flex-1 bg-blue-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Top partidos — % feminino</h3>
            <div className="space-y-2">
              {generoPorPartido.map(p => (
                <div key={p.sigla} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-12 text-gray-800">{p.sigla}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{p.f}/{p.total} ({p.pct.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Por região</h3>
            <div className="space-y-2">
              {generoPorRegiao.map(r => (
                <div key={r.regiao} className="flex items-center gap-2">
                  <span className="text-xs font-semibold w-20 text-gray-800">{r.regiao}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${r.pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{r.f}/{r.total} ({r.pct.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas gerais */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-semibold text-gray-800">Estatísticas Gerais</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-700">{deputados.length}</p>
            <p className="text-xs text-gray-500 mt-1">Total de Deputados</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-700">{estatisticasPartido.length}</p>
            <p className="text-xs text-gray-500 mt-1">Partidos com bancada</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-700">{totalMulheres}</p>
            <p className="text-xs text-gray-500 mt-1">Mulheres ({pctMulheres}%)</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-700">
              {(deputados.length / estatisticasPartido.length).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Média dep./partido</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnalisePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnaliseContent />
    </Suspense>
  )
}
