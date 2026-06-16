import type { Orientacao } from '@/lib/types'
import Badge from '@/components/ui/Badge'

interface OrientacoesTableProps {
  orientacoes: Orientacao[]
}

function corOrientacao(orientacao: string): 'green' | 'red' | 'yellow' | 'gray' | 'blue' | 'orange' {
  const o = orientacao?.toUpperCase()
  if (o === 'SIM') return 'green'
  if (o === 'NÃO' || o === 'NAO') return 'red'
  if (o === 'OBSTRUÇÃO' || o === 'OBSTRUCAO') return 'orange'
  if (o === 'ABSTENÇÃO' || o === 'ABSTENCAO') return 'yellow'
  if (o === 'LIBERADO') return 'blue'
  return 'gray'
}

export default function OrientacoesTable({ orientacoes }: OrientacoesTableProps) {
  if (orientacoes.length === 0) {
    return <p className="text-gray-400 text-sm py-4 text-center">Sem orientações registradas</p>
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Bancada / Partido</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Orientação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orientacoes.map((o, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{o.siglaPartidoBloco}</td>
              <td className="px-4 py-3">
                <Badge texto={o.orientacao} cor={corOrientacao(o.orientacao)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
