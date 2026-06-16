import Link from 'next/link'
import type { PartidoItem } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import PartidoLogo from '@/components/ui/PartidoLogo'
import { Users } from 'lucide-react'

interface PartidoCardProps {
  partido: PartidoItem
  totalDeputados?: number
  ufs?: string[]
}

export default function PartidoCard({ partido, totalDeputados, ufs }: PartidoCardProps) {
  return (
    <Link
      href={`/partidos/${partido.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <PartidoLogo src={partido.urlLogo} sigla={partido.sigla} className="w-10 h-10 object-contain" />
        </div>
        <div>
          <p className="font-bold text-gray-800">{partido.sigla}</p>
          <p className="text-xs text-gray-500 line-clamp-1">{partido.nome}</p>
        </div>
      </div>

      {totalDeputados !== undefined && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span><strong>{totalDeputados}</strong> deputado{totalDeputados !== 1 ? 's' : ''}</span>
        </div>
      )}

      {ufs && ufs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {ufs.slice(0, 6).map((uf) => <Badge key={uf} texto={uf} cor="gray" />)}
          {ufs.length > 6 && <span className="text-xs text-gray-400">+{ufs.length - 6}</span>}
        </div>
      )}
    </Link>
  )
}
