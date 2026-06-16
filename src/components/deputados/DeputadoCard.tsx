import Link from 'next/link'
import type { Deputado } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import AvatarImage from '@/components/ui/AvatarImage'

interface DeputadoCardProps {
  deputado: Deputado
}

export default function DeputadoCard({ deputado }: DeputadoCardProps) {
  return (
    <Link
      href={`/deputados/${deputado.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center gap-3 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        <AvatarImage src={deputado.urlFoto} alt={deputado.nome} size={80} />
      </div>
      <div className="text-center">
        <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{deputado.nome}</p>
        <p className="text-xs text-gray-500 mt-1">{deputado.email || 'Sem e-mail'}</p>
      </div>
      <div className="flex flex-wrap gap-1 justify-center">
        <Badge texto={deputado.siglaPartido} cor="blue" />
        <Badge texto={deputado.siglaUf} cor="gray" />
      </div>
    </Link>
  )
}
