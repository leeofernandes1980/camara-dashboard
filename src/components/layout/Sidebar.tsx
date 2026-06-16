'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Vote, Receipt, X, Menu,
  FileText, Building2, Trophy, BarChart3, Wallet
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Home', icone: LayoutDashboard },
  { href: '/deputados', label: 'Deputados', icone: Users },
  { href: '/votacoes', label: 'Votações', icone: Vote },
  { href: '/proposicoes', label: 'Proposições', icone: FileText },
  { href: '/partidos', label: 'Partidos', icone: Building2 },
  { href: '/rankings', label: 'Rankings', icone: Trophy },
  { href: '/analise', label: 'Análise', icone: BarChart3 },
  { href: '/remuneracao', label: 'Remuneração', icone: Wallet },
  { href: '/cota-parlamentar', label: 'Cota Parlamentar', icone: Receipt },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg lg:hidden"
        onClick={() => setAberto(!aberto)}
      >
        {aberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {aberto && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setAberto(false)} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${aberto ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Câmara</p>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icone: Icone }) => {
            const ativo = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setAberto(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${ativo
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <Icone className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 leading-relaxed">
            Dados: dadosabertos.camara.leg.br<br />
            API v2 — Câmara dos Deputados
          </p>
        </div>
      </aside>
    </>
  )
}
