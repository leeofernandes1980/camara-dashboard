'use client'

import { useState, useEffect } from 'react'
import { fetchProposicoesDeputado } from '@/lib/api'
import ProposicaoCard from '@/components/proposicoes/ProposicaoCard'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import type { Proposicao } from '@/lib/types'

interface ProposicoesTabProps {
  deputadoId: number
  pagina: number
  onPaginaChange: (pagina: number) => void
}

export default function ProposicoesTab({ deputadoId, pagina, onPaginaChange }: ProposicoesTabProps) {
  const [proposicoes, setProposicoes] = useState<Proposicao[]>([])
  const [temProxima, setTemProxima] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    setCarregando(true)
    setErro(null)
    fetchProposicoesDeputado(deputadoId, { itens: 20, pagina })
      .then((r) => {
        setProposicoes(r.dados)
        setTemProxima(r.links.some((l) => l.rel === 'next'))
      })
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }, [deputadoId, pagina, tentativa])

  if (carregando) return <LoadingSpinner />
  if (erro) return <ErrorMessage mensagem={erro} onRetry={() => setTentativa((t) => t + 1)} />

  if (proposicoes.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nenhuma proposição encontrada.</p>
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {proposicoes.map((p) => <ProposicaoCard key={p.id} proposicao={p} />)}
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
