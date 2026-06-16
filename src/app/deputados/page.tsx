'use client'

import { useState } from 'react'
import DeputadoCard from '@/components/deputados/DeputadoCard'
import DeputadoFiltros from '@/components/deputados/DeputadoFiltros'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useDeputados } from '@/hooks/useDeputados'
import { usePaginacao } from '@/hooks/usePaginacao'
import { useDebounce } from '@/hooks/useDebounce'

export default function DeputadosPage() {
  const [nome, setNome] = useState('')
  const [siglaUF, setSiglaUF] = useState('')
  const [siglaPartido, setSiglaPartido] = useState('')
  const nomeBuscado = useDebounce(nome, 500)
  const { pagina, proximaPagina, paginaAnterior, resetar } = usePaginacao()

  const { deputados, carregando, erro, recarregar, temProxima } = useDeputados({
    nome: nomeBuscado || undefined,
    siglaUF: siglaUF || undefined,
    siglaPartido: siglaPartido || undefined,
    pagina,
  })

  function handleFiltro(setter: (v: string) => void) {
    return (v: string) => {
      setter(v)
      resetar()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Deputados</h1>
        <p className="text-gray-500 mt-1">Lista de deputados federais da legislatura atual</p>
      </div>

      <DeputadoFiltros
        nome={nome}
        siglaUF={siglaUF}
        siglaPartido={siglaPartido}
        onNome={handleFiltro(setNome)}
        onUF={handleFiltro(setSiglaUF)}
        onPartido={handleFiltro(setSiglaPartido)}
      />

      {carregando && <LoadingSpinner />}

      {erro && !carregando && (
        <ErrorMessage mensagem={erro} onRetry={recarregar} />
      )}

      {!carregando && !erro && deputados.length === 0 && (
        <div className="text-center py-12 text-gray-400">Nenhum deputado encontrado com os filtros selecionados.</div>
      )}

      {!carregando && !erro && deputados.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {deputados.map((d) => <DeputadoCard key={d.id} deputado={d} />)}
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
