'use client'

import { useState, useEffect } from 'react'
import { fetchDiscursosDeputado } from '@/lib/api'
import { formatarData } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import Badge from '@/components/ui/Badge'
import type { Discurso } from '@/lib/types'
import { ExternalLink } from 'lucide-react'

interface DiscursosTabProps {
  deputadoId: number
}

export default function DiscursosTab({ deputadoId }: DiscursosTabProps) {
  const [discursos, setDiscursos] = useState<Discurso[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    fetchDiscursosDeputado(deputadoId, { itens: 20 })
      .then((r) => setDiscursos(r.dados))
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [deputadoId, tentativa])

  if (carregando) return <LoadingSpinner />
  if (erro) return <ErrorMessage mensagem={erro} onRetry={() => setTentativa((t) => t + 1)} />

  if (discursos.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nenhum discurso encontrado.</p>
  }

  return (
    <div className="space-y-3">
      {discursos.map((d, i) => (
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
      ))}
    </div>
  )
}
