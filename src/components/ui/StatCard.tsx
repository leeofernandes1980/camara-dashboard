import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  titulo: string
  valor: string | number
  icone: LucideIcon
  cor?: 'blue' | 'green' | 'purple' | 'orange'
}

const corClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  green: { bg: 'bg-green-50', icon: 'text-green-600' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-600' },
}

export default function StatCard({ titulo, valor, icone: Icone, cor = 'blue' }: StatCardProps) {
  const cores = corClasses[cor]
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${cores.bg}`}>
        <Icone className={`w-6 h-6 ${cores.icon}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{titulo}</p>
        <p className="text-2xl font-bold text-gray-800">{valor}</p>
      </div>
    </div>
  )
}
