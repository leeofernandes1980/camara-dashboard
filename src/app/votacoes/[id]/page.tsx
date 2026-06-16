import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchVotacao, fetchVotos, fetchOrientacoes } from '@/lib/api'
import { formatarData, corVoto } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import VotosChart from '@/components/votacoes/VotosChart'
import OrientacoesTable from '@/components/votacoes/OrientacoesTable'
import AvatarImage from '@/components/ui/AvatarImage'

interface PageProps {
  params: Promise<{ id: string }>
}

async function VotacaoContent({ id }: { id: string }) {
  const [resVotacao, resVotos, resOrientacoes] = await Promise.allSettled([
    fetchVotacao(id),
    fetchVotos(id),
    fetchOrientacoes(id),
  ])

  if (resVotacao.status === 'rejected') notFound()

  const votacao = resVotacao.value.dados
  const votos = resVotos.status === 'fulfilled' ? resVotos.value.dados : []
  const orientacoes = resOrientacoes.status === 'fulfilled' ? resOrientacoes.value.dados : []
  const aprovado = votacao.aprovacao === 1

  // Mapa siglaPartido/bloco → orientação
  const oriMap: Record<string, string> = {}
  for (const o of orientacoes) {
    oriMap[o.siglaPartidoBloco] = o.orientacao
  }

  const getAlinhamento = (tipoVoto: string | undefined, siglaPartido: string | undefined): boolean | null => {
    if (!tipoVoto || !siglaPartido) return null
    const ori = oriMap[siglaPartido]
    if (!ori || ori === 'Liberado') return null
    return tipoVoto.toLowerCase() === ori.toLowerCase()
  }

  // Disciplina por partido
  const discMap: Record<string, { alinhados: number; divergentes: number }> = {}
  for (const v of votos) {
    const partido = v.deputado_?.siglaPartido
    if (!partido) continue
    const ali = getAlinhamento(v.tipoVoto, partido)
    if (ali === null) continue
    if (!discMap[partido]) discMap[partido] = { alinhados: 0, divergentes: 0 }
    if (ali) discMap[partido].alinhados++
    else discMap[partido].divergentes++
  }
  const disciplinaPartidos = Object.entries(discMap)
    .map(([partido, d]) => ({
      partido,
      total: d.alinhados + d.divergentes,
      alinhados: d.alinhados,
      pct: (d.alinhados / (d.alinhados + d.divergentes)) * 100,
    }))
    .filter(p => p.total >= 3)
    .sort((a, b) => a.pct - b.pct)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Badge texto={aprovado ? 'Aprovado' : 'Rejeitado'} cor={aprovado ? 'green' : 'red'} />
          <Badge texto={votacao.siglaOrgao || 'Plenário'} cor="blue" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 leading-relaxed">
          {votacao.descricao || votacao.proposicaoObjeto || 'Votação sem descrição'}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {formatarData(votacao.dataHoraRegistro || votacao.data)}
        </p>

        <div className="mt-6 flex flex-wrap gap-6 items-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{votacao.votosSim ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Sim</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{votacao.votosNao ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Não</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{votacao.votosOutros ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Outros</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resultado dos Votos</h2>
          <VotosChart sim={votacao.votosSim ?? 0} nao={votacao.votosNao ?? 0} outros={votacao.votosOutros ?? 0} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Orientações das Bancadas</h2>
          <OrientacoesTable orientacoes={orientacoes} />
        </div>
      </div>

      {disciplinaPartidos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Disciplina Partidária</h2>
          <p className="text-xs text-gray-400 mb-4">Partidos ordenados do menos para o mais disciplinado (min. 3 votos contabilizados)</p>
          <div className="space-y-2">
            {disciplinaPartidos.map(p => (
              <div key={p.partido} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800 w-16">{p.partido}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${p.pct >= 80 ? 'bg-green-500' : p.pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-28 text-right">
                  {p.alinhados}/{p.total} ({p.pct.toFixed(0)}% alinhado)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {votos.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Votos Nominais ({votos.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Deputado</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Partido</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">UF</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Voto</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Disciplina</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {votos.map((v, i) => {
                  const ali = getAlinhamento(v.tipoVoto, v.deputado_?.siglaPartido)
                  return (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <AvatarImage src={v.deputado_?.urlFoto || ''} alt={v.deputado_?.nome || 'D'} size={28} />
                          </div>
                          <span className="font-medium text-gray-800">{v.deputado_?.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{v.deputado_?.siglaPartido}</td>
                      <td className="px-4 py-3 text-gray-600">{v.deputado_?.siglaUf}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${corVoto(v.tipoVoto)}`}>
                          {v.tipoVoto}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {ali === null ? (
                          <span className="text-gray-300 text-xs">—</span>
                        ) : ali ? (
                          <span className="text-green-600 text-xs font-semibold">Alinhado</span>
                        ) : (
                          <span className="text-red-600 text-xs font-semibold">Divergiu</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default async function VotacaoPage({ params }: PageProps) {
  const { id } = await params
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VotacaoContent id={id} />
    </Suspense>
  )
}
