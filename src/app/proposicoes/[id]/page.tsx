export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchProposicao, fetchAutoresProposicao, fetchTramitacoesProposicao } from '@/lib/api'
import { formatarData, truncarTexto } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { FileText, Calendar, Building2, Tag, Clock, ExternalLink } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

const corTipo: Record<string, 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'gray'> = {
  PL: 'blue', PEC: 'red', PLP: 'blue', PDC: 'purple', MPV: 'orange',
  PLN: 'blue', REQ: 'gray', RIC: 'gray', MSC: 'green', INC: 'gray',
}

async function ProposicaoContent({ id }: { id: number }) {
  const [resProp, resAutores, resTramit] = await Promise.allSettled([
    fetchProposicao(id),
    fetchAutoresProposicao(id),
    fetchTramitacoesProposicao(id),
  ])

  if (resProp.status === 'rejected') notFound()

  const prop = resProp.value.dados
  const autores = resAutores.status === 'fulfilled' ? resAutores.value.dados : []
  const tramitacoes = resTramit.status === 'fulfilled' ? resTramit.value.dados : []
  const status = prop.statusProposicao
  const cor = corTipo[prop.siglaTipo] ?? 'gray'
  const urlCamara = status?.url || `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${id}`

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Badge texto={prop.siglaTipo} cor={cor} />
          <span className="text-lg font-bold text-gray-600">{prop.numero}/{prop.ano}</span>
          <a
            href={urlCamara}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Ver íntegra na Câmara
          </a>
        </div>

        <p className="text-gray-800 text-base leading-relaxed">{prop.ementa}</p>

        {prop.ementaDetalhada && prop.ementaDetalhada !== prop.ementa && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{prop.ementaDetalhada}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {prop.dataApresentacao && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Apresentada em: <strong>{formatarData(prop.dataApresentacao)}</strong></span>
            </div>
          )}
          {status?.siglaOrgao && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>Órgão atual: <strong>{status.siglaOrgao}</strong></span>
            </div>
          )}
          {status?.regime && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Regime: <strong>{status.regime}</strong></span>
            </div>
          )}
          {status?.apreciacao && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Apreciação: <strong>{status.apreciacao}</strong></span>
            </div>
          )}
        </div>

        {prop.keywords && (
          <div className="mt-4 flex items-start gap-2">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {prop.keywords.split(/[,;]/).map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status atual */}
      {status && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Situação Atual</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            {status.descricaoSituacao && (
              <p className="text-sm font-medium text-blue-800">{status.descricaoSituacao}</p>
            )}
            {status.descricaoTramitacao && (
              <p className="text-sm text-blue-700">{status.descricaoTramitacao}</p>
            )}
            {status.despacho && (
              <p className="text-sm text-blue-600 italic">&ldquo;{truncarTexto(status.despacho, 300)}&rdquo;</p>
            )}
            {status.dataHora && (
              <p className="text-xs text-blue-500">Atualizado em: {formatarData(status.dataHora)}</p>
            )}
          </div>
        </div>
      )}

      {/* Autores */}
      {autores.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Autores ({autores.length})</h2>
          <div className="flex flex-wrap gap-2">
            {autores.map((a, i) => {
              const idMatch = a.uri?.match(/\/(\d+)$/)
              const depId = idMatch ? idMatch[1] : null
              return depId ? (
                <Link
                  key={i}
                  href={`/deputados/${depId}`}
                  className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {a.nome}
                  {a.proponente === 1 && <span className="ml-1 text-xs text-blue-500">(principal)</span>}
                </Link>
              ) : (
                <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  {a.nome}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Tramitação */}
      {tramitacoes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Histórico de Tramitação ({tramitacoes.length} registros)
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tramitacoes.slice().reverse().map((t, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 text-xs text-gray-400 w-20 pt-0.5">
                  {formatarData(t.dataHora)}
                </div>
                <div className="flex-1 border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-700">{t.siglaOrgao}</p>
                    {t.url && (
                      <a href={t.url} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700" title="Ver texto">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {t.descricaoTramitacao && (
                    <p className="text-gray-500">{t.descricaoTramitacao}</p>
                  )}
                  {t.despacho && (
                    <p className="text-gray-400 text-xs mt-0.5">{truncarTexto(t.despacho, 150)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function ProposicaoPage({ params }: PageProps) {
  const { id } = await params
  const idNum = Number(id)
  if (isNaN(idNum)) notFound()
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProposicaoContent id={idNum} />
    </Suspense>
  )
}
