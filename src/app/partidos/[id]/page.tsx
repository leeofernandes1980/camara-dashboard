export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchPartido, fetchMembrosPartido } from '@/lib/api'
import { Users, MapPin } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AvatarImage from '@/components/ui/AvatarImage'
import PartidoLogo from '@/components/ui/PartidoLogo'
import StatCard from '@/components/ui/StatCard'
import type { Deputado } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function PartidoContent({ id }: { id: number }) {
  const [resPartido, resMembros] = await Promise.allSettled([
    fetchPartido(id),
    fetchMembrosPartido(id, { itens: 100 }),
  ])

  if (resPartido.status === 'rejected') notFound()

  const partido = resPartido.value.dados
  const membrosRaw: Deputado[] = resMembros.status === 'fulfilled' ? resMembros.value.dados : []
  const membros = Array.from(new Map(membrosRaw.map((m) => [m.id, m])).values())

  const ufs: Record<string, number> = {}
  for (const m of membros) {
    ufs[m.siglaUf] = (ufs[m.siglaUf] || 0) + 1
  }
  const ufsOrdenadas = Object.entries(ufs).sort((a, b) => b[1] - a[1])

  const totalMembros = Number(partido.status?.totalMembros ?? membros.length)
  const lider = partido.status?.lider

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <PartidoLogo src={partido.urlLogo} sigla={partido.sigla} className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{partido.sigla}</h1>
            <p className="text-gray-500">{partido.nome}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard titulo="Total de Deputados" valor={totalMembros} icone={Users} cor="blue" />
          <StatCard titulo="Estados representados" valor={ufsOrdenadas.length} icone={MapPin} cor="green" />
          <StatCard titulo="Situação" valor={partido.status?.situacao ?? '—'} icone={Users} cor="purple" />
        </div>
      </div>

      {/* Líder */}
      {lider && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Líder do Partido</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <AvatarImage src={lider.urlFoto || ''} alt={lider.nome} size={48} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{lider.nome}</p>
              <div className="flex gap-2 mt-1">
                <Badge texto={lider.siglaPartido} cor="blue" />
                <Badge texto={lider.uf} cor="gray" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribuição por UF */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-3">Distribuição por Estado</h2>
        <div className="flex flex-wrap gap-2">
          {ufsOrdenadas.map(([uf, count]) => (
            <div key={uf} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-sm font-semibold text-gray-700">{uf}</span>
              <span className="text-xs text-gray-500">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Membros */}
      {membros.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Deputados ({membros.length}{totalMembros > membros.length ? ` de ${totalMembros}` : ''})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {membros.map((m) => (
              <Link
                key={m.id}
                href={`/deputados/${m.id}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
              >
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  <AvatarImage src={m.urlFoto} alt={m.nome} size={36} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.nome}</p>
                  <Badge texto={m.siglaUf} cor="gray" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function PartidoPage({ params }: PageProps) {
  const { id } = await params
  const idNum = Number(id)
  if (isNaN(idNum)) notFound()
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PartidoContent id={idNum} />
    </Suspense>
  )
}
