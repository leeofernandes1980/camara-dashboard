'use client'

import { Search } from 'lucide-react'
import { anosDisponiveis } from '@/lib/utils'
import type { Deputado } from '@/lib/types'

interface CotatFiltrosProps {
  busca: string
  ano: number
  sugestoes: Deputado[]
  onBusca: (v: string) => void
  onAno: (v: number) => void
  onSelecionarDeputado: (d: Deputado) => void
}

export default function CotatFiltros({
  busca, ano, sugestoes, onBusca, onAno, onSelecionarDeputado
}: CotatFiltrosProps) {
  const anos = anosDisponiveis()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-64 relative">
        <label className="block text-xs font-medium text-gray-700 mb-1">Buscar deputado</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => onBusca(e.target.value)}
            placeholder="Digite o nome do deputado..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {sugestoes.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1">
            {sugestoes.map((d) => (
              <button
                key={d.id}
                onClick={() => onSelecionarDeputado(d)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
              >
                <span className="font-medium text-gray-800">{d.nome}</span>
                <span className="text-xs text-gray-500 ml-2">{d.siglaPartido} — {d.siglaUf}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Ano</label>
        <select
          value={ano}
          onChange={(e) => onAno(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {anos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
    </div>
  )
}
