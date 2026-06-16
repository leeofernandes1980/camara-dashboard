export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { fetchTodosDeputados, fetchPartidos } from '@/lib/api'
import PartidoCard from '@/components/partidos/PartidoCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import DistribuicaoPartidosChart from '@/components/analise/DistribuicaoPartidosChart'
import type { EstatisticaPartido } from '@/lib/types'

async function PartidosContent() {
  const [resDeputados, resPartidos] = await Promise.allSettled([
    fetchTodosDeputados(),
    fetchPartidos({ itens: 100 }),
  ])

  const deputados = resDeputados.status === 'fulfilled' ? resDeputados.value : []
  const partidos = resPartidos.status === 'fulfilled' ? resPartidos.value.dados : []

  // Agrupa deputados por partido
  const mapaPartido: Record<string, { total: number; ufs: Set<string> }> = {}
  for (const d of deputados) {
    if (!mapaPartido[d.siglaPartido]) mapaPartido[d.siglaPartido] = { total: 0, ufs: new Set() }
    mapaPartido[d.siglaPartido].total++
    mapaPartido[d.siglaPartido].ufs.add(d.siglaUf)
  }

  const estatisticas: EstatisticaPartido[] = Object.entries(mapaPartido).map(([sigla, v]) => ({
    sigla,
    nome: partidos.find((p) => p.sigla === sigla)?.nome ?? sigla,
    totalDeputados: v.total,
    ufs: Array.from(v.ufs).sort(),
  })).sort((a, b) => b.totalDeputados - a.totalDeputados)

  // Enriquece com id do partido
  const partidosComId = partidos.map((p) => ({
    ...p,
    totalDeputados: mapaPartido[p.sigla]?.total ?? 0,
    ufs: Array.from(mapaPartido[p.sigla]?.ufs ?? []).sort(),
  })).filter((p) => p.totalDeputados > 0)
    .sort((a, b) => b.totalDeputados - a.totalDeputados)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Partidos Políticos</h1>
        <p className="text-gray-500 mt-1">
          {estatisticas.length} partidos com representação na legislatura atual ({deputados.length} deputados)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Distribuição por Partido</h2>
        <DistribuicaoPartidosChart dados={estatisticas} limite={20} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {partidosComId.map((p) => (
          <PartidoCard
            key={p.id}
            partido={p}
            totalDeputados={p.totalDeputados}
            ufs={p.ufs}
          />
        ))}
      </div>
    </div>
  )
}

export default function PartidosPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PartidosContent />
    </Suspense>
  )
}
