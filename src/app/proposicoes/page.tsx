'use client'

import { useState } from 'react'
import ProposicaoCard from '@/components/proposicoes/ProposicaoCard'
import ProposicaoFiltros from '@/components/proposicoes/ProposicaoFiltros'
import Pagination from '@/components/ui/Pagination'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ErrorMessage from '@/components/ui/ErrorMessage'
import { useProposicoes } from '@/hooks/useProposicoes'
import { usePaginacao } from '@/hooks/usePaginacao'
import { useDebounce } from '@/hooks/useDebounce'
import { anoAtual } from '@/lib/utils'

// Detecta padrões como "PEC 221/2019", "PL 1234/2024", "MPV 987/2022"
function parseRef(q: string): { siglaTipo?: string; numero?: number; ano?: number; keywords?: string } {
  const m = q.trim().match(/^([A-Za-z]{2,5})\s+n?\.?\s*(\d+)\s*\/\s*(\d{4})$/i)
  if (m) return { siglaTipo: m[1].toUpperCase(), numero: Number(m[2]), ano: Number(m[3]) }
  return { keywords: q || undefined }
}

// Remove stopwords PT e extrai termos significativos para o campo `keywords` da API
const STOPWORDS = new Set([
  'a','o','as','os','de','da','do','das','dos','em','no','na','nos','nas',
  'para','por','com','e','ou','que','se','ao','aos','às','um','uma','uns',
  'umas','é','são','foi','ser','ter','há','à','até','entre','sobre','mais',
  'anos','anos','ano','mês','dias','dia','horas','hora','semanas','semana',
])

function extrairTermos(q: string): string {
  const palavras = q.trim().toLowerCase().split(/\s+/)
  const significativas = palavras.filter(p => p.length > 2 && !STOPWORDS.has(p))
  return significativas.slice(0, 4).join(' ')
}

export default function ProposicoesPage() {
  const [siglaTipo, setSiglaTipo] = useState('')
  const [ano, setAno] = useState(String(anoAtual()))
  const [autor, setAutor] = useState('')
  const [keywords, setKeywords] = useState('')
  const autorDebounced = useDebounce(autor, 600)
  const keywordsDebounced = useDebounce(keywords, 600)
  const { pagina, proximaPagina, paginaAnterior, resetar } = usePaginacao()

  const ref = parseRef(keywordsDebounced)
  const isRef = !ref.keywords

  // Quando não é referência, extrai termos significativos (remove stopwords)
  const termosApi = isRef ? undefined : (keywordsDebounced ? extrairTermos(keywordsDebounced) : undefined)
  // Mostra hint quando simplificação alterou a query
  const termosBuscados = !isRef && termosApi && termosApi !== keywordsDebounced.toLowerCase().trim()
    ? termosApi
    : undefined

  const { proposicoes, carregando, erro, temProxima, recarregar } = useProposicoes({
    siglaTipo: isRef ? ref.siglaTipo : (siglaTipo || undefined),
    numero: isRef ? ref.numero : undefined,
    ano: isRef ? ref.ano : (ano ? Number(ano) : undefined),
    autor: isRef ? undefined : (autorDebounced || undefined),
    keywords: termosApi,
    pagina,
  })

  function handleFiltro(setter: (v: string) => void) {
    return (v: string) => { setter(v); resetar() }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Proposições Legislativas</h1>
        <p className="text-gray-500 mt-1">Projetos de lei, PECs, medidas provisórias e demais proposições</p>
      </div>

      <ProposicaoFiltros
        siglaTipo={siglaTipo}
        ano={ano}
        autor={autor}
        keywords={keywords}
        termosBuscados={termosBuscados}
        onTipo={handleFiltro(setSiglaTipo)}
        onAno={handleFiltro(setAno)}
        onAutor={handleFiltro(setAutor)}
        onKeywords={handleFiltro(setKeywords)}
      />

      {carregando && <LoadingSpinner />}
      {erro && !carregando && <ErrorMessage mensagem={erro} onRetry={recarregar} />}

      {!carregando && !erro && proposicoes.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Nenhuma proposição encontrada com os filtros selecionados.
        </div>
      )}

      {!carregando && !erro && proposicoes.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposicoes.map((p) => <ProposicaoCard key={p.id} proposicao={p} />)}
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
