'use client'

import { useState, useEffect } from 'react'
import { fetchOrgaosDeputado } from '@/lib/api'
import { formatarData } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import type { OrgaoMembro } from '@/lib/types'

interface ComissoesTabProps {
  deputadoId: number
}

export default function ComissoesTab({ deputadoId }: ComissoesTabProps) {
  const [orgaos, setOrgaos] = useState<OrgaoMembro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    fetchOrgaosDeputado(deputadoId)
      .then((r) => setOrgaos(r.dados))
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [deputadoId, tentativa])

  if (carregando) return <LoadingSpinner />
  if (erro) return <ErrorMessage mensagem={erro} onRetry={() => setTentativa((t) => t + 1)} />

  if (orgaos.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nenhuma comissão encontrada.</p>
  }

  return (
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
  )
}
