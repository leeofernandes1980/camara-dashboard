'use client'

import { useState, useEffect } from 'react'
import { fetchDespesasDeputado, fetchProposicoesDeputado, fetchDiscursosDeputado, fetchOrgaosDeputado, fetchVotacoesDeputado } from '@/lib/api'
import { formatarData, formatarMoeda, anoAtual } from '@/lib/utils'
import GastosChart from '@/components/cota/GastosChart'
import GastosTable from '@/components/cota/GastosTable'
import ProposicaoCard from '@/components/proposicoes/ProposicaoCard'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import type { Despesa, Proposicao, Discurso, OrgaoMembro, VotacaoDeputado } from '@/lib/types'
import { FileText, Mic, Users2, Receipt, ExternalLink, Vote } from 'lucide-react'
import Link from 'next/link'
import { corVoto } from '@/lib/utils'

interface DeputadoTabsProps {
  deputadoId: number
}

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

type Aba = 'despesas' | 'proposicoes' | 'discursos' | 'comissoes' | 'votacoes'

export default function DeputadoTabs({ deputadoId }: DeputadoTabsProps) {
  const [aba, setAba] = useState<Aba>('despesas')
  const [ano, setAno] = useState(anoAtual())
  const [paginaDespesas, setPaginaDespesas] = useState(1)
  const [paginaProposicoes, setPaginaProposicoes] = useState(1)

  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([])
  const [discursos, setDiscursos] = useState<Discurso[]>([])
  const [orgaos, setOrgaos] = useState<OrgaoMembro[]>([])
  const [votacoes, setVotacoes] = useState<VotacaoDeputado[]>([])
  const [paginaVotacoes, setPaginaVotacoes] = useState(1)
  const [temProxVotacoes, setTemProxVotacoes] = useState(false)

  const [carregando, setCarregando] = useState(false)
  const [temProxDespesas, setTemProxDespesas] = useState(false)
  const [temProxProposicoes, setTemProxProposicoes] = useState(false)

  useEffect(() => {
    if (aba !== 'despesas') return
    setCarregando(true)
    fetchDespesasDeputado(deputadoId, { ano, itens: 50, pagina: paginaDespesas })
      .then((r) => {
        setDespesas(r.dados)
        setTemProxDespesas(r.links.some((l) => l.rel === 'next'))
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [deputadoId, aba, ano, paginaDespesas])

  useEffect(() => {
    if (aba !== 'proposicoes') return
    setCarregando(true)
    fetchProposicoesDeputado(deputadoId, { itens: 20, pagina: paginaProposicoes })
      .then((r) => {
        setProposicoes(r.dados)
        setTemProxProposicoes(r.links.some((l) => l.rel === 'next'))
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [deputadoId, aba, paginaProposicoes])

  useEffect(() => {
    if (aba !== 'discursos') return
    setCarregando(true)
    fetchDiscursosDeputado(deputadoId, { itens: 20 })
      .then((r) => setDiscursos(r.dados))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [deputadoId, aba])

  useEffect(() => {
    if (aba !== 'comissoes') return
    setCarregando(true)
    fetchOrgaosDeputado(deputadoId)
      .then((r) => setOrgaos(r.dados))
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [deputadoId, aba])

  useEffect(() => {
    if (aba !== 'votacoes') return
    setCarregando(true)
    fetchVotacoesDeputado(deputadoId, { itens: 30, pagina: paginaVotacoes })
      .then((r) => {
        setVotacoes(r.dados)
        setTemProxVotacoes(r.links.some((l) => l.rel === 'next'))
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [deputadoId, aba, paginaVotacoes])

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

  const tabs: { id: Aba; label: string; icone: React.ElementType }[] = [
    { id: 'despesas', label: 'Despesas CEAP', icone: Receipt },
    { id: 'proposicoes', label: 'Proposições', icone: FileText },
    { id: 'votacoes', label: 'Votações', icone: Vote },
    { id: 'discursos', label: 'Discursos', icone: Mic },
    { id: 'comissoes', label: 'Comissões', icone: Users2 },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab bar */}
      <div className="border-b border-gray-200 px-4 flex gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icone: Icone }) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`
              flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${aba === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
              }
            `}
          >
            <Icone className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {carregando && <LoadingSpinner />}

        {/* ── Despesas ── */}
        {!carregando && aba === 'despesas' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Total de despesas em {ano}</p>
                <p className="text-2xl font-bold text-blue-700">{formatarMoeda(totalGasto)}</p>
              </div>
              <select
                value={ano}
                onChange={(e) => { setAno(Number(e.target.value)); setPaginaDespesas(1) }}
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
              paginaAtual={paginaDespesas}
              temProxima={temProxDespesas}
              onAnterior={() => setPaginaDespesas((p) => Math.max(1, p - 1))}
              onProxima={() => setPaginaDespesas((p) => p + 1)}
            />
          </div>
        )}

        {/* ── Proposições ── */}
        {!carregando && aba === 'proposicoes' && (
          <div className="space-y-4">
            {proposicoes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma proposição encontrada.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {proposicoes.map((p) => <ProposicaoCard key={p.id} proposicao={p} />)}
                </div>
                <Pagination
                  paginaAtual={paginaProposicoes}
                  temProxima={temProxProposicoes}
                  onAnterior={() => setPaginaProposicoes((p) => Math.max(1, p - 1))}
                  onProxima={() => setPaginaProposicoes((p) => p + 1)}
                />
              </>
            )}
          </div>
        )}

        {/* ── Votações ── */}
        {!carregando && aba === 'votacoes' && (
          <div className="space-y-3">
            {votacoes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma votação encontrada.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Data</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Votação</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Voto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {votacoes.map((v, i) => (
                        <tr key={`${v.id}-${i}`} className="even:bg-gray-50 hover:bg-blue-50/40">
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {formatarData(v.dataHoraRegistro || v.data)}
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <Link href={`/votacoes/${v.id}`}
                              className="text-blue-700 hover:underline text-xs font-medium line-clamp-2">
                              {v.descricao || v.proposicaoObjeto || 'Sem descrição'}
                            </Link>
                            {v.siglaOrgao && (
                              <span className="text-xs text-gray-400 mt-0.5 block">{v.siglaOrgao}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${corVoto(v.tipoVoto)}`}>
                              {v.tipoVoto}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  paginaAtual={paginaVotacoes}
                  temProxima={temProxVotacoes}
                  onAnterior={() => setPaginaVotacoes((p) => Math.max(1, p - 1))}
                  onProxima={() => setPaginaVotacoes((p) => p + 1)}
                />
              </>
            )}
          </div>
        )}

        {/* ── Discursos ── */}
        {!carregando && aba === 'discursos' && (
          <div className="space-y-3">
            {discursos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhum discurso encontrado.</p>
            ) : (
              discursos.map((d, i) => (
                <div key={`${d.dataHoraInicio}-${i}`} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge texto={d.tipoDiscurso || 'Discurso'} cor="blue" />
                      <span className="text-xs text-gray-400">{formatarData(d.dataHoraInicio)}</span>
                    </div>
                    {d.urlTexto && (
                      <a href={d.urlTexto} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <ExternalLink className="w-3 h-3" />
                        Ver texto
                      </a>
                    )}
                  </div>
                  {d.sumario && (
                    <p className="text-sm text-gray-700 leading-relaxed">{d.sumario}</p>
                  )}
                  {d.keywords && (
                    <p className="text-xs text-gray-400 mt-2">Palavras-chave: {d.keywords}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Comissões ── */}
        {!carregando && aba === 'comissoes' && (
          <div className="space-y-2">
            {orgaos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Nenhuma comissão encontrada.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Órgão</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Título</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Início</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fim</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orgaos.map((o, i) => (
                      <tr key={`${o.siglaOrgao}-${i}`} className="even:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{o.siglaOrgao}</p>
                          <p className="text-xs text-gray-400">{o.nomeOrgao}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{o.titulo || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{formatarData(o.dataInicio)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{o.dataFim ? formatarData(o.dataFim) : 'Atual'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
