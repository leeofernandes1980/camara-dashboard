import Link from 'next/link'
import type { Deputado } from '@/lib/types'
import Badge from '@/components/ui/Badge'
import AvatarImage from '@/components/ui/AvatarImage'

interface DeputadoTableProps {
  deputados: Deputado[]
}

export default function DeputadoTable({ deputados }: DeputadoTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deputado</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Partido</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">UF</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Legislatura</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {deputados.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50 even:bg-gray-50/50">
              <td className="px-4 py-3">
                <Link href={`/deputados/${d.id}`} className="flex items-center gap-3 hover:text-blue-600">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <AvatarImage src={d.urlFoto} alt={d.nome} size={32} />
                  </div>
                  <span className="font-medium text-gray-800">{d.nome}</span>
                </Link>
              </td>
              <td className="px-4 py-3"><Badge texto={d.siglaPartido} cor="blue" /></td>
              <td className="px-4 py-3"><Badge texto={d.siglaUf} cor="gray" /></td>
              <td className="px-4 py-3 text-gray-600">{d.idLegislatura}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
