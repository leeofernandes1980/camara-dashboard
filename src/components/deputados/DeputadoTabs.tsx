'use client'

import { useState } from 'react'
import { anoAtual } from '@/lib/utils'
import { FileText, Mic, Users2, Receipt, Vote } from 'lucide-react'
import DespesasTab from './tabs/DespesasTab'
import ProposicoesTab from './tabs/ProposicoesTab'
import VotacoesTab from './tabs/VotacoesTab'
import DiscursosTab from './tabs/DiscursosTab'
import ComissoesTab from './tabs/ComissoesTab'

interface DeputadoTabsProps {
  deputadoId: number
}

type Aba = 'despesas' | 'proposicoes' | 'discursos' | 'comissoes' | 'votacoes'

const tabs: { id: Aba; label: string; icone: React.ElementType }[] = [
  { id: 'despesas', label: 'Despesas CEAP', icone: Receipt },
  { id: 'proposicoes', label: 'Proposições', icone: FileText },
  { id: 'votacoes', label: 'Votações', icone: Vote },
  { id: 'discursos', label: 'Discursos', icone: Mic },
  { id: 'comissoes', label: 'Comissões', icone: Users2 },
]

export default function DeputadoTabs({ deputadoId }: DeputadoTabsProps) {
  const [aba, setAba] = useState<Aba>('despesas')
  const [ano, setAno] = useState(anoAtual())
  const [paginaDespesas, setPaginaDespesas] = useState(1)
  const [paginaProposicoes, setPaginaProposicoes] = useState(1)
  const [paginaVotacoes, setPaginaVotacoes] = useState(1)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div role="tablist" className="border-b border-gray-200 px-4 flex gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icone: Icone }) => (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            aria-selected={aba === id}
            aria-controls={`tabpanel-${id}`}
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

      <div className="p-6" id={`tabpanel-${aba}`} role="tabpanel" aria-labelledby={`tab-${aba}`}>
        {aba === 'despesas' && (
          <DespesasTab
            deputadoId={deputadoId}
            ano={ano}
            onAnoChange={setAno}
            pagina={paginaDespesas}
            onPaginaChange={setPaginaDespesas}
          />
        )}
        {aba === 'proposicoes' && (
          <ProposicoesTab
            deputadoId={deputadoId}
            pagina={paginaProposicoes}
            onPaginaChange={setPaginaProposicoes}
          />
        )}
        {aba === 'votacoes' && (
          <VotacoesTab
            deputadoId={deputadoId}
            pagina={paginaVotacoes}
            onPaginaChange={setPaginaVotacoes}
          />
        )}
        {aba === 'discursos' && <DiscursosTab deputadoId={deputadoId} />}
        {aba === 'comissoes' && <ComissoesTab deputadoId={deputadoId} />}
      </div>
    </div>
  )
}
