'use client'

import { useState } from 'react'
import VotacaoCard from '@/components/votacoes/VotacaoCard'
import VotacaoFiltros from '@/components/votacoes/VotacaoFiltros'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useVotacoes } from '@/hooks/useVotacoes'
import { usePaginacao } from '@/hooks/usePaginacao'
import { data30DiasAtrasISO, dataHojeISO } from '@/lib/utils'
import type { Orgao } from '@/lib/types'
import { useEffect, useRef } from 'react'
import { fetchOrgaos } from '@/lib/api'

const MAX_DIAS_API = 90

function diasEntre(ini: string, fim: string): number {
  if (!ini || !fim) return 0
  return Math.floor((new Date(fim).getTime() - new Date(ini).getTime()) / 86400000)
}

function subDias(base: string, dias: number): string {
  const d = new Date(base)
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

export default function VotacoesPage() {
  const [dataInicio, setDataInicio] = useState(data30DiasAtrasISO())
  const [dataFim, setDataFim] = useState(dataHojeISO())
  const [idOrgao, setIdOrgao] = useState('')
  const [aprovacao, setAprovacao] = useState('')
  const [orgaos, setOrgaos] = useState<Orgao[]>([])
  const orgaosCarregados = useRef(false)

  const { pagina, proximaPagina, paginaAnterior, resetar } = usePaginacao()

  // API da Câmara rejeita janelas > ~180 dias — cap silencioso com aviso ao usuário
  const diff = diasEntre(dataInicio, dataFim)
  const rangeExcedido = diff >= MAX_DIAS_API
  const dataInicioApi = rangeExcedido ? subDias(dataFim, MAX_DIAS_API - 2) : dataInicio

  const { votacoes, carregando, erro, recarregar, temProxima } = useVotacoes({
    dataInicio: dataInicioApi || undefined,
    dataFim: dataFim || undefined,
    idOrgao: idOrgao ? Number(idOrgao) : undefined,
    aprovacao: aprovacao !== '' ? Number(aprovacao) : undefined,
    pagina,
  })

  function aplicarPeriodo(dias: number) {
    const fim = dataHojeISO()
    setDataFim(fim)
    setDataInicio(subDias(fim, dias))
    resetar()
  }

  useEffect(() => {
    if (orgaosCarregados.current) return
    orgaosCarregados.current = true
    fetchOrgaos().then((r) => setOrgaos(r.dados)).catch(() => {})
  }, [])

  function handleFiltro(setter: (v: string) => void) {
    return (v: string) => { setter(v); resetar() }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Votações</h1>
        <p className="text-gray-500 mt-1">Resultado das votações na Câmara dos Deputados</p>
      </div>

      <VotacaoFiltros
        dataInicio={dataInicio}
        dataFim={dataFim}
        idOrgao={idOrgao}
        aprovacao={aprovacao}
        orgaos={orgaos}
        rangeExcedido={rangeExcedido}
        dataInicioEfetiva={rangeExcedido ? dataInicioApi : undefined}
        onDataInicio={handleFiltro(setDataInicio)}
        onDataFim={handleFiltro(setDataFim)}
        onOrgao={handleFiltro(setIdOrgao)}
        onAprovacao={handleFiltro(setAprovacao)}
        onPeriodo={aplicarPeriodo}
      />

      {carregando && <LoadingSpinner />}

      {erro && !carregando && (
        <ErrorMessage mensagem={erro} onRetry={recarregar} />
      )}

      {!carregando && !erro && votacoes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Nenhuma votação encontrada no período selecionado.
        </div>
      )}

      {!carregando && !erro && votacoes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {votacoes.map((v) => <VotacaoCard key={v.id} votacao={v} />)}
          </div>
          <Pagination
            paginaAtual={pagina}
            temProxima={temProxima}
            onAnterior={paginaAnterior}
            onProxima={proximaPagina}
          />
        </>
      )}
    </div>
  )
}
