import type { Despesa } from '@/lib/types'
import { formatarData, formatarMoeda } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface GastosTableProps {
  despesas: Despesa[]
}

export default function GastosTable({ despesas }: GastosTableProps) {
  if (despesas.length === 0) {
    return <p className="text-gray-400 text-sm py-8 text-center">Nenhuma despesa encontrada</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm min-w-[700px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Data</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Descrição</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fornecedor</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">CNPJ/CPF</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Valor</th>
            <th className="text-center px-3 py-3 text-xs font-semibold text-gray-600 uppercase">Doc.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {despesas.map((d, i) => (
            <tr key={`${d.codDocumento}-${i}`} className="even:bg-gray-50 hover:bg-blue-50/50">
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatarData(d.dataDocumento)}
              </td>
              <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{d.tipoDespesa}</td>
              <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{d.nomeFornecedor || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{d.cnpjCpfFornecedor || '—'}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-800 whitespace-nowrap">
                {formatarMoeda(d.valorLiquido)}
              </td>
              <td className="px-3 py-3 text-center">
                {d.urlDocumento ? (
                  <a
                    href={d.urlDocumento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center justify-center"
                    title="Ver comprovante"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
