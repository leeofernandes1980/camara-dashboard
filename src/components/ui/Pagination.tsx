import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  paginaAtual: number
  temProxima: boolean
  onAnterior: () => void
  onProxima: () => void
}

export default function Pagination({ paginaAtual, temProxima, onAnterior, onProxima }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        onClick={onAnterior}
        disabled={paginaAtual === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>
      <span className="text-sm text-gray-600">Página {paginaAtual}</span>
      <button
        onClick={onProxima}
        disabled={!temProxima}
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Próxima
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
