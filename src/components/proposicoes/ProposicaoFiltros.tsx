'use client'

import { Search, Hash } from 'lucide-react'
import { anosDisponiveis } from '@/lib/utils'

function isRefPattern(q: string) {
  return /^[A-Za-z]{2,5}\s+n?\.?\s*\d+\s*\/\s*\d{4}$/i.test(q.trim())
}

const TIPOS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'PL', label: 'PL — Projeto de Lei' },
  { value: 'PEC', label: 'PEC — Proposta de Emenda Constitucional' },
  { value: 'PLP', label: 'PLP — Projeto de Lei Complementar' },
  { value: 'PDC', label: 'PDC — Projeto de Decreto Legislativo' },
  { value: 'MPV', label: 'MPV — Medida Provisória' },
  { value: 'PLN', label: 'PLN — Projeto de Lei do Congresso' },
  { value: 'REQ', label: 'REQ — Requerimento' },
  { value: 'RIC', label: 'RIC — Requerimento de Informação' },
  { value: 'MSC', label: 'MSC — Mensagem' },
  { value: 'INC', label: 'INC — Indicação' },
]

interface ProposicaoFiltrosProps {
  siglaTipo: string
  ano: string
  autor: string
  keywords: string
  termosBuscados?: string
  onTipo: (v: string) => void
  onAno: (v: string) => void
  onAutor: (v: string) => void
  onKeywords: (v: string) => void
}

export default function ProposicaoFiltros({
  siglaTipo, ano, autor, keywords, termosBuscados,
  onTipo, onAno, onAutor, onKeywords,
}: ProposicaoFiltrosProps) {
  const anos = ['', ...anosDisponiveis().map(String)]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
      <div className="min-w-56">
        <label className="block text-xs font-medium text-gray-700 mb-1">Tipo de proposição</label>
        <select
          value={siglaTipo}
          onChange={(e) => onTipo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="min-w-28">
        <label className="block text-xs font-medium text-gray-700 mb-1">Ano</label>
        <select
          value={ano}
          onChange={(e) => onAno(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {anosDisponiveis().map((a) => <option key={a} value={String(a)}>{a}</option>)}
        </select>
      </div>

      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">Buscar por tema ou referência</label>
        <div className="relative">
          {isRefPattern(keywords)
            ? <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            : <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          }
          <input
            type="text"
            value={keywords}
            onChange={(e) => onKeywords(e.target.value)}
            placeholder="Ex: PEC 221/2019, PCD, clima..."
            maxLength={100}
            className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
              isRefPattern(keywords)
                ? 'border-blue-400 ring-1 ring-blue-300 bg-blue-50 focus:ring-blue-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        </div>
        {isRefPattern(keywords) && (
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <Hash className="w-3 h-3" />
            Buscando por referência exata
          </p>
        )}
        {!isRefPattern(keywords) && termosBuscados && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <Search className="w-3 h-3" />
            Termos usados: <strong>{termosBuscados}</strong>
          </p>
        )}
      </div>

      <div className="flex-1 min-w-40">
        <label className="block text-xs font-medium text-gray-700 mb-1">Autor (nome do deputado)</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={autor}
            onChange={(e) => onAutor(e.target.value)}
            placeholder="Ex: Lira, Gleisi..."
            maxLength={100}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
