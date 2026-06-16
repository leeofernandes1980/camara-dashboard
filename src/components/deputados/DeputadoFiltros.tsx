'use client'

import { Search } from 'lucide-react'

const UFS = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
]

interface FiltrosDeputadosProps {
  nome: string
  siglaUF: string
  siglaPartido: string
  onNome: (v: string) => void
  onUF: (v: string) => void
  onPartido: (v: string) => void
}

export default function DeputadoFiltros({
  nome, siglaUF, siglaPartido, onNome, onUF, onPartido
}: FiltrosDeputadosProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">Buscar por nome</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={nome}
            onChange={(e) => onNome(e.target.value)}
            placeholder="Ex: Lira, Moro..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="min-w-32">
        <label className="block text-xs font-medium text-gray-700 mb-1">Estado (UF)</label>
        <select
          value={siglaUF}
          onChange={(e) => onUF(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos</option>
          {UFS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </select>
      </div>

      <div className="min-w-36">
        <label className="block text-xs font-medium text-gray-700 mb-1">Partido</label>
        <input
          type="text"
          value={siglaPartido}
          onChange={(e) => onPartido(e.target.value.toUpperCase())}
          placeholder="Ex: PT, PL, MDB..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
