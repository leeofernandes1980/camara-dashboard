import Link from 'next/link'
import type { Votacao } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { formatarData, formatarPlacar, truncarTexto } from '@/lib/utils'

interface VotacaoCardProps {
  votacao: Votacao
}

export default function VotacaoCard({ votacao }: VotacaoCardProps) {
  const aprovado = votacao.aprovacao === 1
  return (
    <Link
      href={`/votacoes/${votacao.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge texto={aprovado ? 'Aprovado' : 'Rejeitado'} cor={aprovado ? 'green' : 'red'} />
        <div className="flex items-center gap-2">
          <Badge texto={votacao.siglaOrgao || 'Plenário'} cor="blue" />
          <span className="text-xs text-gray-400">{formatarData(votacao.dataHoraRegistro || votacao.data)}</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed">
        {truncarTexto(votacao.descricao || votacao.proposicaoObjeto || 'Sem descrição', 150)}
      </p>

      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        <span className="text-xs font-medium text-green-600">Sim: {votacao.votosSim ?? 0}</span>
        <span className="text-gray-300">|</span>
        <span className="text-xs font-medium text-red-600">Não: {votacao.votosNao ?? 0}</span>
        <span className="text-gray-300">|</span>
        <span className="text-xs font-medium text-yellow-600">Outros: {votacao.votosOutros ?? 0}</span>
      </div>
    </Link>
  )
}
