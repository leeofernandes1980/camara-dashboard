'use client'

import { useState, useEffect } from 'react'
import { fetchVotacoesDeputado } from '@/lib/api'
import { formatarData, corVoto } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import type { VotacaoDeputado } from '@/lib/types'
import Link from 'next/link'

interface VotacoesTabProps {
  deputadoId: number
  pagina: number
  onPaginaChange: (pagina: number) => void
}

export default function VotacoesTab({ deputadoId, pagina, onPaginaChange }: VotacoesTabProps) {
  const [votacoes, setVotacoes] = useState<VotacaoDeputado[]>([])
  const [temProxima, setTemProxima] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    fetchVotacoesDeputado(deputadoId, { itens: 30, pagina })
      .then((r) => {
        setVotacoes(r.dados)
        setTemProxima(r.links.some((l) => l.rel === 'next'))
      })
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [deputadoId, pagina, tentativa])

  if (carregando) return <LoadingSpinner />
  if (erro) return <ErrorMessage mensagem={erro} onRetry={() => setTentativa((t) => t + 1)} />

  if (votacoes.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nenhuma votação encontrada.</p>
  }

  return (
    <div className="space-y-3">
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
        paginaAtual={pagina}
        temProxima={temProxima}
        onAnterior={() => onPaginaChange(Math.max(1, pagina - 1))}
        onProxima={() => onPaginaChange(pagina + 1)}
      />
    </div>
  )
}
