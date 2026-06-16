import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  mensagem: string
  onRetry?: () => void
}

export default function ErrorMessage({ mensagem, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-6 h-6" />
        <span className="font-medium">Ocorreu um erro</span>
      </div>
      <p className="text-gray-500 text-sm text-center max-w-md">{mensagem}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
