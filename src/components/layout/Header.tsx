'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const rotulos: Record<string, string> = {
  '': 'Home',
  deputados: 'Deputados',
  votacoes: 'Votações',
  'cota-parlamentar': 'Cota Parlamentar',
}

export default function Header() {
  const pathname = usePathname()
  const segmentos = pathname.split('/').filter(Boolean)

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center gap-2">
      <Link href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
        Home
      </Link>
      {segmentos.map((seg, i) => {
        const href = '/' + segmentos.slice(0, i + 1).join('/')
        const label = rotulos[seg] ?? seg
        const ultimo = i === segmentos.length - 1
        return (
          <span key={href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {ultimo ? (
              <span className="text-sm font-semibold text-gray-800">{label}</span>
            ) : (
              <Link href={href} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </header>
  )
}
