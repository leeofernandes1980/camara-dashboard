interface BadgeProps {
  texto: string
  cor?: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange'
}

const corClasses: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
}

export default function Badge({ texto, cor = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${corClasses[cor]}`}>
      {texto}
    </span>
  )
}
