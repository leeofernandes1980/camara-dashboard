'use client'

import { AlertTriangle } from 'lucide-react'
import type { Orgao } from '@/lib/types'

const PERIODOS = [
  { label: '7 dias', dias: 7 },
  { label: '30 dias', dias: 30 },
  { label: '60 dias', dias: 60 },
  { label: '3 meses', dias: 88 },
]

interface VotacaoFiltrosProps {
  dataInicio: string
  dataFim: string
  idOrgao: string
  aprovacao: string
  orgaos: Orgao[]
  rangeExcedido?: boolean
  dataInicioEfetiva?: string
  onDataInicio: (v: string) => void
  onDataFim: (v: string) => void
  onOrgao: (v: string) => void
  onAprovacao: (v: string) => void
  onPeriodo: (dias: number) => void
}

export default function VotacaoFiltros({
  dataInicio, dataFim, idOrgao, aprovacao, orgaos,
  rangeExcedido, dataInicioEfetiva,
  onDataInicio, onDataFim, onOrgao, onAprovacao, onPeriodo,
}: VotacaoFiltrosProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
      {/* Atalhos de período */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 font-medium">Período rápido:</span>
        {PERIODOS.map(({ label, dias }) => (
          <button
            key={dias}
            onClick={() => onPeriodo(dias)}
            className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Data início</label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => onDataInicio(e.target.value)}
          className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            rangeExcedido ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
          }`}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Data fim</label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => onDataFim(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">Órgão</label>
        <select
          value={idOrgao}
          onChange={(e) => onOrgao(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {orgaos.map((o) => (
            <option key={o.id} value={String(o.id)}>{o.sigla} — {o.nome}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Resultado</label>
        <select
          value={aprovacao}
          onChange={(e) => onAprovacao(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          <option value="1">Aprovado</option>
          <option value="0">Rejeitado</option>
        </select>
      </div>
      </div>

      {rangeExcedido && dataInicioEfetiva && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            A API da Câmara aceita no máximo 3 meses por consulta.
            Exibindo votações a partir de <strong>{dataInicioEfetiva}</strong>.
            Use os atalhos acima para navegar em períodos menores.
          </span>
        </div>
      )}
    </div>
  )
}
