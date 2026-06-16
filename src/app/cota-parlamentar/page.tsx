'use client'

import { useState, useEffect, useRef } from 'react'
import CotatFiltros from '@/components/cota/CotatFiltros'
import GastosChart from '@/components/cota/GastosChart'
import GastosTable from '@/components/cota/GastosTable'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { fetchDeputados, fetchDespesasDeputado } from '@/lib/api'
import { formatarMoeda, anoAtual } from '@/lib/utils'
import { usePaginacao } from '@/hooks/usePaginacao'
import { useDebounce } from '@/hooks/useDebounce'
import type { Deputado, Despesa } from '@/lib/types'

function agruparPorCategoria(despesas: Despesa[]) {
  const mapa: Record<string, number> = {}
  for (const d of despesas) {
    mapa[d.tipoDespesa] = (mapa[d.tipoDespesa] || 0) + d.valorLiquido
  }
  return Object.entries(mapa)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
}

export default function CotaPage() {
  const [busca, setBusca] = useState('')
  const [deputadoSelecionado, setDeputadoSelecionado] = useState<Deputado | null>(null)
  const [sugestoes, setSugestoes] = useState<Deputado[]>([])
  const [ano, setAno] = useState(anoAtual())
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [carregandoDespesas, setCarregandoDespesas] = useState(false)
  const [erroDespesas, setErroDespesas] = useState<string | null>(null)
  const [temProxima, setTemProxima] = useState(false)
  const buscaDebounced = useDebounce(busca, 400)
  const { pagina, proximaPagina, paginaAnterior, resetar } = usePaginacao()
  const buscandoRef = useRef(false)

  useEffect(() => {
    if (!buscaDebounced || deputadoSelecionado) {
      setSugestoes([])
      return
    }
    if (buscandoRef.current) return
    buscandoRef.current = true
    fetchDeputados({ nome: buscaDebounced, itens: 8 })
      .then((r) => setSugestoes(r.dados))
      .catch(() => setSugestoes([]))
      .finally(() => { buscandoRef.current = false })
  }, [buscaDebounced, deputadoSelecionado])

  useEffect(() => {
    if (!deputadoSelecionado) {
      setDespesas([])
      return
    }
    setCarregandoDespesas(true)
    setErroDespesas(null)
    fetchDespesasDeputado(deputadoSelecionado.id, { ano, itens: 50, pagina })
      .then((r) => {
        setDespesas(r.dados)
        setTemProxima(r.links.some((l) => l.rel === 'next'))
      })
      .catch((err) => setErroDespesas(err.message))
      .finally(() => setCarregandoDespesas(false))
  }, [deputadoSelecionado, ano, pagina])

  function handleSelecionarDeputado(d: Deputado) {
    setDeputadoSelecionado(d)
    setBusca(d.nome)
    setSugestoes([])
    resetar()
  }

  function handleBusca(v: string) {
    setBusca(v)
    if (deputadoSelecionado) setDeputadoSelecionado(null)
  }

  function handleAno(v: number) {
    setAno(v)
    resetar()
  }

  const gastosCategoria = agruparPorCategoria(despesas)
  const totalGasto = despesas.reduce((acc, d) => acc + d.valorLiquido, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cota Parlamentar (CEAP)</h1>
        <p className="text-gray-500 mt-1">
          Cota para o Exercício da Atividade Parlamentar — despesas reembolsadas
        </p>
      </div>

      <CotatFiltros
        busca={busca}
        ano={ano}
        sugestoes={sugestoes}
        onBusca={handleBusca}
        onAno={handleAno}
        onSelecionarDeputado={handleSelecionarDeputado}
      />

      {!deputadoSelecionado && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Selecione um deputado para visualizar as despesas</p>
          <p className="text-sm mt-2">Digite o nome no campo acima e clique no resultado</p>
        </div>
      )}

      {deputadoSelecionado && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-800">{deputadoSelecionado.nome}</p>
              <p className="text-sm text-blue-600">
                {deputadoSelecionado.siglaPartido} — {deputadoSelecionado.siglaUf} — Ano: {ano}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-600">Total no período</p>
              <p className="text-2xl font-bold text-blue-800">{formatarMoeda(totalGasto)}</p>
            </div>
          </div>

          {carregandoDespesas && <LoadingSpinner />}

          {erroDespesas && !carregandoDespesas && (
            <ErrorMessage mensagem={erroDespesas} />
          )}

          {!carregandoDespesas && !erroDespesas && despesas.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Nenhuma despesa encontrada para o período selecionado.
            </div>
          )}

          {!carregandoDespesas && !erroDespesas && despesas.length > 0 && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Categoria</h2>
                <GastosChart dados={gastosCategoria} />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Registros de Despesas</h2>
                <GastosTable despesas={despesas} />
                <Pagination
                  paginaAtual={pagina}
                  temProxima={temProxima}
                  onAnterior={paginaAnterior}
                  onProxima={proximaPagina}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
