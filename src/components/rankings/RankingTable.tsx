import Link from 'next/link'
import AvatarImage from '@/components/ui/AvatarImage'
import Badge from '@/components/ui/Badge'
import { formatarMoeda } from '@/lib/utils'
import { Medal } from 'lucide-react'

export interface RankingItem {
  posicao: number
  id: number
  nome: string
  siglaPartido: string
  siglaUf: string
  urlFoto: string
  valor: number
  tipo: 'moeda' | 'numero'
}

interface RankingTableProps {
  items: RankingItem[]
  titulo?: string
}

const medalCor = (pos: number) => {
  if (pos === 1) return 'text-yellow-500'
  if (pos === 2) return 'text-gray-400'
  if (pos === 3) return 'text-amber-600'
  return 'text-gray-300'
}

export default function RankingTable({ items, titulo }: RankingTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      {titulo && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">{titulo}</h3>
        </div>
      )}
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-center px-3 py-3 text-xs font-semibold text-gray-600 uppercase w-12">#</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Deputado</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Partido</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">UF</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="even:bg-gray-50 hover:bg-blue-50/40">
              <td className="px-3 py-3 text-center">
                {item.posicao <= 3 ? (
                  <Medal className={`w-5 h-5 mx-auto ${medalCor(item.posicao)}`} />
                ) : (
                  <span className="text-gray-400 font-medium">{item.posicao}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link href={`/deputados/${item.id}`} className="flex items-center gap-2 hover:text-blue-600">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <AvatarImage src={item.urlFoto} alt={item.nome} size={32} />
                  </div>
                  <span className="font-medium text-gray-800 truncate max-w-[200px]">{item.nome}</span>
                </Link>
              </td>
              <td className="px-4 py-3"><Badge texto={item.siglaPartido} cor="blue" /></td>
              <td className="px-4 py-3"><Badge texto={item.siglaUf} cor="gray" /></td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">
                {item.tipo === 'moeda' ? formatarMoeda(item.valor) : item.valor.toLocaleString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
