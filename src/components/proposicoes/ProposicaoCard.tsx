import Link from 'next/link'
import type { Proposicao } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import { truncarTexto } from '@/lib/utils'
import { FileText, ExternalLink } from 'lucide-react'

interface ProposicaoCardProps {
  proposicao: Proposicao
}

const corTipo: Record<string, 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'gray'> = {
  PL: 'blue', PEC: 'red', PDC: 'purple', MPV: 'orange',
  PLN: 'blue', PLP: 'blue', REQ: 'gray', INC: 'gray', RIC: 'gray', MSC: 'green',
}

export default function ProposicaoCard({ proposicao: p }: ProposicaoCardProps) {
  const cor = corTipo[p.siglaTipo] ?? 'gray'
  const urlCamara = `https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${p.id}`

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-3 hover:shadow-md hover:border-blue-300 transition-all">
      <div className="flex-shrink-0 mt-0.5">
        <FileText className="w-5 h-5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Badge texto={p.siglaTipo} cor={cor} />
          <span className="text-xs font-semibold text-gray-600">{p.numero}/{p.ano}</span>
          <a
            href={urlCamara}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0"
            title="Ver ficha completa e íntegra na Câmara"
          >
            <ExternalLink className="w-3 h-3" />
            Íntegra
          </a>
        </div>
        <Link href={`/proposicoes/${p.id}`} className="block group">
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 group-hover:text-blue-700 transition-colors">
            {truncarTexto(p.ementa, 200)}
          </p>
        </Link>
      </div>
    </div>
  )
}
